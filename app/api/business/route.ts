import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

export const dynamic = 'force-dynamic';

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (url && token) return new Redis({ url, token });
  return null;
}

// GET - fetch all businesses
export async function GET(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json([]);

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const showPending = searchParams.get('pending') === 'true';

    const data = await redis.get('businesses');
    let businesses = data ? (typeof data === 'string' ? JSON.parse(data) : data) : [];

    // Filter by status
    if (showPending) {
      businesses = businesses.filter((b: any) => b.status === 'pending');
    } else {
      businesses = businesses.filter((b: any) => b.status === 'approved' || b.status === 'active');
    }

    // Filter by category
    if (category && category !== 'all') {
      businesses = businesses.filter((b: any) => b.category === category);
    }

    return NextResponse.json(businesses);
  } catch (error) {
    console.error('Business fetch error:', error);
    return NextResponse.json([]);
  }
}

// POST - create new business
export async function POST(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });

    const body = await request.json();

    const data = await redis.get('businesses');
    let businesses = data ? (typeof data === 'string' ? JSON.parse(data) : data) : [];

    const newBusiness = {
      id: 'biz-' + Date.now(),
      ...body,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    businesses.push(newBusiness);
    await redis.set('businesses', JSON.stringify(businesses));

    return NextResponse.json({ success: true, business: newBusiness });
  } catch (error) {
    console.error('Business create error:', error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}

// PUT - update business
export async function PUT(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });

    const { id, ...updates } = await request.json();

    const data = await redis.get('businesses');
    let businesses = data ? (typeof data === 'string' ? JSON.parse(data) : data) : [];

    businesses = businesses.map((b: any) => b.id === id ? { ...b, ...updates } : b);
    await redis.set('businesses', JSON.stringify(businesses));

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

    const data = await redis.get('businesses');
    let businesses = data ? (typeof data === 'string' ? JSON.parse(data) : data) : [];

    businesses = businesses.filter((b: any) => b.id !== id);
    await redis.set('businesses', JSON.stringify(businesses));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
