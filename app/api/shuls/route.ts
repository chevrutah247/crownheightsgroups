import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { defaultShuls } from '@/lib/shuls-data';

const SHULS_KEY = 'shuls_directory';

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (url && token) return new Redis({ url, token });
  return null;
}

export async function GET() {
  try {
    const redis = getRedis();

    if (!redis) {
      return NextResponse.json(defaultShuls);
    }

    const stored = await redis.get(SHULS_KEY);
    if (stored) {
      const parsed = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (Array.isArray(parsed) && parsed.length > 0) {
        return NextResponse.json(parsed);
      }
    }

    await redis.set(SHULS_KEY, JSON.stringify(defaultShuls));
    return NextResponse.json(defaultShuls);
  } catch (error) {
    console.error('GET /api/shuls error:', error);
    return NextResponse.json(defaultShuls);
  }
}
