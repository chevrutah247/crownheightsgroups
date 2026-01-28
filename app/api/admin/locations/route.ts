import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const defaultLocations = [
  { id: '1', neighborhood: 'Crown Heights', city: 'Brooklyn', state: 'NY', country: 'USA', zipCode: '11213', status: 'approved', order: 1 },
  { id: '2', neighborhood: 'Williamsburg', city: 'Brooklyn', state: 'NY', country: 'USA', zipCode: '11211', status: 'approved', order: 2 },
  { id: '3', neighborhood: 'Flatbush', city: 'Brooklyn', state: 'NY', country: 'USA', zipCode: '11230', status: 'approved', order: 3 },
  { id: '4', neighborhood: 'Boro Park', city: 'Brooklyn', state: 'NY', country: 'USA', zipCode: '11219', status: 'approved', order: 4 },
  { id: '5', neighborhood: 'Monsey', city: 'Monsey', state: 'NY', country: 'USA', zipCode: '10952', status: 'approved', order: 5 },
  { id: '6', neighborhood: 'Lakewood', city: 'Lakewood', state: 'NJ', country: 'USA', zipCode: '08701', status: 'approved', order: 6 },
  { id: '7', neighborhood: 'Five Towns', city: 'Long Island', state: 'NY', country: 'USA', zipCode: '11516', status: 'approved', order: 7 },
  { id: '8', neighborhood: 'Queens', city: 'Queens', state: 'NY', country: 'USA', zipCode: '11367', status: 'approved', order: 8 },
  { id: '9', neighborhood: 'Manhattan', city: 'Manhattan', state: 'NY', country: 'USA', zipCode: '10002', status: 'approved', order: 9 },
  { id: '10', neighborhood: 'Los Angeles', city: 'Los Angeles', state: 'CA', country: 'USA', zipCode: '90035', status: 'approved', order: 10 },
  { id: '11', neighborhood: 'Miami', city: 'Miami', state: 'FL', country: 'USA', zipCode: '33154', status: 'approved', order: 11 },
  { id: '12', neighborhood: 'Chicago', city: 'Chicago', state: 'IL', country: 'USA', zipCode: '60659', status: 'approved', order: 12 },
  { id: '13', neighborhood: 'Jerusalem', city: 'Jerusalem', state: '', country: 'Israel', zipCode: '', status: 'approved', order: 13 },
  { id: '14', neighborhood: 'Tel Aviv', city: 'Tel Aviv', state: '', country: 'Israel', zipCode: '', status: 'approved', order: 14 },
  { id: '15', neighborhood: 'Bnei Brak', city: 'Bnei Brak', state: '', country: 'Israel', zipCode: '', status: 'approved', order: 15 },
  { id: '16', neighborhood: 'London', city: 'London', state: '', country: 'UK', zipCode: 'N16', status: 'approved', order: 16 },
  { id: '17', neighborhood: 'Toronto', city: 'Toronto', state: 'ON', country: 'Canada', zipCode: 'M3H', status: 'approved', order: 17 },
  { id: '18', neighborhood: 'Montreal', city: 'Montreal', state: 'QC', country: 'Canada', zipCode: 'H3W', status: 'approved', order: 18 },
  { id: '19', neighborhood: 'Melbourne', city: 'Melbourne', state: 'VIC', country: 'Australia', zipCode: '3183', status: 'approved', order: 19 },
  { id: '20', neighborhood: 'Worldwide', city: '', state: '', country: 'Global', zipCode: '', status: 'approved', order: 20 },
];

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (url && token) return new Redis({ url, token });
  return null;
}

export async function GET() {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json(defaultLocations);
    
    const stored = await redis.get('locations');
    if (stored) {
      const data = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (Array.isArray(data) && data.length > 0) {
        return NextResponse.json(data);
      }
    }
    
    // Initialize with defaults if empty
    await redis.set('locations', JSON.stringify(defaultLocations));
    return NextResponse.json(defaultLocations);
  } catch (error) {
    console.error('GET locations error:', error);
    return NextResponse.json(defaultLocations);
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
    } else {
      locations = [...defaultLocations];
    }
    
    const id = String(Date.now());
    const location = {
      id,
      neighborhood: newLoc.neighborhood,
      city: newLoc.city || '',
      state: newLoc.state || '',
      country: newLoc.country || 'USA',
      zipCode: newLoc.zipCode || '',
      status: 'approved',
      order: locations.length + 1
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
    }
    
    const index = locations.findIndex((l: any) => l.id === updated.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }
    
    locations[index] = {
      ...locations[index],
      neighborhood: updated.neighborhood ?? locations[index].neighborhood,
      city: updated.city ?? locations[index].city,
      state: updated.state ?? locations[index].state,
      country: updated.country ?? locations[index].country,
      zipCode: updated.zipCode ?? locations[index].zipCode ?? '',
      status: updated.status ?? locations[index].status,
      order: updated.order ?? locations[index].order,
    };
    
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
    }
    
    locations = locations.filter((l: any) => l.id !== id);
    await redis.set('locations', JSON.stringify(locations));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE locations error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
