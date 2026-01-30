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
    
    const stored = await redis.get('serviceSuggestions');
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
    const stored = await redis.get('serviceSuggestions');
    if (stored) {
      suggestions = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (!Array.isArray(suggestions)) suggestions = [];
    }
    
    const id = String(Date.now());
    const suggestion = {
      id,
      name: data.name || '',
      phone: data.phone || '',
      categoryId: data.categoryId || '1',
      description: data.description || '',
      type: 'service',
      status: 'pending',
      submittedBy: data.submittedBy || 'anonymous',
      createdAt: new Date().toISOString()
    };
    
    suggestions.push(suggestion);
    await redis.set('serviceSuggestions', JSON.stringify(suggestions));
    
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
    const stored = await redis.get('serviceSuggestions');
    if (stored) {
      suggestions = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (!Array.isArray(suggestions)) suggestions = [];
    }
    
    const index = suggestions.findIndex(s => s.id === id);
    if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    
    if (action === 'approve') {
      let services: any[] = [];
      const servicesStored = await redis.get('services');
      if (servicesStored) {
        services = typeof servicesStored === 'string' ? JSON.parse(servicesStored) : servicesStored;
        if (!Array.isArray(services)) services = [];
      }
      
      const s = suggestions[index];
      const service = {
        id: String(Date.now()),
        name: s.name,
        phone: s.phone,
        categoryId: s.categoryId,
        description: s.description,
        languages: ['English'],
        status: 'approved',
        isPinned: false,
        createdAt: new Date().toISOString()
      };
      
      services.push(service);
      await redis.set('services', JSON.stringify(services));
      suggestions[index].status = 'approved';
    } else if (action === 'reject') {
      suggestions[index].status = 'rejected';
    }
    
    await redis.set('serviceSuggestions', JSON.stringify(suggestions));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
