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
    const stored = await redis.get('groupSuggestions');
    if (stored) {
      const data = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (Array.isArray(data)) return NextResponse.json(data);
    }
    return NextResponse.json([]);
  } catch (error) {
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    const data = await request.json();
    let suggestions: any[] = [];
    const stored = await redis.get('groupSuggestions');
    if (stored) {
      suggestions = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (!Array.isArray(suggestions)) suggestions = [];
    }
    const id = String(Date.now());
    const suggestion = {
      id,
      title: data.title || '',
      description: data.description || '',
      whatsappLink: data.whatsappLink || '',
      telegramLink: data.telegramLink || '',
      facebookLink: data.facebookLink || '',
      websiteLink: data.websiteLink || '',
      categoryId: data.categoryId || '1',
      locationId: data.locationId || '1',
      language: data.language || 'English',
      imageUrl: data.imageUrl || '',
      status: 'pending',
      submittedBy: data.submittedBy || 'anonymous',
      createdAt: new Date().toISOString()
    };
    suggestions.push(suggestion);
    await redis.set('groupSuggestions', JSON.stringify(suggestions));
    return NextResponse.json({ success: true, suggestion });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    const { id, action } = await request.json();
    let suggestions: any[] = [];
    const stored = await redis.get('groupSuggestions');
    if (stored) {
      suggestions = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (!Array.isArray(suggestions)) suggestions = [];
    }
    const index = suggestions.findIndex((s: any) => s.id === id);
    if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (action === 'approve') {
      let groups: any[] = [];
      const groupsStored = await redis.get('groups');
      if (groupsStored) {
        groups = typeof groupsStored === 'string' ? JSON.parse(groupsStored) : groupsStored;
        if (!Array.isArray(groups)) groups = [];
      }
      const s = suggestions[index];
      groups.push({
        id: String(Date.now()),
        title: s.title,
        description: s.description,
        whatsappLinks: s.whatsappLink ? [s.whatsappLink] : [],
        whatsappLink: s.whatsappLink || '',
        telegramLink: s.telegramLink || '',
        facebookLink: s.facebookLink || '',
        websiteLink: s.websiteLink || '',
        categoryId: s.categoryId,
        locationId: s.locationId,
        language: s.language,
        status: 'approved',
        clicksCount: 0,
        isPinned: false,
        createdAt: new Date().toISOString()
      });
      await redis.set('groups', JSON.stringify(groups));
      suggestions[index].status = 'approved';
    } else {
      suggestions[index].status = 'rejected';
    }
    await redis.set('groupSuggestions', JSON.stringify(suggestions));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}