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
    const showPending = searchParams.get('pending') === 'true';

    const data = await redis.get('charity_campaigns');
    let campaigns = data ? (typeof data === 'string' ? JSON.parse(data) : data) : [];

    const now = new Date();

    let updated = false;
    campaigns = campaigns.map((c: any) => {
      if (c.status === 'active' && c.expiresAt) {
        const expireDate = new Date(c.expiresAt);
        if (now > expireDate) {
          updated = true;
          return { ...c, status: 'archived' };
        }
      }
      return c;
    });

    if (updated) {
      await redis.set('charity_campaigns', JSON.stringify(campaigns));
    }

    if (showPending) {
      return NextResponse.json(campaigns.filter((c: any) => c.status === 'pending'));
    }
    if (showArchived) {
      return NextResponse.json(campaigns.filter((c: any) => c.status === 'archived'));
    }
    return NextResponse.json(campaigns.filter((c: any) => c.status === 'active'));
  } catch (error) {
    console.error('Charity fetch error:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });

    const body = await request.json();

    const data = await redis.get('charity_campaigns');
    let campaigns = data ? (typeof data === 'string' ? JSON.parse(data) : data) : [];

    const duration = Math.min(body.duration || 7, 7);
    const expiresAt = new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString();

    const newCampaign = {
      id: 'ch-' + Date.now(),
      ...body,
      duration,
      expiresAt,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    campaigns.push(newCampaign);
    await redis.set('charity_campaigns', JSON.stringify(campaigns));

    return NextResponse.json({ success: true, campaign: newCampaign });
  } catch (error) {
    console.error('Charity create error:', error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });

    const { id, status, extendDays } = await request.json();

    const data = await redis.get('charity_campaigns');
    let campaigns = data ? (typeof data === 'string' ? JSON.parse(data) : data) : [];

    campaigns = campaigns.map((c: any) => {
      if (c.id === id) {
        const updated = { ...c };
        if (status) updated.status = status;
        if (extendDays) {
          const baseDate = new Date(c.expiresAt) > new Date() ? new Date(c.expiresAt) : new Date();
          updated.expiresAt = new Date(baseDate.getTime() + Math.min(extendDays, 7) * 24 * 60 * 60 * 1000).toISOString();
          updated.status = 'active';
        }
        return updated;
      }
      return c;
    });

    await redis.set('charity_campaigns', JSON.stringify(campaigns));

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

    const data = await redis.get('charity_campaigns');
    let campaigns = data ? (typeof data === 'string' ? JSON.parse(data) : data) : [];

    campaigns = campaigns.filter((c: any) => c.id !== id);
    await redis.set('charity_campaigns', JSON.stringify(campaigns));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
