import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import type { ShulReview } from '@/lib/shuls-data';
import { requireAdmin } from '@/lib/admin-auth';

const REVIEWS_KEY = 'shul_reviews';

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (url && token) return new Redis({ url, token });
  return null;
}

async function getReviews(redis: Redis | null): Promise<ShulReview[]> {
  if (!redis) return [];

  const stored = await redis.get(REVIEWS_KEY);
  if (!stored) return [];

  const parsed = typeof stored === 'string' ? JSON.parse(stored) : stored;
  return Array.isArray(parsed) ? parsed : [];
}

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin();
    if (!adminCheck.authorized) {
      return NextResponse.json({ error: adminCheck.error }, { status: 401 });
    }

    const redis = getRedis();
    const reviews = await getReviews(redis);

    const statusFilter = request.nextUrl.searchParams.get('status');
    const filtered = statusFilter ? reviews.filter((r) => r.status === statusFilter) : reviews;

    filtered.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    return NextResponse.json(filtered);
  } catch (error) {
    console.error('GET /api/admin/shul-reviews error:', error);
    return NextResponse.json([]);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin();
    if (!adminCheck.authorized) {
      return NextResponse.json({ error: adminCheck.error }, { status: 401 });
    }

    const redis = getRedis();
    if (!redis) {
      return NextResponse.json({ error: 'KV is not configured' }, { status: 500 });
    }

    const { id, action } = await request.json();
    if (!id || !['approve', 'reject', 'delete'].includes(action)) {
      return NextResponse.json({ error: 'Invalid moderation payload' }, { status: 400 });
    }

    const reviews = await getReviews(redis);

    if (action === 'delete') {
      const next = reviews.filter((r) => r.id !== id);
      await redis.set(REVIEWS_KEY, JSON.stringify(next));
      return NextResponse.json({ ok: true });
    }

    const index = reviews.findIndex((r) => r.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    reviews[index] = {
      ...reviews[index],
      status: action === 'approve' ? 'approved' : 'rejected',
      moderatedAt: new Date().toISOString(),
    };

    await redis.set(REVIEWS_KEY, JSON.stringify(reviews));
    return NextResponse.json({ ok: true, review: reviews[index] });
  } catch (error) {
    console.error('PUT /api/admin/shul-reviews error:', error);
    return NextResponse.json({ error: 'Failed to moderate review' }, { status: 500 });
  }
}
