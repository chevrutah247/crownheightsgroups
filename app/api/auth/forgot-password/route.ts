import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import nodemailer from 'nodemailer';

const EMAIL_CONFIG = {
  user: 'contact@edonthego.org',
  pass: 'qvun irsl zsaf asux',
};

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (url && token) return new Redis({ url, token });
  return null;
}

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'Database error' }, { status: 500 });

    // Check if user exists
    const user = await redis.get(`user:${email.toLowerCase()}`);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Generate and save reset code (expires in 15 minutes)
    const code = generateCode();
    await redis.set(`reset:${email.toLowerCase()}`, code, { ex: 900 });

    console.log(`PASSWORD RESET CODE for ${email}: ${code}`);

    // Send email
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
      subject: 'Password Reset - Crown Heights Groups',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1e3a5f; text-align: center;">Password Reset</h2>
          <p>You requested to reset your password for Crown Heights Groups.</p>
          <div style="background: #f0f9ff; border: 2px solid #0369a1; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; color: #666;">Your reset code:</p>
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1e3a5f;">${code}</div>
          </div>
          <p style="color: #666; font-size: 14px;">This code expires in 15 minutes.</p>
          <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
      text: `Your password reset code for Crown Heights Groups is: ${code}\n\nThis code expires in 15 minutes.\n\nIf you didn't request this, please ignore this email.`,
    });

    return NextResponse.json({ success: true, message: 'Reset code sent to your email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Failed to send reset code' }, { status: 500 });
  }
}
