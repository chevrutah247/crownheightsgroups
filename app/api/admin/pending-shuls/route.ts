import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { pendingShulsDefaults, defaultShuls, type PendingShul, type Shul } from '@/lib/shuls-data';

const PENDING_KEY = 'pending_shuls';
const SHULS_KEY = 'shuls_directory';

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (url && token) return new Redis({ url, token });
  return null;
}

async function getPending(redis: Redis | null): Promise<PendingShul[]> {
  if (!redis) return pendingShulsDefaults;

  const stored = await redis.get(PENDING_KEY);
  if (!stored) {
    await redis.set(PENDING_KEY, JSON.stringify(pendingShulsDefaults));
    return pendingShulsDefaults;
  }

  const parsed = typeof stored === 'string' ? JSON.parse(stored) : stored;
  return Array.isArray(parsed) ? parsed : pendingShulsDefaults;
}

// GET — list all pending shuls
export async function GET() {
  try {
    const redis = getRedis();
    const pending = await getPending(redis);
    return NextResponse.json(pending);
  } catch (error) {
    console.error('GET /api/admin/pending-shuls error:', error);
    return NextResponse.json(pendingShulsDefaults);
  }
}

// PUT — approve (move to active shuls) or delete a pending shul
export async function PUT(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) {
      return NextResponse.json({ error: 'KV is not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { id, action, address, crossStreets, phone, contactName } = body;

    if (!id || !['approve', 'delete'].includes(action)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const pending = await getPending(redis);
    const index = pending.findIndex((s) => s.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Pending shul not found' }, { status: 404 });
    }

    if (action === 'approve') {
      // Must have an address to approve
      const finalAddress = address || pending[index].address;
      if (!finalAddress) {
        return NextResponse.json({ error: 'Address is required to approve' }, { status: 400 });
      }

      // Add to active shuls
      const shulsStored = await redis.get(SHULS_KEY);
      const shuls: Shul[] = shulsStored
        ? (typeof shulsStored === 'string' ? JSON.parse(shulsStored) : shulsStored)
        : defaultShuls;

      const newShul: Shul = {
        id: pending[index].id,
        name: pending[index].name,
        address: finalAddress,
        crossStreets: crossStreets || pending[index].crossStreets,
        phone: phone || pending[index].phone,
        contactName: contactName || pending[index].contactName,
      };

      shuls.push(newShul);
      await redis.set(SHULS_KEY, JSON.stringify(shuls));
    }

    // Remove from pending
    pending.splice(index, 1);
    await redis.set(PENDING_KEY, JSON.stringify(pending));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('PUT /api/admin/pending-shuls error:', error);
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}

// POST — add a new pending shul
export async function POST(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) {
      return NextResponse.json({ error: 'KV is not configured' }, { status: 500 });
    }

    const { name, address, crossStreets, phone, contactName, source } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const pending = await getPending(redis);
    const newPending: PendingShul = {
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      name,
      address: address || '',
      crossStreets,
      phone,
      contactName,
      source: source || 'manual',
      addedAt: new Date().toISOString().split('T')[0],
    };

    pending.push(newPending);
    await redis.set(PENDING_KEY, JSON.stringify(pending));

    return NextResponse.json({ ok: true, shul: newPending });
  } catch (error) {
    console.error('POST /api/admin/pending-shuls error:', error);
    return NextResponse.json({ error: 'Failed to add' }, { status: 500 });
  }
}
