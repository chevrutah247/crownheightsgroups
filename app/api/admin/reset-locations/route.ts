import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const defaultLocations = [
  { id: '1', neighborhood: 'Crown Heights', city: 'Brooklyn', state: 'NY', country: 'USA', status: 'approved', order: 1 },
  { id: '2', neighborhood: 'Williamsburg', city: 'Brooklyn', state: 'NY', country: 'USA', status: 'approved', order: 2 },
  { id: '3', neighborhood: 'Flatbush', city: 'Brooklyn', state: 'NY', country: 'USA', status: 'approved', order: 3 },
  { id: '4', neighborhood: 'Boro Park', city: 'Brooklyn', state: 'NY', country: 'USA', status: 'approved', order: 4 },
  { id: '5', neighborhood: 'Monsey', city: 'Monsey', state: 'NY', country: 'USA', status: 'approved', order: 5 },
  { id: '6', neighborhood: 'Lakewood', city: 'Lakewood', state: 'NJ', country: 'USA', status: 'approved', order: 6 },
  { id: '7', neighborhood: 'Five Towns', city: 'Long Island', state: 'NY', country: 'USA', status: 'approved', order: 7 },
  { id: '8', neighborhood: 'Queens', city: 'Queens', state: 'NY', country: 'USA', status: 'approved', order: 8 },
  { id: '9', neighborhood: 'Manhattan', city: 'Manhattan', state: 'NY', country: 'USA', status: 'approved', order: 9 },
  { id: '10', neighborhood: 'Los Angeles', city: 'Los Angeles', state: 'CA', country: 'USA', status: 'approved', order: 10 },
  { id: '11', neighborhood: 'Miami', city: 'Miami', state: 'FL', country: 'USA', status: 'approved', order: 11 },
  { id: '12', neighborhood: 'Chicago', city: 'Chicago', state: 'IL', country: 'USA', status: 'approved', order: 12 },
  { id: '13', neighborhood: 'Jerusalem', city: 'Jerusalem', state: '', country: 'Israel', status: 'approved', order: 13 },
  { id: '14', neighborhood: 'Tel Aviv', city: 'Tel Aviv', state: '', country: 'Israel', status: 'approved', order: 14 },
  { id: '15', neighborhood: 'Bnei Brak', city: 'Bnei Brak', state: '', country: 'Israel', status: 'approved', order: 15 },
  { id: '16', neighborhood: 'London', city: 'London', state: '', country: 'UK', status: 'approved', order: 16 },
  { id: '17', neighborhood: 'Toronto', city: 'Toronto', state: 'ON', country: 'Canada', status: 'approved', order: 17 },
  { id: '18', neighborhood: 'Montreal', city: 'Montreal', state: 'QC', country: 'Canada', status: 'approved', order: 18 },
  { id: '19', neighborhood: 'Melbourne', city: 'Melbourne', state: 'VIC', country: 'Australia', status: 'approved', order: 19 },
  { id: '20', neighborhood: 'Worldwide', city: '', state: '', country: 'Global', status: 'approved', order: 20 },
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
    if (!redis) return NextResponse.json({ error: 'No database' }, { status: 500 });
    await redis.set('locations', JSON.stringify(defaultLocations));
    return NextResponse.json({ success: true, count: defaultLocations.length });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
