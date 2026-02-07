import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const REMINDER_KEY = 'cyber:reminder:subscribers';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if already subscribed
    const existing = await redis.hget(REMINDER_KEY, normalizedEmail);
    if (existing) {
      return NextResponse.json({ 
        success: true, 
        message: 'Already subscribed',
        alreadySubscribed: true 
      });
    }

    // Subscribe with timestamp
    const subscriptionData = {
      email: normalizedEmail,
      subscribedAt: new Date().toISOString(),
      lastReminderSent: null,
      nextReminderDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
    };

    await redis.hset(REMINDER_KEY, { [normalizedEmail]: JSON.stringify(subscriptionData) });

    return NextResponse.json({ 
      success: true, 
      message: 'Subscribed successfully' 
    });
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json({ error: 'Subscription failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // Admin endpoint to check subscribers
  try {
    const subscribers = await redis.hgetall(REMINDER_KEY);
    return NextResponse.json({ 
      count: Object.keys(subscribers || {}).length,
      subscribers: subscribers || {}
    });
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  // Unsubscribe endpoint
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    await redis.hdel(REMINDER_KEY, normalizedEmail);

    return NextResponse.json({ success: true, message: 'Unsubscribed' });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json({ error: 'Unsubscribe failed' }, { status: 500 });
  }
}
