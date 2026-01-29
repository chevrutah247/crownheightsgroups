import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

export const dynamic = 'force-dynamic';

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (url && token) return new Redis({ url, token });
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json([]);

    const { searchParams } = new URL(request.url);
    const showArchived = searchParams.get('archived') === 'true';
    const userEmail = searchParams.get('user');

    const data = await redis.get('shabbos_hosting');
    let hostings = data ? (typeof data === 'string' ? JSON.parse(data) : data) : [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let updated = false;
    hostings = hostings.map((h: any) => {
      if (h.status === 'active' && h.shabbosDate) {
        const hostDate = new Date(h.shabbosDate);
        const archiveDate = new Date(hostDate);
        archiveDate.setDate(archiveDate.getDate() + 2);
        if (today > archiveDate) {
          updated = true;
          return { ...h, status: 'archived' };
        }
      }
      return h;
    });

    if (updated) {
      await redis.set('shabbos_hosting', JSON.stringify(hostings));
    }

    if (userEmail) {
      const userHostings = hostings.filter((h: any) => h.submittedBy === userEmail);
      return NextResponse.json({ 
        active: userHostings.filter((h: any) => h.status !== 'archived'),
        previous: userHostings.filter((h: any) => h.status === 'archived').slice(-5)
      });
    }

    if (showArchived) {
      return NextResponse.json(hostings.filter((h: any) => h.status === 'archived'));
    } else {
      return NextResponse.json(hostings.filter((h: any) => h.status === 'active'));
    }
  } catch (error) {
    console.error('Shabbos hosting fetch error:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });

    const body = await request.json();

    const data = await redis.get('shabbos_hosting');
    let hostings = data ? (typeof data === 'string' ? JSON.parse(data) : data) : [];

    const newHosting = {
      id: 'sh-' + Date.now(),
      ...body,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    hostings.push(newHosting);
    await redis.set('shabbos_hosting', JSON.stringify(hostings));

    return NextResponse.json({ success: true, hosting: newHosting });
  } catch (error) {
    console.error('Shabbos hosting create error:', error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });

    const { id, status } = await request.json();

    const data = await redis.get('shabbos_hosting');
    let hostings = data ? (typeof data === 'string' ? JSON.parse(data) : data) : [];

    hostings = hostings.map((h: any) => h.id === id ? { ...h, status } : h);
    await redis.set('shabbos_hosting', JSON.stringify(hostings));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });

    const { id } = await request.json();

    const data = await redis.get('shabbos_hosting');
    let hostings = data ? (typeof data === 'string' ? JSON.parse(data) : data) : [];

    hostings = hostings.filter((h: any) => h.id !== id);
    await redis.set('shabbos_hosting', JSON.stringify(hostings));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
