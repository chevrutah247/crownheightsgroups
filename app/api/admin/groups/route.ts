import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { groups as defaultGroups } from '@/lib/data';

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (url && token) {
    return new Redis({ url, token });
  }
  return null;
}

// Get all groups
export async function GET() {
  try {
    const redis = getRedis();
    if (!redis) {
      return NextResponse.json(defaultGroups);
    }
    
    const stored = await redis.get('groups');
    if (stored && Array.isArray(stored)) {
      return NextResponse.json(stored);
    }
    
    // Initialize with default groups
    await redis.set('groups', JSON.stringify(defaultGroups));
    return NextResponse.json(defaultGroups);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(defaultGroups);
  }
}

// Update a group
export async function PUT(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }
    
    const updatedGroup = await request.json();
    console.log('PUT received:', updatedGroup);
    
    let groups = await redis.get('groups') as any[];
    if (!groups || !Array.isArray(groups)) {
      groups = [...defaultGroups];
    }
    
    const index = groups.findIndex((g: any) => g.id === updatedGroup.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }
    
    groups[index] = { ...groups[index], ...updatedGroup };
    await redis.set('groups', JSON.stringify(groups));
    
    return NextResponse.json(groups[index]);
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// Create a new group
export async function POST(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }
    
    const newGroup = await request.json();
    console.log('POST received:', newGroup);
    
    let groups = await redis.get('groups') as any[];
    if (!groups || !Array.isArray(groups)) {
      groups = [...defaultGroups];
    }
    
    const id = String(Date.now());
    const group = {
      id,
      title: newGroup.title || 'Untitled',
      description: newGroup.description || '',
      whatsappLink: newGroup.whatsappLink || '',
      categoryId: newGroup.categoryId || '1',
      locationId: newGroup.locationId || '1',
      language: newGroup.language || 'English',
      tags: newGroup.tags || [],
      isPinned: newGroup.isPinned || false,
      clicksCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'approved'
    };
    
    groups.push(group);
    await redis.set('groups', JSON.stringify(groups));
    
    console.log('Group created:', group);
    return NextResponse.json(group);
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// Delete a group
export async function DELETE(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }
    
    const { id } = await request.json();
    console.log('DELETE received:', id);
    
    let groups = await redis.get('groups') as any[];
    if (!groups || !Array.isArray(groups)) {
      groups = [...defaultGroups];
    }
    
    groups = groups.filter((g: any) => g.id !== id);
    await redis.set('groups', JSON.stringify(groups));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
