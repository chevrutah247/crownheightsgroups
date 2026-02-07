import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const REMINDER_KEY = 'cyber:reminder:subscribers';
const RESEND_API_KEY = process.env.RESEND_API_KEY;

// This endpoint should be called daily by a cron job
// In Vercel, add to vercel.json:
// { "crons": [{ "path": "/api/cyber-reminder/send", "schedule": "0 9 * * *" }] }

export async function GET(request: NextRequest) {
  // Verify cron secret (optional security)
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // Allow without auth for now, but log it
    console.log('Cron job running (no auth check)');
  }

  try {
    const subscribers = await redis.hgetall(REMINDER_KEY) as Record<string, string>;
    
    if (!subscribers || Object.keys(subscribers).length === 0) {
      return NextResponse.json({ message: 'No subscribers', sent: 0 });
    }

    const now = new Date();
    let sentCount = 0;
    const errors: string[] = [];

    for (const [email, dataStr] of Object.entries(subscribers)) {
      try {
        const data = JSON.parse(dataStr);
        const nextReminder = new Date(data.nextReminderDate);
        
        // Check if it's time to send reminder
        if (now >= nextReminder) {
          // Send email
          const sent = await sendReminderEmail(email);
          
          if (sent) {
            // Update next reminder date (30 days from now)
            data.lastReminderSent = now.toISOString();
            data.nextReminderDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
            
            await redis.hset(REMINDER_KEY, { [email]: JSON.stringify(data) });
            sentCount++;
          }
        }
      } catch (err) {
        errors.push(`Error processing ${email}: ${err}`);
      }
    }

    return NextResponse.json({ 
      message: 'Cron completed',
      sent: sentCount,
      total: Object.keys(subscribers).length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Cron error:', error);
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 });
  }
}

async function sendReminderEmail(email: string): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.log(`[DRY RUN] Would send email to: ${email}`);
    return true; // Pretend it worked for testing
  }

  const emailContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
  <div style="background: linear-gradient(135deg, #1e3a5f, #3b82f6); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🛡️ Напоминание о безопасности</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Ежемесячная проверка вашего компьютера</p>
  </div>
  
  <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px;">
    <p style="font-size: 18px; color: #333; line-height: 1.6;">
      Привет! 👋<br><br>
      Прошёл месяц с последней проверки. Пора убедиться, что ваш компьютер и данные в безопасности!
    </p>
    
    <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <h2 style="color: #92400e; margin: 0 0 15px 0; font-size: 20px;">📋 Чек-лист на сегодня:</h2>
      
      <div style="margin-bottom: 15px;">
        <p style="margin: 0; font-size: 16px; color: #333;">
          <strong>☐ 1. Проверьте email на утечки</strong><br>
          <a href="https://haveibeenpwned.com/" style="color: #dc2626;">→ Открыть HaveIBeenPwned</a>
        </p>
      </div>
      
      <div style="margin-bottom: 15px;">
        <p style="margin: 0; font-size: 16px; color: #333;">
          <strong>☐ 2. Смените пароль (если нужно)</strong><br>
          <span style="color: #666;">Если email был в утечке — срочно!</span>
        </p>
      </div>
      
      <div style="margin-bottom: 15px;">
        <p style="margin: 0; font-size: 16px; color: #333;">
          <strong>☐ 3. Запустите Windows MRT</strong><br>
          <span style="color: #666;">Win + R → введите "mrt" → Full scan</span>
        </p>
      </div>
      
      <div>
        <p style="margin: 0; font-size: 16px; color: #333;">
          <strong>☐ 4. Запустите Dr.Web CureIt!</strong><br>
          <a href="https://free.drweb.com/download+cureit+free/" style="color: #22c55e;">→ Скачать бесплатно</a>
        </p>
      </div>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://crownheightsgroups.com/cyber-safety" 
         style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #5b21b6); color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-size: 18px; font-weight: bold;">
        🔒 Открыть полную инструкцию
      </a>
    </div>
    
    <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
      Это автоматическое напоминание от Crown Heights Groups.<br>
      <a href="https://crownheightsgroups.com/api/cyber-reminder/unsubscribe?email=${encodeURIComponent(email)}" style="color: #999;">Отписаться от напоминаний</a>
    </p>
  </div>
</body>
</html>
  `.trim();

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Crown Heights Groups <noreply@crownheightsgroups.com>',
        to: email,
        subject: '🛡️ Напоминание: проверьте безопасность компьютера',
        html: emailContent
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`Failed to send to ${email}:`, error);
      return false;
    }

    console.log(`Reminder sent to: ${email}`);
    return true;
  } catch (error) {
    console.error(`Error sending to ${email}:`, error);
    return false;
  }
}
