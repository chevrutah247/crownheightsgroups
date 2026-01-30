import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (url && token) return new Redis({ url, token });
  return null;
}

export async function GET() {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json([]);
    const stored = await redis.get('events');
    if (stored) {
      const data = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (Array.isArray(data)) return NextResponse.json(data);
    }
    return NextResponse.json([]);
  } catch (error) {
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    const data = await request.json();
    let events: any[] = [];
    const stored = await redis.get('events');
    if (stored) {
      events = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (!Array.isArray(events)) events = [];
    }
    const event = {
      id: String(Date.now()),
      title: data.title || '',
      description: data.description || '',
      date: data.date || '',
      time: data.time || '',
      location: data.location || '',
      address: data.address || '',
      organizer: data.organizer || '',
      contactPhone: data.contactPhone || '',
      contactEmail: data.contactEmail || '',
      link: data.link || '',
      imageUrl: data.imageUrl || '',
      status: 'approved',
      createdAt: new Date().toISOString()
    };
    events.push(event);
    await redis.set('events', JSON.stringify(events));
    return NextResponse.json({ success: true, event });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    const data = await request.json();
    let events: any[] = [];
    const stored = await redis.get('events');
    if (stored) {
      events = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (!Array.isArray(events)) events = [];
    }
    const index = events.findIndex((e: any) => e.id === data.id);
    if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    events[index] = { ...events[index], ...data };
    await redis.set('events', JSON.stringify(events));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    const { id } = await request.json();
    let events: any[] = [];
    const stored = await redis.get('events');
    if (stored) {
      events = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (!Array.isArray(events)) events = [];
    }
    events = events.filter((e: any) => e.id !== id);
    await redis.set('events', JSON.stringify(events));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}