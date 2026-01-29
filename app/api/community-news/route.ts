import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

export const dynamic = 'force-dynamic';

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (url && token) return new Redis({ url, token });
  return null;
}

// GET - fetch community news
export async function GET(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json([]);

    const { searchParams } = new URL(request.url);
    const newsType = searchParams.get('type');

    const data = await redis.get('community_news');
    let news = data ? (typeof data === 'string' ? JSON.parse(data) : data) : [];

    // Only show approved/active news
    news = news.filter((n: any) => n.status === 'approved' || n.status === 'active');

    // Filter by type
    if (newsType && newsType !== 'all') {
      news = news.filter((n: any) => n.newsType === newsType);
    }

    // Sort by date (newest first)
    news.sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

    return NextResponse.json(news);
  } catch (error) {
    console.error('Community news fetch error:', error);
    return NextResponse.json([]);
  }
}

// POST - create news item
export async function POST(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });

    const body = await request.json();

    const data = await redis.get('community_news');
    let news = data ? (typeof data === 'string' ? JSON.parse(data) : data) : [];

    const newNews = {
      id: 'news-' + Date.now(),
      ...body,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    news.push(newNews);
    await redis.set('community_news', JSON.stringify(news));

    return NextResponse.json({ success: true, news: newNews });
  } catch (error) {
    console.error('Community news create error:', error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}

// PUT - update news
export async function PUT(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });

    const { id, ...updates } = await request.json();

    const data = await redis.get('community_news');
    let news = data ? (typeof data === 'string' ? JSON.parse(data) : data) : [];

    news = news.map((n: any) => n.id === id ? { ...n, ...updates } : n);
    await redis.set('community_news', JSON.stringify(news));

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

    const data = await redis.get('community_news');
    let news = data ? (typeof data === 'string' ? JSON.parse(data) : data) : [];

    news = news.filter((n: any) => n.id !== id);
    await redis.set('community_news', JSON.stringify(news));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
