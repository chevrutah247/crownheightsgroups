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
    if (!redis) return NextResponse.json({ groups: [], total: 0 });

    const searchParams = request.nextUrl.searchParams;
    const locationId = searchParams.get('location');
    const categoryId = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'popular';

    // Get groups from Redis
    const stored = await redis.get('groups');
    let groups: any[] = [];
    if (stored) {
      groups = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (!Array.isArray(groups)) groups = [];
    }

    // Only show approved groups
    let result = groups.filter((g: any) => g.status === 'approved');

    // Filter by location
    if (locationId) {
      result = result.filter((g: any) => g.locationId === locationId);
    }

    // Filter by category
    if (categoryId) {
      result = result.filter((g: any) => g.categoryId === categoryId);
    }

    // Search filter
    if (search) {
      const query = search.toLowerCase();
      result = result.filter((g: any) =>
        g.title?.toLowerCase().includes(query) ||
        g.description?.toLowerCase().includes(query) ||
        g.tags?.some((t: string) => t.toLowerCase().includes(query))
      );
    }

    // Pinned groups first, then sort
    const pinned = result.filter((g: any) => g.isPinned);
    const unpinned = result.filter((g: any) => !g.isPinned);

    pinned.sort((a: any, b: any) => (a.pinnedOrder || 999) - (b.pinnedOrder || 999));

    switch (sort) {
      case 'popular':
        unpinned.sort((a: any, b: any) => (b.clicksCount || 0) - (a.clicksCount || 0));
        break;
      case 'date':
        unpinned.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'alpha':
        unpinned.sort((a: any, b: any) => (a.title || '').localeCompare(b.title || ''));
        break;
    }

    const sorted = [...pinned, ...unpinned];

    // Get categories and locations for enrichment
    let categories: any[] = [];
    let locations: any[] = [];
    try {
      const [catData, locData] = await Promise.all([
        redis.get('group_categories'),
        redis.get('locations'),
      ]);
      if (catData) categories = typeof catData === 'string' ? JSON.parse(catData) : catData;
      if (locData) locations = typeof locData === 'string' ? JSON.parse(locData) : locData;
    } catch {}

    const enriched = sorted.map((group: any) => ({
      ...group,
      category: Array.isArray(categories) ? categories.find((c: any) => c.id === group.categoryId) : undefined,
      location: Array.isArray(locations) ? locations.find((l: any) => l.id === group.locationId) : undefined,
    }));

    return NextResponse.json({
      groups: enriched,
      total: enriched.length,
    });
  } catch (error) {
    console.error('GET groups error:', error);
    return NextResponse.json({ groups: [], total: 0 });
  }
}
