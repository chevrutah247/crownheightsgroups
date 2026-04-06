import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import type { ShulReview } from '@/lib/shuls-data';

const REVIEWS_KEY = 'shul_reviews';

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (url && token) return new Redis({ url, token });
  return null;
}

function sanitize(input: string, maxLen: number) {
  return input.trim().replace(/\s+/g, ' ').slice(0, maxLen);
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
    const redis = getRedis();
    const reviews = await getReviews(redis);

    const shulId = request.nextUrl.searchParams.get('shulId');
    const approvedOnly = reviews.filter((r) => r.status === 'approved');

    const filtered = shulId ? approvedOnly.filter((r) => r.shulId === shulId) : approvedOnly;

    filtered.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    return NextResponse.json(filtered);
  } catch (error) {
    console.error('GET /api/shul-reviews error:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const redis = getRedis();
    const body = await request.json();

    const shulId = sanitize(body.shulId || '', 120);
    const authorName = sanitize(body.authorName || '', 80);
    const authorEmail = sanitize(body.authorEmail || '', 120);
    const comment = sanitize(body.comment || '', 1200);
    const rating = Number(body.rating);

    if (!shulId || !authorName || !comment || Number.isNaN(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid review payload' }, { status: 400 });
    }

    const newReview: ShulReview = {
      id: String(Date.now()),
      shulId,
      authorName,
      authorEmail,
      comment,
      rating,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    if (!redis) {
      return NextResponse.json({
        ok: true,
        review: newReview,
        warning: 'KV is not configured. Review was accepted in-memory only for this request.',
      });
    }

    const reviews = await getReviews(redis);
    reviews.push(newReview);
    await redis.set(REVIEWS_KEY, JSON.stringify(reviews));

    return NextResponse.json({ ok: true, review: newReview });
  } catch (error) {
    console.error('POST /api/shul-reviews error:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
