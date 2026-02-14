import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (url && token) return new Redis({ url, token });
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    let subscribers: any[] = [];
    const stored = await redis.get('newsletter_subscribers');
    if (stored) {
      subscribers = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (!Array.isArray(subscribers)) subscribers = [];
    }

    const index = subscribers.findIndex(s => s.email.toLowerCase() === email.toLowerCase());
    if (index === -1) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 });
    }

    subscribers[index].status = 'unsubscribed';
    subscribers[index].updatedAt = new Date().toISOString();

    await redis.set('newsletter_subscribers', JSON.stringify(subscribers));

    return NextResponse.json({ success: true, message: 'Unsubscribed successfully' });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
