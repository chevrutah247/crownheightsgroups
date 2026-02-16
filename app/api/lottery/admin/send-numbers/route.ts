// app/api/lottery/admin/send-numbers/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { poolWeekId } = await request.json();

    if (!poolWeekId) {
      return NextResponse.json({ error: 'Pool week ID required' }, { status: 400 });
    }

    // Get pool week with numbers
    const { data: poolWeek, error: poolError } = await supabase
      .from('pool_weeks')
      .select('*')
      .eq('id', poolWeekId)
      .single();

    if (poolError || !poolWeek) {
      return NextResponse.json({ error: 'Pool week not found' }, { status: 404 });
    }

    if (!poolWeek.admin_numbers) {
      return NextResponse.json({ error: 'No numbers entered yet' }, { status: 400 });
    }

    // Get all participants
    const { data: entries, error: entriesError } = await supabase
      .from('pool_entries')
      .select(`
        *,
        lottery_users (
          email,
          first_name
        )
      `)
      .eq('pool_week_id', poolWeekId)
      .eq('status', 'paid');

    if (entriesError) {
      return NextResponse.json({ error: entriesError.message }, { status: 500 });
    }

    if (!entries || entries.length === 0) {
      return NextResponse.json({ error: 'No participants to email' }, { status: 400 });
    }

    // Format numbers for email
    const numbersHtml = poolWeek.admin_numbers
      .split('\n')
      .filter((line: string) => line.trim())
      .map((line: string) => `<div style="font-family: monospace; padding: 8px; background: #fff; border-radius: 4px; margin-bottom: 4px;">${line}</div>`)
      .join('');

    // Send emails to all participants
    let sent = 0;
    for (const entry of entries) {
      const user = entry.lottery_users;
      if (!user?.email) continue;

      try {
        await resend.emails.send({
          from: 'Lottery Pool <lottery@crownheightsgroups.com>',
          to: user.email,
          subject: '🎰 Your Lottery Numbers This Week!',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
            </head>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f0f4f8;">
              <div style="background: linear-gradient(135deg, #1e3a5f, #3b82f6); border-radius: 16px; padding: 30px; text-align: center; color: white;">
                <h1 style="margin: 0; font-size: 28px;">🎰 Lottery Pool Numbers</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Your numbers for this week!</p>
              </div>

              <div style="background: white; border-radius: 16px; padding: 30px; margin-top: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                <p style="font-size: 18px; color: #333;">
                  Hello <strong>${user.first_name}</strong>! 👋
                </p>
                <p style="font-size: 16px; color: #666; line-height: 1.6;">
                  Great news! Here are all the lottery numbers we're playing this week:
                </p>

                <div style="background: #fef3c7; border: 2px solid #fcd34d; border-radius: 12px; padding: 20px; margin: 20px 0;">
                  <h3 style="color: #92400e; margin: 0 0 15px 0;">🎱 Our Numbers:</h3>
                  ${numbersHtml}
                </div>

                <div style="background: #f0fdf4; border: 2px solid #86efac; border-radius: 12px; padding: 15px; margin: 20px 0;">
                  <p style="color: #166534; margin: 0; font-size: 14px;">
                    ✅ <strong>${poolWeek.total_participants || entries.length}</strong> participants in this week's pool<br>
                    💰 Total pool: <strong>$${(poolWeek.total_amount || entries.length * 3).toFixed(2)}</strong>
                  </p>
                </div>

                <p style="font-size: 16px; color: #666; line-height: 1.6;">
                  <strong>Drawing dates:</strong><br>
                  🔵 Mega Millions: Tuesday & Friday at 11 PM ET<br>
                  🔴 Powerball: Monday, Wednesday & Saturday at 10:59 PM ET
                </p>

                <p style="font-size: 16px; color: #666; line-height: 1.6;">
                  We'll notify you immediately if we win anything! 🤞
                </p>

                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                  <p style="color: #999; font-size: 12px; margin: 0;">
                    Medinat Hesed LLC - Lottery Pool<br>
                    <a href="https://crownheightsgroups.com/lottery" style="color: #3b82f6;">crownheightsgroups.com/lottery</a>
                  </p>
                </div>
              </div>
            </body>
            </html>
          `,
        });
        sent++;
      } catch (emailError) {
        console.error('Failed to send to:', user.email, emailError);
      }
    }

    // Update pool status and stats
    await supabase
      .from('pool_weeks')
      .update({
        status: 'numbers_sent',
        total_participants: entries.length,
        total_amount: entries.reduce((sum, e) => sum + (e.amount_paid || 0), 0),
      })
      .eq('id', poolWeekId);

    return NextResponse.json({ success: true, sent });

  } catch (error: any) {
    console.error('Error sending numbers:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
