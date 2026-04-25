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
const PURGE_IDS = new Set(['r-carbon', 'r-basil', 'r-gombos', 'r-reverie']);

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

    // Build merged view:
    // 1. Auto-purge removed IDs
    // 2. For every default, layer admin-stored fields on top so admin edits win
    //    BUT new fields from defaults (e.g. newly added descriptions/addresses)
    //    show up for entries that haven't been admin-edited recently.
    const storedMap = new Map<string, Restaurant>(
      parsed.filter((r: Restaurant) => r && r.id && !PURGE_IDS.has(r.id))
            .map((r: Restaurant) => [r.id, r])
    );

    const merged: Restaurant[] = [];
    const seen = new Set<string>();

    for (const def of restaurantsDefaults) {
      const stored = storedMap.get(def.id);
      if (stored) {
        // Stored entry exists — keep admin edits but fill in any missing fields from defaults
        const cleanStored: Partial<Restaurant> = {};
        for (const [k, v] of Object.entries(stored)) {
          if (v !== undefined && v !== null && v !== '') {
            (cleanStored as any)[k] = v;
          }
        }
        merged.push({ ...def, ...cleanStored });
      } else {
        merged.push(def);
      }
      seen.add(def.id);
    }

    // Append any stored entries that aren't in defaults (admin-added places)
    for (const [id, r] of storedMap.entries()) {
      if (!seen.has(id)) merged.push(r);
    }

    // Persist the merged list so admin sees the enriched data and future reads are clean
    await redis.set(RESTAURANTS_KEY, JSON.stringify(merged));
    return merged;
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
