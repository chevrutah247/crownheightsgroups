import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { categories as defaultCategories } from '@/lib/data';

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (url && token) return new Redis({ url, token });
  return null;
}

export async function GET() {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json(defaultCategories);
    const stored = await redis.get('categories');
    if (stored && Array.isArray(stored)) return NextResponse.json(stored);
    await redis.set('categories', JSON.stringify(defaultCategories));
    return NextResponse.json(defaultCategories);
  } catch (error) {
    return NextResponse.json(defaultCategories);
  }
}

export async function POST(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    const newCat = await request.json();
    let categories = await redis.get('categories') as any[] || [...defaultCategories];
    const id = String(Date.now());
    const slug = newCat.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const category = { id, ...newCat, slug };
    categories.push(category);
    await redis.set('categories', JSON.stringify(categories));
    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    const updated = await request.json();
    let categories = await redis.get('categories') as any[] || [...defaultCategories];
    const index = categories.findIndex((c: any) => c.id === updated.id);
    if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    categories[index] = { ...categories[index], ...updated };
    await redis.set('categories', JSON.stringify(categories));
    return NextResponse.json(categories[index]);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    const { id } = await request.json();
    let categories = await redis.get('categories') as any[] || [...defaultCategories];
    categories = categories.filter((c: any) => c.id !== id);
    await redis.set('categories', JSON.stringify(categories));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
