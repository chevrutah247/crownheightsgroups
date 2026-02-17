import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

export const dynamic = 'force-dynamic';

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (url && token) return new Redis({ url, token });
  return null;
}

// GET - fetch classifieds with filters, search, sort; auto-archive expired
export async function GET(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json([]);

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort');
    const showPending = searchParams.get('pending') === 'true';

    const data = await redis.get('classifieds');
    let listings = data ? (typeof data === 'string' ? JSON.parse(data) : data) : [];

    // Auto-expire old listings (30-day max)
    const now = new Date();
    let changed = false;
    listings = listings.map((l: any) => {
      if (l.status === 'active' && l.expiresAt && new Date(l.expiresAt) < now) {
        changed = true;
        return { ...l, status: 'expired' };
      }
      return l;
    });
    if (changed) {
      await redis.set('classifieds', JSON.stringify(listings));
    }

    // Filter by status
    if (showPending) {
      listings = listings.filter((l: any) => l.status === 'pending');
    } else {
      listings = listings.filter((l: any) => l.status === 'active');
    }

    // Filter by category
    if (category && category !== 'all') {
      listings = listings.filter((l: any) => l.category === category);
    }

    // Search
    if (search) {
      const q = search.toLowerCase();
      listings = listings.filter((l: any) =>
        l.title?.toLowerCase().includes(q) ||
        l.description?.toLowerCase().includes(q) ||
        l.location?.toLowerCase().includes(q) ||
        l.contactName?.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sort === 'price-low') {
      listings.sort((a: any, b: any) => {
        const priceA = parseFloat((a.price || '').replace(/[^0-9.]/g, '')) || 0;
        const priceB = parseFloat((b.price || '').replace(/[^0-9.]/g, '')) || 0;
        return priceA - priceB;
      });
    } else if (sort === 'price-high') {
      listings.sort((a: any, b: any) => {
        const priceA = parseFloat((a.price || '').replace(/[^0-9.]/g, '')) || 0;
        const priceB = parseFloat((b.price || '').replace(/[^0-9.]/g, '')) || 0;
        return priceB - priceA;
      });
    } else {
      // Default: newest first
      listings.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return NextResponse.json(listings);
  } catch (error) {
    console.error('Classifieds fetch error:', error);
    return NextResponse.json([]);
  }
}

// POST - create new classified (status: pending)
export async function POST(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });

    const body = await request.json();

    const data = await redis.get('classifieds');
    let listings = data ? (typeof data === 'string' ? JSON.parse(data) : data) : [];

    const duration = Math.min(Math.max(body.duration || 30, 1), 30);
    const expiresAt = new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString();

    const newListing = {
      id: 'cls-' + Date.now(),
      title: body.title || '',
      category: body.category || 'for-sale',
      description: body.description || '',
      price: body.price || '',
      imageUrls: body.imageUrls || [],
      location: body.location || 'Crown Heights',
      contactName: body.contactName || '',
      contactPhone: body.contactPhone || '',
      contactEmail: body.contactEmail || '',
      contactWhatsapp: body.contactWhatsapp || '',
      submittedBy: body.submittedBy || 'anonymous',
      status: 'pending',
      duration,
      expiresAt,
      createdAt: new Date().toISOString(),
      views: 0,
    };

    listings.push(newListing);
    await redis.set('classifieds', JSON.stringify(listings));

    return NextResponse.json({ success: true, listing: newListing });
  } catch (error) {
    console.error('Classifieds create error:', error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}

// PUT - update classified (mark sold, edit, approve)
export async function PUT(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });

    const { id, ...updates } = await request.json();

    const data = await redis.get('classifieds');
    let listings = data ? (typeof data === 'string' ? JSON.parse(data) : data) : [];

    listings = listings.map((l: any) => l.id === id ? { ...l, ...updates } : l);
    await redis.set('classifieds', JSON.stringify(listings));

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

    const data = await redis.get('classifieds');
    let listings = data ? (typeof data === 'string' ? JSON.parse(data) : data) : [];

    listings = listings.filter((l: any) => l.id !== id);
    await redis.set('classifieds', JSON.stringify(listings));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
