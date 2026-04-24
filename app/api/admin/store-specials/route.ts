import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { cookies } from 'next/headers';
import { validateSession } from '@/lib/auth';
import { manualStoresDefaults, type ManualStore } from '@/lib/manual-specials-data';

const MANUAL_KEY = 'manual_store_specials';

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
  if (user.role !== 'admin') {
    return { ok: false as const, error: 'Admin access required', status: 403 };
  }
  return { ok: true as const, user };
}

async function loadStores(redis: Redis | null): Promise<ManualStore[]> {
  if (!redis) return manualStoresDefaults;
  const stored = await redis.get(MANUAL_KEY);
  if (!stored) {
    await redis.set(MANUAL_KEY, JSON.stringify(manualStoresDefaults));
    return manualStoresDefaults;
  }
  const parsed = typeof stored === 'string' ? JSON.parse(stored) : stored;
  if (!Array.isArray(parsed)) return manualStoresDefaults;
  // Merge: add any default store that's missing in stored data
  const merged = [...parsed];
  for (const def of manualStoresDefaults) {
    if (!merged.find((s: ManualStore) => s.id === def.id)) merged.push(def);
  }
  return merged;
}

// GET — list all manual stores with their specials
export async function GET() {
  const auth = await requireAdminUser();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const redis = getRedis();
    const stores = await loadStores(redis);
    return NextResponse.json(stores);
  } catch (error) {
    console.error('GET /api/admin/store-specials error:', error);
    return NextResponse.json({ error: 'Failed to load stores' }, { status: 500 });
  }
}

// PUT — update specials for one store
// Body: { storeId: string, specials: ManualSpecial[] }
export async function PUT(request: NextRequest) {
  const auth = await requireAdminUser();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'KV not configured' }, { status: 500 });

    const body = await request.json();
    const { storeId, specials, referenceUrl } = body;
    if (!storeId || !Array.isArray(specials)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const stores = await loadStores(redis);
    const idx = stores.findIndex((s) => s.id === storeId);
    if (idx === -1) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

    stores[idx] = {
      ...stores[idx],
      specials,
      referenceUrl: typeof referenceUrl === 'string' ? referenceUrl : stores[idx].referenceUrl,
      updatedAt: new Date().toISOString(),
      updatedBy: auth.user.email,
    };

    await redis.set(MANUAL_KEY, JSON.stringify(stores));
    // Invalidate public specials cache so new data shows up immediately
    await redis.del('store-specials');

    return NextResponse.json({ ok: true, store: stores[idx] });
  } catch (error) {
    console.error('PUT /api/admin/store-specials error:', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
