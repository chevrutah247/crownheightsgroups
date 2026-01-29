import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

export const dynamic = 'force-dynamic';

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (url && token) return new Redis({ url, token });
  return null;
}

// GET - fetch events
export async function GET(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json([]);

    const { searchParams } = new URL(request.url);
    const showPast = searchParams.get('past') === 'true';

    const data = await redis.get('community_events');
    let events = data ? (typeof data === 'string' ? JSON.parse(data) : data) : [];

    const now = new Date();

    // Filter by date and status
    events = events.filter((e: any) => {
      if (e.status !== 'approved' && e.status !== 'active') return false;
      if (e.date) {
        const eventDate = new Date(e.date);
        if (showPast) return eventDate < now;
        return eventDate >= now;
      }
      return !showPast; // Events without date show in upcoming
    });

    // Sort by date
    events.sort((a: any, b: any) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateA - dateB;
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Events fetch error:', error);
    return NextResponse.json([]);
  }
}

// POST - create new event
export async function POST(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });

    const body = await request.json();

    const data = await redis.get('community_events');
    let events = data ? (typeof data === 'string' ? JSON.parse(data) : data) : [];

    const newEvent = {
      id: 'ev-' + Date.now(),
      ...body,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    events.push(newEvent);
    await redis.set('community_events', JSON.stringify(events));

    return NextResponse.json({ success: true, event: newEvent });
  } catch (error) {
    console.error('Event create error:', error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}

// PUT - update event
export async function PUT(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });

    const { id, ...updates } = await request.json();

    const data = await redis.get('community_events');
    let events = data ? (typeof data === 'string' ? JSON.parse(data) : data) : [];

    events = events.map((e: any) => e.id === id ? { ...e, ...updates } : e);
    await redis.set('community_events', JSON.stringify(events));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

// DELETE
export async function DELETE(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });

    const { id } = await request.json();

    const data = await redis.get('community_events');
    let events = data ? (typeof data === 'string' ? JSON.parse(data) : data) : [];

    events = events.filter((e: any) => e.id !== id);
    await redis.set('community_events', JSON.stringify(events));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
