import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import crypto from 'crypto';

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (url && token) return new Redis({ url, token });
  return null;
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const { email, code, newPassword } = await request.json();
    
    if (!email || !code || !newPassword) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'Database error' }, { status: 500 });

    // Verify reset code
    const savedCode = await redis.get(`reset:${email.toLowerCase()}`);
    if (!savedCode || savedCode !== code) {
      return NextResponse.json({ error: 'Invalid or expired reset code' }, { status: 400 });
    }

    // Get user
    const userData = await redis.get(`user:${email.toLowerCase()}`);
    if (!userData) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const user = typeof userData === 'string' ? JSON.parse(userData) : userData;

    // Update password
    user.password = hashPassword(newPassword);
    await redis.set(`user:${email.toLowerCase()}`, JSON.stringify(user));

    // Delete reset code
    await redis.del(`reset:${email.toLowerCase()}`);

    return NextResponse.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
