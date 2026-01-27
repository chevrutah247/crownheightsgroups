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
    const stored = await redis.get('services');
    if (stored) {
      const data = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (Array.isArray(data)) return NextResponse.json(data);
    }
    return NextResponse.json([]);
  } catch (error) {
    console.error('GET services error:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    
    const newService = await request.json();
    
    let services: any[] = [];
    const stored = await redis.get('services');
    if (stored) {
      services = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (!Array.isArray(services)) services = [];
    }
    
    // Check for duplicate phone
    const phoneNorm = (newService.phone || '').replace(/[\s\-\(\)\.]/g, '');
    const duplicatePhone = services.find(s => {
      const existingPhone = (s.phone || '').replace(/[\s\-\(\)\.]/g, '');
      return existingPhone === phoneNorm && phoneNorm.length > 0;
    });
    if (duplicatePhone) {
      return NextResponse.json({ 
        error: 'This phone number is already used by "' + duplicatePhone.name + '"',
        type: 'duplicate_phone'
      }, { status: 400 });
    }
    
    const id = String(Date.now());
    const service = {
      id,
      name: newService.name || '',
      phone: newService.phone || '',
      categoryId: newService.categoryId || '1',
      description: newService.description || '',
      address: newService.address || '',
      website: newService.website || '',
      languages: newService.languages || ['English'],
      isPinned: newService.isPinned || false,
      status: 'approved',
      createdAt: new Date().toISOString()
    };
    
    services.push(service);
    await redis.set('services', JSON.stringify(services));
    
    return NextResponse.json(service);
  } catch (error) {
    console.error('POST service error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    
    const updated = await request.json();
    
    let services: any[] = [];
    const stored = await redis.get('services');
    if (stored) {
      services = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (!Array.isArray(services)) services = [];
    }
    
    const index = services.findIndex((s: any) => s.id === updated.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }
    
    // Check for duplicate phone (excluding current)
    const phoneNorm = (updated.phone || '').replace(/[\s\-\(\)\.]/g, '');
    const duplicatePhone = services.find((s, i) => {
      if (i === index) return false;
      const existingPhone = (s.phone || '').replace(/[\s\-\(\)\.]/g, '');
      return existingPhone === phoneNorm && phoneNorm.length > 0;
    });
    if (duplicatePhone) {
      return NextResponse.json({ 
        error: 'This phone number is already used by "' + duplicatePhone.name + '"',
        type: 'duplicate_phone'
      }, { status: 400 });
    }
    
    services[index] = {
      ...services[index],
      ...updated,
      status: updated.status || services[index].status || 'approved'
    };
    
    await redis.set('services', JSON.stringify(services));
    
    return NextResponse.json(services[index]);
  } catch (error) {
    console.error('PUT service error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    
    const { id } = await request.json();
    
    let services: any[] = [];
    const stored = await redis.get('services');
    if (stored) {
      services = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (!Array.isArray(services)) services = [];
    }
    
    services = services.filter((s: any) => s.id !== id);
    await redis.set('services', JSON.stringify(services));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE service error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
