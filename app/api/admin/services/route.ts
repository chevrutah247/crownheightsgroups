import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { serviceContacts as defaultServices } from '@/lib/data';

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (url && token) return new Redis({ url, token });
  return null;
}

export async function GET() {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json(defaultServices);
    
    const stored = await redis.get('services');
    if (stored) {
      const data = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (Array.isArray(data)) return NextResponse.json(data);
    }
    
    await redis.set('services', JSON.stringify(defaultServices));
    return NextResponse.json(defaultServices);
  } catch (error) {
    console.error('GET services error:', error);
    return NextResponse.json(defaultServices);
  }
}

export async function POST(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }
    
    const newService = await request.json();
    console.log('Creating service:', newService);
    
    let services: any[] = [];
    const stored = await redis.get('services');
    if (stored) {
      services = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (!Array.isArray(services)) services = [...defaultServices];
    } else {
      services = [...defaultServices];
    }
    
    const id = String(Date.now());
    const service = {
      id,
      name: newService.name,
      phone: newService.phone,
      secondPhone: newService.secondPhone || '',
      categoryId: newService.categoryId || '1',
      description: newService.description || '',
      languages: newService.languages || ['English'],
      locationId: newService.locationId || '1',
      status: 'approved',
      isPinned: newService.isPinned || false,
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    services.push(service);
    await redis.set('services', JSON.stringify(services));
    
    console.log('Service created:', service);
    return NextResponse.json(service);
  } catch (error) {
    console.error('POST services error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }
    
    const updated = await request.json();
    
    let services: any[] = [];
    const stored = await redis.get('services');
    if (stored) {
      services = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (!Array.isArray(services)) services = [...defaultServices];
    } else {
      services = [...defaultServices];
    }
    
    const index = services.findIndex((s: any) => s.id === updated.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }
    
    services[index] = { ...services[index], ...updated };
    await redis.set('services', JSON.stringify(services));
    
    return NextResponse.json(services[index]);
  } catch (error) {
    console.error('PUT services error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }
    
    const { id } = await request.json();
    
    let services: any[] = [];
    const stored = await redis.get('services');
    if (stored) {
      services = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (!Array.isArray(services)) services = [...defaultServices];
    } else {
      services = [...defaultServices];
    }
    
    services = services.filter((s: any) => s.id !== id);
    await redis.set('services', JSON.stringify(services));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE services error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
