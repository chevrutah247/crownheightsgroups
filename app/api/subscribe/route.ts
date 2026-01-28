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
    
    const { name, email, frequency } = await request.json();
    
    if (!email || !frequency) {
      return NextResponse.json({ error: 'Email and frequency are required' }, { status: 400 });
    }
    
    let subscribers: any[] = [];
    const stored = await redis.get('newsletter_subscribers');
    if (stored) {
      subscribers = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (!Array.isArray(subscribers)) subscribers = [];
    }
    
    const existing = subscribers.find(s => s.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      existing.name = name || existing.name;
      existing.frequency = frequency;
      existing.status = 'active';
      existing.updatedAt = new Date().toISOString();
    } else {
      subscribers.push({
        id: String(Date.now()),
        name: name || '',
        email: email.toLowerCase(),
        frequency,
        status: 'active',
        createdAt: new Date().toISOString(),
        lastSentAt: null
      });
    }
    
    await redis.set('newsletter_subscribers', JSON.stringify(subscribers));
    
    return NextResponse.json({ success: true, message: 'Subscribed successfully!' });
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
