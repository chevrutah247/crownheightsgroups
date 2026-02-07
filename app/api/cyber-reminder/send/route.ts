import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const REMINDER_KEY = 'cyber:reminder:subscribers';
const RESEND_API_KEY = process.env.RESEND_API_KEY;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.log('Cron job running');
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
        
        if (now >= nextReminder) {
          const sent = await sendReminderEmail(email);
          
          if (sent) {
            data.lastReminderSent = now.toISOString();
            data.nextReminderDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
            await redis.hset(REMINDER_KEY, { [email]: JSON.stringify(data) });
            sentCount++;
          }
        }
      } catch (err) {
        errors.push(`Error: ${email}`);
      }
    }

    return NextResponse.json({ sent: sentCount, total: Object.keys(subscribers).length });
  } catch (error) {
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 });
  }
}

async function sendReminderEmail(email: string): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.log(`[DRY RUN] Would send to: ${email}`);
    return true;
  }

  const html = buildEmailHtml(email);

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Crown Heights Groups <security@crownheightsgroups.com>',
        to: email,
        subject: '🛡️ Monthly Security Checkup - Protect Yourself from Scammers',
        html
      })
    });

    return response.ok;
  } catch (error) {
    console.error(`Failed to send to ${email}:`, error);
    return false;
  }
}

