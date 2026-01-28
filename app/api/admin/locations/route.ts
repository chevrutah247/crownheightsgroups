import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (url && token) return new Redis({ url, token });
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json([]);
    
    const stored = await redis.get('locations');
    if (stored) {
      const data = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (Array.isArray(data)) return NextResponse.json(data);
    }
    return NextResponse.json([]);
  } catch (error) {
    console.error('GET locations error:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    
    const newLoc = await request.json();
    
    let locations: any[] = [];
    const stored = await redis.get('locations');
    if (stored) {
      locations = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (!Array.isArray(locations)) locations = [];
    }
    
    // Check for duplicate neighborhood name
    const duplicate = locations.find(l => 
      l.neighborhood.toLowerCase().trim() === newLoc.neighborhood?.toLowerCase().trim()
    );
    if (duplicate) {
      return NextResponse.json({ 
        error: 'A location with this name already exists',
        duplicate: true
      }, { status: 400 });
    }
    
    const id = String(Date.now());
    const location = {
      id,
      neighborhood: newLoc.neighborhood,
      city: newLoc.city || '',
      state: newLoc.state || '',
      country: newLoc.country || 'USA',
      zipCode: newLoc.zipCode || '',
      status: newLoc.status || 'approved',
      order: newLoc.order || locations.length + 1
    };
    
    locations.push(location);
    await redis.set('locations', JSON.stringify(locations));
    
    return NextResponse.json(location);
  } catch (error) {
    console.error('POST locations error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    
    const updated = await request.json();
    
    let locations: any[] = [];
    const stored = await redis.get('locations');
    if (stored) {
      locations = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (!Array.isArray(locations)) locations = [];
    }
    
    const index = locations.findIndex((l: any) => l.id === updated.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }
    
    locations[index] = { ...locations[index], ...updated };
    await redis.set('locations', JSON.stringify(locations));
    
    return NextResponse.json(locations[index]);
  } catch (error) {
    console.error('PUT locations error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    
    const { id } = await request.json();
    
    let locations: any[] = [];
    const stored = await redis.get('locations');
    if (stored) {
      locations = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (!Array.isArray(locations)) locations = [];
    }
    
    const initialLength = locations.length;
    locations = locations.filter((l: any) => l.id !== id);
    
    if (locations.length === initialLength) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }
    
    await redis.set('locations', JSON.stringify(locations));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE locations error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
