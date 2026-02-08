// app/api/lottery/send-confirmation/route.ts
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, firstName, poolWeekEnd, referralCode } = await request.json();

    if (!email || !firstName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const weekEndDate = new Date(poolWeekEnd).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const referralLink = `https://crownheightsgroups.com/lottery/join?ref=${referralCode}`;

    await resend.emails.send({
      from: 'Lottery Pool <lottery@crownheightsgroups.com>',
      to: email,
      subject: '🎉 You\'re In! Lottery Pool Confirmation',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f0f4f8;">
          <div style="background: linear-gradient(135deg, #1e3a5f, #3b82f6); border-radius: 16px; padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">🎉 You're In!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Welcome to the Lottery Pool</p>
          </div>

          <div style="background: white; border-radius: 16px; padding: 30px; margin-top: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            <p style="font-size: 18px; color: #333;">
              Hello <strong>${firstName}</strong>! 👋
            </p>
            <p style="font-size: 16px; color: #666; line-height: 1.6;">
              Thank you for joining this week's lottery pool! Your payment has been confirmed.
            </p>

            <div style="background: #f0fdf4; border: 2px solid #86efac; border-radius: 12px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #166534; margin: 0 0 10px 0;">✅ What's Next?</h3>
              <ul style="color: #166534; margin: 0; padding-left: 20px;">
                <li>We'll purchase lottery entries before the drawings</li>
                <li>You'll receive an email with all the numbers</li>
                <li>If we win, you'll be notified immediately!</li>
              </ul>
            </div>

            <div style="background: #fef3c7; border: 2px solid #fcd34d; border-radius: 12px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #92400e; margin: 0 0 10px 0;">🎁 Earn $1 Credit!</h3>
              <p style="color: #92400e; margin: 0 0 10px 0; font-size: 14px;">
                Share your referral link with friends. For each friend who joins, you get $1 off your next entry!
              </p>
              <div style="background: white; padding: 10px; border-radius: 8px; word-break: break-all;">
                <a href="${referralLink}" style="color: #3b82f6; font-size: 14px;">${referralLink}</a>
              </div>
            </div>

            <p style="font-size: 14px; color: #666; line-height: 1.6;">
              <strong>Pool closes:</strong> ${weekEndDate} at 10:00 PM EST
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

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error sending confirmation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
