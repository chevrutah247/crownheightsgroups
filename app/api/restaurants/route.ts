import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { restaurantsDefaults, hashgachas, type Restaurant } from '@/lib/restaurants-data';

export const dynamic = 'force-dynamic';

const RESTAURANTS_KEY = 'crown_heights_restaurants';

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (url && token) return new Redis({ url, token });
  return null;
}

// One-time cleanup: removed/closed entries that should be purged from Redis
// even if they were saved by an earlier version of the seed.
const PURGE_IDS = new Set(['r-carbon', 'r-basil', 'r-gombos']);

async function loadRestaurants(): Promise<Restaurant[]> {
  const redis = getRedis();
  if (!redis) return restaurantsDefaults;
  try {
    const raw = await redis.get(RESTAURANTS_KEY);
    if (!raw) {
      await redis.set(RESTAURANTS_KEY, JSON.stringify(restaurantsDefaults));
      return restaurantsDefaults;
    }
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!Array.isArray(parsed)) return restaurantsDefaults;

    // Auto-purge entries that have been removed from the canonical list
    const cleaned = parsed.filter((r: Restaurant) => !PURGE_IDS.has(r.id));
    if (cleaned.length !== parsed.length) {
      await redis.set(RESTAURANTS_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return restaurantsDefaults;
  }
}

export async function GET() {
  try {
    const all = await loadRestaurants();
    const active = all.filter((r) => r.status !== 'closed');
    return NextResponse.json({
      restaurants: active,
      hashgachas,
      count: active.length,
    });
  } catch (error) {
    console.error('GET /api/restaurants error:', error);
    return NextResponse.json({ restaurants: restaurantsDefaults, hashgachas, count: restaurantsDefaults.length });
  }
}
