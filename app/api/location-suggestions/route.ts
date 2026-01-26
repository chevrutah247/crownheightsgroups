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
    const stored = await redis.get('locationSuggestions');
    if (stored) {
      const data = typeof stored === 'string' ? JSON.parse(stored) : stored;
      return NextResponse.json(Array.isArray(data) ? data : []);
    }
    return NextResponse.json([]);
  } catch (error) {
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'No DB' }, { status: 500 });
    const { neighborhood, city, state, country, suggestedBy } = await request.json();
    let suggestions: any[] = [];
    const stored = await redis.get('locationSuggestions');
    if (stored) { suggestions = typeof stored === 'string' ? JSON.parse(stored) : stored; }
    const suggestion = { id: String(Date.now()), neighborhood, city: city || '', state: state || '', country: country || 'USA', suggestedBy, status: 'pending', createdAt: new Date().toISOString() };
    suggestions.push(suggestion);
    await redis.set('locationSuggestions', JSON.stringify(suggestions));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'No DB' }, { status: 500 });
    const { id, action } = await request.json();
    let suggestions: any[] = [];
    const stored = await redis.get('locationSuggestions');
    if (stored) { suggestions = typeof stored === 'string' ? JSON.parse(stored) : stored; }
    const index = suggestions.findIndex(s => s.id === id);
    if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (action === 'approve') {
      const s = suggestions[index];
      let locations: any[] = [];
      const locStored = await redis.get('locations');
      if (locStored) { locations = typeof locStored === 'string' ? JSON.parse(locStored) : locStored; }
      locations.push({ id: String(Date.now()), neighborhood: s.neighborhood, city: s.city, state: s.state, country: s.country, status: 'approved', order: locations.length + 1 });
      await redis.set('locations', JSON.stringify(locations));
      suggestions[index].status = 'approved';
    } else { suggestions[index].status = 'rejected'; }
    await redis.set('locationSuggestions', JSON.stringify(suggestions));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
