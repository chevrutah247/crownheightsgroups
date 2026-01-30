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
    const stored = await redis.get('reports');
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
    let reports: any[] = [];
    const stored = await redis.get('reports');
    if (stored) {
      reports = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (!Array.isArray(reports)) reports = [];
    }
    reports.push({
      id: String(Date.now()),
      groupId: data.groupId,
      reason: data.reason || '',
      userEmail: data.userEmail || 'anonymous',
      createdAt: new Date().toISOString()
    });
    await redis.set('reports', JSON.stringify(reports));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}