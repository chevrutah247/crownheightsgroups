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
    if (!redis) {
      return NextResponse.json([]);
    }
    
    const stored = await redis.get('groups');
    if (stored) {
      const data = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (Array.isArray(data)) {
        return NextResponse.json(data);
      }
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
    if (!redis) return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    
    const newGroup = await request.json();
    
    let groups: any[] = [];
    const stored = await redis.get('groups');
    if (stored) {
      groups = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (!Array.isArray(groups)) groups = [];
    }
    
    const id = String(Date.now());
    const group = {
      id,
      ...newGroup,
      createdAt: new Date().toISOString(),
      status: newGroup.status || 'pending',
      clicksCount: 0,
      isPinned: false,
      pinnedOrder: 999,
      tags: newGroup.tags || [],
    };
    
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
    if (!redis) return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    
    const updated = await request.json();
    
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
    
    groups[index] = { ...groups[index], ...updated };
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
    if (!redis) return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    
    const { id } = await request.json();
    
    let groups: any[] = [];
    const stored = await redis.get('groups');
    if (stored) {
      groups = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (!Array.isArray(groups)) groups = [];
    }
    
    const initialLength = groups.length;
    groups = groups.filter((g: any) => g.id !== id);
    
    if (groups.length === initialLength) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }
    
    await redis.set('groups', JSON.stringify(groups));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE groups error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