function buildEmailHtml(email: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 15px; background: #f0f4f8;">
  
  <!-- HEADER -->
  <div style="background: linear-gradient(135deg, #1e3a5f, #3b82f6); padding: 35px 25px; border-radius: 20px 20px 0 0; text-align: center;">
    <div style="font-size: 65px; margin-bottom: 15px;">🛡️🔒</div>
    <h1 style="color: white; margin: 0; font-size: 30px;">Monthly Security Checkup</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 12px 0 0 0; font-size: 18px;">from <strong>CrownHeightsGroups.com</strong></p>
  </div>
  
  <div style="background: white; padding: 35px 30px; border-radius: 0 0 20px 20px;">
    
    <p style="font-size: 21px; color: #333; line-height: 1.7; margin: 0 0 30px 0;">
      Hello! 👋<br><br>
      It's time for your <strong>monthly security checkup</strong>!<br>
      Follow these 4 simple steps to protect yourself from scammers.
    </p>

    <!-- ===== STEP 1: DO NOT CALL ===== -->
    <div style="background: #ede9fe; border: 3px solid #8b5cf6; border-radius: 20px; padding: 25px; margin-bottom: 25px;">
      <h2 style="color: #5b21b6; margin: 0 0 15px 0; font-size: 24px;">
        📵 STEP 1: Stop Unwanted Phone Calls
      </h2>
      
      <div style="background: #f5f3ff; border-radius: 12px; padding: 15px; margin-bottom: 15px;">
        <p style="margin: 0; font-size: 17px; color: #333; line-height: 1.6;">
          ✅ <strong>You only need to do this ONCE — it lasts forever!</strong><br>
          Register on the National Do Not Call list to reduce spam calls. It's FREE!
        </p>
      </div>
      
      <div style="background: white; border-radius: 15px; padding: 20px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 15px 0; color: #1e3a5f; font-size: 19px;">📋 Step-by-Step Instructions:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 10px 0; font-size: 17px; border-bottom: 1px solid #e5e7eb; color: #333;">
            <strong>1.</strong> Click the purple button below
          </td></tr>
          <tr><td style="padding: 10px 0; font-size: 17px; border-bottom: 1px solid #e5e7eb; color: #333;">
            <strong>2.</strong> Click <strong>"Register Your Phone"</strong>
          </td></tr>
          <tr><td style="padding: 10px 0; font-size: 17px; border-bottom: 1px solid #e5e7eb; color: #333;">
            <strong>3.</strong> Type your <strong>phone number</strong>
          </td></tr>
          <tr><td style="padding: 10px 0; font-size: 17px; border-bottom: 1px solid #e5e7eb; color: #333;">
            <strong>4.</strong> Type your <strong>email address</strong>
          </td></tr>
          <tr><td style="padding: 10px 0; font-size: 17px; border-bottom: 1px solid #e5e7eb; color: #333;">
            <strong>5.</strong> Click <strong>"Submit"</strong>
          </td></tr>
          <tr><td style="padding: 10px 0; font-size: 17px; color: #333;">
            <strong>6.</strong> Check your email and click the confirmation link
          </td></tr>
        </table>
      </div>
      
      <a href="https://www.donotcall.gov/" style="display: block; text-align: center; padding: 20px; background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; border-radius: 15px; text-decoration: none; font-size: 20px; font-weight: bold;">
        📵 Register at DoNotCall.gov →
      </a>
    </div>

    <!-- ===== STEP 2: SCAN COMPUTER ===== -->
    <div style="background: #eff6ff; border: 3px solid #3b82f6; border-radius: 20px; padding: 25px; margin-bottom: 25px;">
      <h2 style="color: #1d4ed8; margin: 0 0 15px 0; font-size: 24px;">
        🖥️ STEP 2: Scan Your Windows Computer
      </h2>
      
      <p style="font-size: 17px; color: #333; margin: 0 0 20px 0;">
        Run these <strong>TWO free scans</strong> to find and remove viruses:
      </p>
      
      <!-- MRT -->
      <div style="background: white; border-radius: 15px; padding: 20px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 15px 0; color: #0369a1; font-size: 19px;">🛠️ Scan #1: Windows MRT (Already on your computer!)</h3>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 10px 0; font-size: 17px; border-bottom: 1px solid #e5e7eb; color: #333;">
            <strong>1.</strong> On your keyboard, press and hold the <strong>Windows key ⊞</strong> then press <strong>R</strong>
          </td></tr>
          <tr><td style="padding: 10px 0; font-size: 17px; border-bottom: 1px solid #e5e7eb; color: #333;">
            <strong>2.</strong> A small box appears. Type: <code style="background: #1e3a5f; color: white; padding: 4px 12px; border-radius: 5px; font-size: 19px;">mrt</code>
          </td></tr>
          <tr><td style="padding: 10px 0; font-size: 17px; border-bottom: 1px solid #e5e7eb; color: #333;">
            <strong>3.</strong> Press <strong>Enter</strong> on your keyboard
          </td></tr>
          <tr><td style="padding: 10px 0; font-size: 17px; border-bottom: 1px solid #e5e7eb; color: #333;">
            <strong>4.</strong> Click <strong>"Next"</strong>
          </td></tr>
          <tr><td style="padding: 10px 0; font-size: 17px; border-bottom: 1px solid #e5e7eb; color: #333;">
            <strong>5.</strong> Select <strong>"Full scan"</strong> and click Next
          </td></tr>
          <tr><td style="padding: 10px 0; font-size: 17px; color: #333;">
            <strong>6.</strong> Wait 30-60 minutes for scan to complete
          </td></tr>
        </table>
      </div>
      
      <!-- Dr.Web -->
      <div style="background: #f0fdf4; border: 2px solid #22c55e; border-radius: 15px; padding: 20px;">
        <h3 style="margin: 0 0 15px 0; color: #166534; font-size: 19px;">🩺 Scan #2: Dr.Web CureIt! (Free Download)</h3>
        
        <p style="font-size: 16px; color: #666; margin: 0 0 15px 0;">
          This powerful scanner finds viruses that other programs miss. No installation needed!
        </p>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
          <tr><td style="padding: 8px 0; font-size: 17px; border-bottom: 1px solid #dcfce7; color: #333;">
            <strong>1.</strong> Click the green button below
          </td></tr>
          <tr><td style="padding: 8px 0; font-size: 17px; border-bottom: 1px solid #dcfce7; color: #333;">
            <strong>2.</strong> Click "Download" on the website
          </td></tr>
          <tr><td style="padding: 8px 0; font-size: 17px; border-bottom: 1px solid #dcfce7; color: #333;">
            <strong>3.</strong> Open the downloaded file
          </td></tr>
          <tr><td style="padding: 8px 0; font-size: 17px; color: #333;">
            <strong>4.</strong> Click <strong>"Start scan"</strong> and wait
          </td></tr>
        </table>
        
        <a href="https://free.drweb.com/download+cureit+free/" style="display: block; text-align: center; padding: 18px; background: linear-gradient(135deg, #22c55e, #16a34a); color: white; border-radius: 12px; text-decoration: none; font-size: 19px; font-weight: bold;">
          ⬇️ Download Dr.Web CureIt! (Free) →
        </a>
      </div>
    </div>

    <!-- ===== STEP 3: CHECK EMAIL ===== -->
    <div style="background: #fef2f2; border: 3px solid #dc2626; border-radius: 20px; padding: 25px; margin-bottom: 25px;">
      <h2 style="color: #991b1b; margin: 0 0 15px 0; font-size: 24px;">
        📧 STEP 3: Check If Your Email Was Stolen!
      </h2>
      
      <div style="background: #fecaca; border-radius: 12px; padding: 15px; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 18px; color: #7f1d1d; line-height: 1.6;">
          ⚠️ <strong>WARNING:</strong> Hackers steal millions of email addresses every year. If yours was stolen, they might know your password!
        </p>
      </div>
      
      <div style="background: white; border-radius: 15px; padding: 20px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 15px 0; color: #1e3a5f; font-size: 19px;">📋 How to check your email:</h3>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 10px 0; font-size: 17px; border-bottom: 1px solid #fecaca; color: #333;">
            <strong>1.</strong> Click the red button below
          </td></tr>
          <tr><td style="padding: 10px 0; font-size: 17px; border-bottom: 1px solid #fecaca; color: #333;">
            <strong>2.</strong> Type your email address in the box
          </td></tr>
          <tr><td style="padding: 10px 0; font-size: 17px; border-bottom: 1px solid #fecaca; color: #333;">
            <strong>3.</strong> Click the <strong>"pwned?"</strong> button
          </td></tr>
          <tr><td style="padding: 10px 0; font-size: 17px; color: #333;">
            <strong>4.</strong> Check the result:<br>
            <span style="margin-left: 25px;">🟢 <strong>GREEN</strong> = You're safe! Great!</span><br>
            <span style="margin-left: 25px;">🔴 <strong>RED</strong> = Email was stolen! <strong>Change password NOW!</strong></span>
          </td></tr>
        </table>
      </div>
      
      <a href="https://haveibeenpwned.com/" style="display: block; text-align: center; padding: 20px; background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; border-radius: 15px; text-decoration: none; font-size: 20px; font-weight: bold; margin-bottom: 20px;">
        📧 Check My Email Now →
      </a>
      
      <!-- Gmail Password Change -->
      <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 15px; padding: 20px;">
        <h3 style="margin: 0 0 15px 0; color: #92400e; font-size: 19px;">🔑 If email was leaked — Change Your Gmail Password:</h3>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
          <tr><td style="padding: 8px 0; font-size: 16px; border-bottom: 1px solid #fde68a; color: #333;">
            <strong>1.</strong> Click the orange button below
          </td></tr>
          <tr><td style="padding: 8px 0; font-size: 16px; border-bottom: 1px solid #fde68a; color: #333;">
            <strong>2.</strong> Sign in if asked
          </td></tr>
          <tr><td style="padding: 8px 0; font-size: 16px; border-bottom: 1px solid #fde68a; color: #333;">
            <strong>3.</strong> Enter your <strong>current</strong> password
          </td></tr>
          <tr><td style="padding: 8px 0; font-size: 16px; border-bottom: 1px solid #fde68a; color: #333;">
            <strong>4.</strong> Create a <strong>NEW strong password</strong>
          </td></tr>
          <tr><td style="padding: 8px 0; font-size: 16px; color: #333;">
            <strong>5.</strong> Click <strong>"Change Password"</strong>
          </td></tr>
        </table>
        
        <p style="margin: 0 0 15px 0; font-size: 15px; color: #78350f;">
          💡 <strong>Strong password example:</strong> <code style="background: #fef9c3; padding: 4px 10px; border-radius: 5px;">Shabbat$Shalom2024!</code><br>
          Use 12+ characters with UPPERCASE, lowercase, numbers, and symbols!
        </p>
        
        <a href="https://myaccount.google.com/signinoptions/password" style="display: block; text-align: center; padding: 16px; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; border-radius: 12px; text-decoration: none; font-size: 17px; font-weight: bold;">
          🔑 Change Gmail Password →
        </a>
      </div>
    </div>

    <!-- ===== STEP 4: DON'T CLICK LINKS ===== -->
    <div style="background: #faf5ff; border: 3px solid #7c3aed; border-radius: 20px; padding: 25px; margin-bottom: 25px;">
      <h2 style="color: #5b21b6; margin: 0 0 15px 0; font-size: 24px;">
        🔗 STEP 4: NEVER Click Suspicious Links!
      </h2>
      
      <div style="background: #fee2e2; border-radius: 12px; padding: 15px; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 18px; color: #7f1d1d; line-height: 1.7;">
          🚨 <strong>DANGER!</strong> Scammers send bad links through:<br>
          • Email • Text messages • WhatsApp • Facebook<br><br>
          If you click a bad link, <strong>hackers can steal your money and take control of your computer!</strong>
        </p>
      </div>
      
      <div style="background: white; border-radius: 15px; padding: 20px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 15px 0; color: #1e3a5f; font-size: 19px;">📋 How to check if a link is safe:</h3>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 10px 0; font-size: 17px; border-bottom: 1px solid #e9d5ff; color: #333;">
            <strong>1.</strong> <strong>DON'T CLICK</strong> the suspicious link!
          </td></tr>
          <tr><td style="padding: 10px 0; font-size: 17px; border-bottom: 1px solid #e9d5ff; color: #333;">
            <strong>2.</strong> <strong>Right-click</strong> on the link → select <strong>"Copy link"</strong>
          </td></tr>
          <tr><td style="padding: 10px 0; font-size: 17px; border-bottom: 1px solid #e9d5ff; color: #333;">
            <strong>3.</strong> Go to <strong>VirusTotal.com</strong> (click button below)
          </td></tr>
          <tr><td style="padding: 10px 0; font-size: 17px; border-bottom: 1px solid #e9d5ff; color: #333;">
            <strong>4.</strong> Click the <strong>"URL"</strong> tab
          </td></tr>
          <tr><td style="padding: 10px 0; font-size: 17px; border-bottom: 1px solid #e9d5ff; color: #333;">
            <strong>5.</strong> <strong>Paste</strong> the link (press Ctrl+V) and press Enter
          </td></tr>
          <tr><td style="padding: 10px 0; font-size: 17px; color: #333;">
            <strong>6.</strong> Look at results:<br>
            <span style="margin-left: 25px;">✅ All green = Safe to click</span><br>
            <span style="margin-left: 25px;">🚩 <strong>Even ONE red flag = DON'T CLICK!</strong></span>
          </td></tr>
        </table>
      </div>
      
      <div style="background: #fef3c7; border-radius: 12px; padding: 15px; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 17px; color: #92400e; line-height: 1.6;">
          💡 <strong>PRO TIP:</strong> You can also upload <strong>PDF files</strong> and <strong>attachments</strong> to VirusTotal to check if they have viruses!
        </p>
      </div>
      
      <a href="https://www.virustotal.com/gui/home/url" style="display: block; text-align: center; padding: 20px; background: linear-gradient(135deg, #7c3aed, #5b21b6); color: white; border-radius: 15px; text-decoration: none; font-size: 20px; font-weight: bold;">
        🔍 Check Links on VirusTotal →
      </a>
    </div>

    <!-- ===== RECENT SCAM ALERTS ===== -->
    <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 15px; padding: 20px; margin-bottom: 25px;">
      <h3 style="margin: 0 0 15px 0; color: #92400e; font-size: 20px;">🚨 Recent FBI Scam Alerts:</h3>
      <ul style="margin: 0; padding-left: 25px; font-size: 16px; line-height: 2; color: #333;">
        <li><strong>QR Code Scams</strong> — Don't scan random QR codes!</li>
        <li><strong>Fake Tech Support</strong> — Microsoft will NEVER call you!</li>
        <li><strong>AI Voice Cloning</strong> — Scammers can fake voices of family members</li>
        <li><strong>Cryptocurrency Scams</strong> — If it sounds too good, it's fake!</li>
      </ul>
      <p style="margin: 15px 0 0 0;"><a href="https://www.ic3.gov/PSA" style="color: #92400e; font-weight: bold;">→ See all FBI scam alerts</a></p>
    </div>

    <!-- ===== FOOTER ===== -->
    <div style="text-align: center; padding-top: 25px; border-top: 2px solid #e5e7eb;">
      <p style="font-size: 18px; color: #333; margin: 0 0 20px 0;">
        📚 For complete guide with pictures, visit:
      </p>
      <a href="https://crownheightsgroups.com/cyber-safety" style="display: inline-block; padding: 20px 40px; background: linear-gradient(135deg, #1e3a5f, #3b82f6); color: white; border-radius: 15px; text-decoration: none; font-size: 22px; font-weight: bold;">
        🛡️ CrownHeightsGroups.com/cyber-safety
      </a>
      
      <p style="font-size: 15px; color: #666; margin: 30px 0 0 0; line-height: 1.6;">
        This is your monthly security reminder from <strong>Crown Heights Groups</strong>.<br>
        Stay safe! 💙
      </p>
      
      <p style="font-size: 13px; color: #999; margin: 20px 0 0 0;">
        <a href="https://crownheightsgroups.com/api/cyber-reminder/unsubscribe?email=${encodeURIComponent(email)}" style="color: #999;">
          Unsubscribe from these reminders
        </a>
      </p>
    </div>
    
  </div>
</body>
</html>`;
}
