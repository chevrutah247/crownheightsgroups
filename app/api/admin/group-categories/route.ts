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
    const stored = await redis.get('groupCategories');
    if (stored) {
      const data = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (Array.isArray(data)) return NextResponse.json(data);
    }
    return NextResponse.json([]);
  } catch (error) {
    console.error('GET categories error:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    
    const newCategory = await request.json();
    
    // Get existing categories only
    let categories: any[] = [];
    const stored = await redis.get('groupCategories');
    if (stored) {
      categories = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (!Array.isArray(categories)) categories = [];
    }
    
    const id = String(Date.now());
    const slug = newCategory.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    const category = {
      id,
      name: newCategory.name || '',
      nameRu: newCategory.nameRu || '',
      slug: slug,
      icon: newCategory.icon || '📁',
      order: newCategory.order || categories.length + 1
    };
    
    categories.push(category);
    
    // Save ONLY to groupCategories key
    await redis.set('groupCategories', JSON.stringify(categories));
    
    return NextResponse.json(category);
  } catch (error) {
    console.error('POST category error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    
    const updated = await request.json();
    
    // Get existing categories only
    let categories: any[] = [];
    const stored = await redis.get('groupCategories');
    if (stored) {
      categories = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (!Array.isArray(categories)) categories = [];
    }
    
    const index = categories.findIndex((c: any) => c.id === updated.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    
    const slug = updated.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    categories[index] = {
      ...categories[index],
      name: updated.name,
      nameRu: updated.nameRu || categories[index].nameRu || '',
      slug: slug,
      icon: updated.icon || categories[index].icon,
      order: updated.order !== undefined ? updated.order : categories[index].order
    };
    
    // Save ONLY to groupCategories key
    await redis.set('groupCategories', JSON.stringify(categories));
    
    return NextResponse.json(categories[index]);
  } catch (error) {
    console.error('PUT category error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    
    const { id } = await request.json();
    
    // Check if any groups use this category
    let groups: any[] = [];
    const groupsStored = await redis.get('groups');
    if (groupsStored) {
      groups = typeof groupsStored === 'string' ? JSON.parse(groupsStored) : groupsStored;
      if (!Array.isArray(groups)) groups = [];
    }
    
    if (groups.some(g => g.categoryId === id)) {
      return NextResponse.json({ error: 'Cannot delete category - groups are using it' }, { status: 400 });
    }
    
    // Get categories
    let categories: any[] = [];
    const stored = await redis.get('groupCategories');
    if (stored) {
      categories = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (!Array.isArray(categories)) categories = [];
    }
    
    categories = categories.filter((c: any) => c.id !== id);
    
    // Save ONLY to groupCategories key
    await redis.set('groupCategories', JSON.stringify(categories));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE category error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
