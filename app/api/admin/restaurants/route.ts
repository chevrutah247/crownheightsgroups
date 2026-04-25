import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { cookies } from 'next/headers';
import { validateSession } from '@/lib/auth';
import { restaurantsDefaults, type Restaurant } from '@/lib/restaurants-data';

const RESTAURANTS_KEY = 'crown_heights_restaurants';

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (url && token) return new Redis({ url, token });
  return null;
}

async function requireAdminUser() {
  const cookieStore = cookies();
  const token = cookieStore.get('session_token')?.value;
  if (!token) return { ok: false as const, error: 'Not authenticated', status: 401 };
  const user = await validateSession(token);
  if (!user) return { ok: false as const, error: 'Invalid session', status: 401 };
  if (user.role !== 'admin') return { ok: false as const, error: 'Admin access required', status: 403 };
  return { ok: true as const, user };
}

async function loadRestaurants(redis: Redis | null): Promise<Restaurant[]> {
  if (!redis) return restaurantsDefaults;
  const raw = await redis.get(RESTAURANTS_KEY);
  if (!raw) {
    await redis.set(RESTAURANTS_KEY, JSON.stringify(restaurantsDefaults));
    return restaurantsDefaults;
  }
  const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
  return Array.isArray(parsed) ? parsed : restaurantsDefaults;
}

async function saveRestaurants(redis: Redis, restaurants: Restaurant[]) {
  await redis.set(RESTAURANTS_KEY, JSON.stringify(restaurants));
}

// GET — list all restaurants including closed
export async function GET() {
  const auth = await requireAdminUser();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    const redis = getRedis();
    const all = await loadRestaurants(redis);
    return NextResponse.json(all);
  } catch (error) {
    console.error('GET /api/admin/restaurants error:', error);
    return NextResponse.json({ error: 'Failed to load' }, { status: 500 });
  }
}

// PUT — bulk replace all restaurants. Body: Restaurant[]
export async function PUT(request: NextRequest) {
  const auth = await requireAdminUser();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'KV not configured' }, { status: 500 });
    const body = await request.json();
    if (!Array.isArray(body)) return NextResponse.json({ error: 'Expected array' }, { status: 400 });
    await saveRestaurants(redis, body);
    return NextResponse.json({ ok: true, count: body.length });
  } catch (error: any) {
    console.error('PUT /api/admin/restaurants error:', error);
    return NextResponse.json({ error: error.message || 'Save failed' }, { status: 500 });
  }
}

// POST — add a new restaurant. Body: Restaurant (without id)
export async function POST(request: NextRequest) {
  const auth = await requireAdminUser();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'KV not configured' }, { status: 500 });
    const body = await request.json();
    if (!body.name || !body.type || !body.hashgacha) {
      return NextResponse.json({ error: 'name, type, hashgacha required' }, { status: 400 });
    }
    const all = await loadRestaurants(redis);
    const newOne: Restaurant = {
      ...body,
      id: body.id || `r-${Date.now()}`,
      status: body.status || 'active',
      area: body.area || 'Crown Heights',
    };
    all.push(newOne);
    await saveRestaurants(redis, all);
    return NextResponse.json({ ok: true, restaurant: newOne });
  } catch (error: any) {
    console.error('POST /api/admin/restaurants error:', error);
    return NextResponse.json({ error: error.message || 'Add failed' }, { status: 500 });
  }
}

// DELETE — remove by id. Query: ?id=...
export async function DELETE(request: NextRequest) {
  const auth = await requireAdminUser();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'KV not configured' }, { status: 500 });
    const id = request.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const all = await loadRestaurants(redis);
    const filtered = all.filter((r) => r.id !== id);
    if (filtered.length === all.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    await saveRestaurants(redis, filtered);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('DELETE /api/admin/restaurants error:', error);
    return NextResponse.json({ error: error.message || 'Delete failed' }, { status: 500 });
  }
}
