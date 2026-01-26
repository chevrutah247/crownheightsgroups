import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getUserByEmail, regenerateVerificationCode } from '@/lib/auth';

const EMAIL_CONFIG = {
  user: 'contact@edonthego.org',
  pass: 'qvun irsl zsaf asux',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const user = getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email' },
        { status: 404 }
      );
    }

    if (user.isVerified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      );
    }

    // Generate new code
    const newCode = regenerateVerificationCode(email);
    if (!newCode) {
      return NextResponse.json(
        { error: 'Failed to generate new code' },
        { status: 500 }
      );
    }

    // Send new verification email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_CONFIG.user,
        pass: EMAIL_CONFIG.pass,
      },
    });

    await transporter.sendMail({
      from: `"Crown Heights Groups" <${EMAIL_CONFIG.user}>`,
      to: email,
      subject: 'New Verification Code - Crown Heights Groups',
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 70px; height: 70px; background: linear-gradient(135deg, #d69e2e, #b7791f); border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 24px; font-weight: bold; font-family: Georgia, serif;">CH</span>
            </div>
            <h1 style="color: #1a365d; margin: 0; font-size: 24px;">Crown Heights Groups</h1>
          </div>
          
          <div style="background: #f7f5f0; border-radius: 12px; padding: 30px; text-align: center;">
            <h2 style="color: #1a365d; margin: 0 0 10px;">New Verification Code</h2>
            <p style="color: #4a5568; margin: 0 0 25px; font-size: 15px;">
              Here's your new verification code:
            </p>
            
            <div style="background: white; border: 2px solid #d69e2e; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
              <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1a365d;">
                ${newCode}
              </span>
            </div>
            
            <p style="color: #718096; font-size: 13px; margin: 0;">
              This code expires in 30 minutes.
            </p>
          </div>
          
          <p style="color: #718096; font-size: 12px; text-align: center; margin-top: 30px;">
            If you didn't request this code, please ignore this email.
          </p>
        </div>
      `,
      text: `
Your new verification code is: ${newCode}

This code expires in 30 minutes.

If you didn't request this code, please ignore this email.
      `,
    });

    return NextResponse.json({
      success: true,
      message: 'New verification code sent'
    });
  } catch (error) {
    console.error('Resend error:', error);
    return NextResponse.json(
      { error: 'Failed to resend code. Please try again.' },
      { status: 500 }
    );
  }
}
