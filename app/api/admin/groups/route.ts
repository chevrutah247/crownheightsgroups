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
    
    const stored = await redis.get('groups');
    if (stored) {
      const data = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (Array.isArray(data)) return NextResponse.json(data);
    }
    return NextResponse.json([]);
  } catch (error) {
    console.error('GET groups error:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    
    const newGroup = await request.json();
    console.log('Creating group:', newGroup);
    
    let groups: any[] = [];
    const stored = await redis.get('groups');
    if (stored) {
      groups = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (!Array.isArray(groups)) groups = [];
    }
    
    const id = String(Date.now());
    
    // Handle both whatsappLinks array and single whatsappLink
    let whatsappLinks = newGroup.whatsappLinks || [];
    if (newGroup.whatsappLink && !whatsappLinks.length) {
      whatsappLinks = [newGroup.whatsappLink];
    }
    // Filter out empty links
    whatsappLinks = whatsappLinks.filter((link: string) => link && link.trim());
    
    const group = {
      id,
      title: newGroup.title || '',
      description: newGroup.description || '',
      whatsappLinks: whatsappLinks,
      whatsappLink: whatsappLinks[0] || '', // Keep for backwards compatibility
      categoryId: newGroup.categoryId || '1',
      locationId: newGroup.locationId || '1',
      language: newGroup.language || 'English',
      status: newGroup.status || 'approved',
      clicksCount: 0,
      isPinned: newGroup.isPinned || false,
      pinnedOrder: newGroup.pinnedOrder || 999,
      tags: newGroup.tags || [],
      createdAt: new Date().toISOString()
    };
    
    console.log('Saving group:', group);
    
    groups.push(group);
    await redis.set('groups', JSON.stringify(groups));
    
    return NextResponse.json(group);
  } catch (error) {
    console.error('POST groups error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    
    const updated = await request.json();
    console.log('Updating group:', updated);
    
    let groups: any[] = [];
    const stored = await redis.get('groups');
    if (stored) {
      groups = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (!Array.isArray(groups)) groups = [];
    }
    
    const index = groups.findIndex((g: any) => g.id === updated.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }
    
    // Handle whatsappLinks
    let whatsappLinks = updated.whatsappLinks || [];
    if (updated.whatsappLink && !whatsappLinks.length) {
      whatsappLinks = [updated.whatsappLink];
    }
    whatsappLinks = whatsappLinks.filter((link: string) => link && link.trim());
    
    groups[index] = {
      ...groups[index],
      ...updated,
      whatsappLinks: whatsappLinks,
      whatsappLink: whatsappLinks[0] || groups[index].whatsappLink || ''
    };
    
    console.log('Saved group:', groups[index]);
    
    await redis.set('groups', JSON.stringify(groups));
    
    return NextResponse.json(groups[index]);
  } catch (error) {
    console.error('PUT groups error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    
    const { id } = await request.json();
    
    let groups: any[] = [];
    const stored = await redis.get('groups');
    if (stored) {
      groups = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (!Array.isArray(groups)) groups = [];
    }
    
    groups = groups.filter((g: any) => g.id !== id);
    await redis.set('groups', JSON.stringify(groups));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE groups error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
