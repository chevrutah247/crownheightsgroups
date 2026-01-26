import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createUser, getUserByEmail } from '@/lib/auth';

const EMAIL_CONFIG = {
  user: 'contact@edonthego.org',
  pass: 'qvun irsl zsaf asux',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      if (existingUser.isVerified) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          { error: 'Please check your email for the verification code', needsVerification: true },
          { status: 400 }
        );
      }
    }

    // Create user
    const user = await createUser(email, password, name);

    // Log verification code for testing (remove in production!)
    console.log('=================================');
    console.log(`VERIFICATION CODE for ${email}: ${user.verificationCode}`);
    console.log('=================================');

    // Send verification email
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
      subject: 'Verify Your Email - Crown Heights Groups',
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 70px; height: 70px; background: linear-gradient(135deg, #d69e2e, #b7791f); border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 24px; font-weight: bold; font-family: Georgia, serif;">CH</span>
            </div>
            <h1 style="color: #1a365d; margin: 0; font-size: 24px;">Crown Heights Groups</h1>
          </div>
          
          <div style="background: #f7f5f0; border-radius: 12px; padding: 30px; text-align: center;">
            <h2 style="color: #1a365d; margin: 0 0 10px;">Welcome, ${name}!</h2>
            <p style="color: #4a5568; margin: 0 0 25px; font-size: 15px;">
              Use the code below to verify your email address:
            </p>
            
            <div style="background: white; border: 2px solid #d69e2e; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
              <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1a365d;">
                ${user.verificationCode}
              </span>
            </div>
            
            <p style="color: #718096; font-size: 13px; margin: 0;">
              This code expires in 30 minutes.
            </p>
          </div>
          
          <p style="color: #718096; font-size: 12px; text-align: center; margin-top: 30px;">
            If you didn't create an account with Crown Heights Groups, please ignore this email.
          </p>
        </div>
      `,
      text: `
Welcome to Crown Heights Groups, ${name}!

Your verification code is: ${user.verificationCode}

This code expires in 30 minutes.

If you didn't create an account, please ignore this email.
      `,
    });

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your email'
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
