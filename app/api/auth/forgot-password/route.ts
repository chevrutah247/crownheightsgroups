import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

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

    // Log the code (in production, send email)
    console.log(`PASSWORD RESET CODE for ${email}: ${code}`);

    // TODO: Send email with code using your email service
    // For now, we'll just return success

    return NextResponse.json({ success: true, message: 'Reset code sent to your email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Failed to send reset code' }, { status: 500 });
  }
}
