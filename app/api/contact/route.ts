import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Email configuration
const EMAIL_CONFIG = {
  user: 'contact@edonthego.org',
  pass: 'qvun irsl zsaf asux', // App password
  to: 'contact@edonthego.org',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_CONFIG.user,
        pass: EMAIL_CONFIG.pass,
      },
    });

    // Email content
    const mailOptions = {
      from: EMAIL_CONFIG.user,
      to: EMAIL_CONFIG.to,
      replyTo: email,
      subject: `[Crown Heights Groups] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a365d; border-bottom: 2px solid #d69e2e; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; width: 120px;">
                Name:
              </td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">
                ${name}
              </td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">
                Email:
              </td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">
                <a href="mailto:${email}">${email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">
                Subject:
              </td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">
                ${subject}
              </td>
            </tr>
          </table>
          
          <div style="background: #f7f5f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #1a365d;">Message:</h3>
            <p style="margin: 0; white-space: pre-wrap; line-height: 1.6;">${message}</p>
          </div>
          
          <p style="color: #718096; font-size: 12px; margin-top: 30px;">
            This message was sent from the Crown Heights Groups contact form.
          </p>
        </div>
      `,
      text: `
New Contact Form Submission
===========================

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

---
This message was sent from the Crown Heights Groups contact form.
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
