import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const EMAIL_CONFIG = {
  user: 'contact@edonthego.org',
  pass: 'qvun irsl zsaf asux',
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const type = formData.get('type') as string;
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;
    const screenshot = formData.get('screenshot') as File | null;

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const typeLabels: Record<string, string> = {
      bug: '🐛 Bug Report',
      suggestion: '💡 Suggestion',
      question: '❓ Question',
      content: '🚫 Content Report',
      other: '💬 Other',
    };

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_CONFIG.user,
        pass: EMAIL_CONFIG.pass,
      },
    });

    const attachments: any[] = [];
    if (screenshot) {
      const buffer = Buffer.from(await screenshot.arrayBuffer());
      attachments.push({
        filename: screenshot.name || 'screenshot.png',
        content: buffer,
      });
    }

    await transporter.sendMail({
      from: `"Crown Heights Groups" <${EMAIL_CONFIG.user}>`,
      to: 'contact@edonthego.org',
      replyTo: email,
      subject: `[${typeLabels[type] || type}] ${subject || 'New Feedback'} - Crown Heights Groups`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); padding: 20px; border-radius: 12px 12px 0 0;">
            <h2 style="color: white; margin: 0;">📧 New Feedback Received</h2>
          </div>
          <div style="background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; border-radius: 0 0 12px 12px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; width: 100px;"><strong>Type:</strong></td>
                <td style="padding: 8px 0;">${typeLabels[type] || type}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>From:</strong></td>
                <td style="padding: 8px 0;">${name} &lt;${email}&gt;</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Subject:</strong></td>
                <td style="padding: 8px 0;">${subject || '(No subject)'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Screenshot:</strong></td>
                <td style="padding: 8px 0;">${screenshot ? '✅ Attached' : '❌ None'}</td>
              </tr>
            </table>
            <hr style="margin: 16px 0; border: none; border-top: 1px solid #e2e8f0;">
            <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0;">
              <strong>Message:</strong>
              <p style="white-space: pre-wrap; margin: 8px 0 0 0;">${message}</p>
            </div>
          </div>
        </div>
      `,
      attachments,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
