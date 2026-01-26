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
    
    // CHECK FOR DUPLICATES
    // 1. Check by name (case insensitive)
    const nameLower = newService.name?.toLowerCase().trim();
    const duplicateName = services.find(s => s.name?.toLowerCase().trim() === nameLower);
    if (duplicateName) {
      return NextResponse.json({ error: 'A service with this name already exists' }, { status: 400 });
    }
    
    // 2. Check by phone number (normalize: remove spaces, dashes, parentheses)
    const normalizePhone = (phone: string) => phone?.replace(/[\s\-\(\)\.]/g, '') || '';
    const phoneNorm = normalizePhone(newService.phone);
    if (phoneNorm) {
      const duplicatePhone = services.find(s => normalizePhone(s.phone) === phoneNorm);
      if (duplicatePhone) {
        return NextResponse.json({ error: `This phone number is already used by "${duplicatePhone.name}"` }, { status: 400 });
      }
    }
    
    // 3. Check by website (if provided)
    if (newService.website) {
      const websiteNorm = newService.website.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '').trim();
      const duplicateWebsite = services.find(s => {
        if (!s.website) return false;
        const existingNorm = s.website.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '').trim();
        return existingNorm === websiteNorm;
      });
      if (duplicateWebsite) {
        return NextResponse.json({ error: `This website is already used by "${duplicateWebsite.name}"` }, { status: 400 });
      }
    }
    
    const id = String(Date.now());
    const service = {
      id,
      name: newService.name,
      phone: newService.phone,
      secondPhone: newService.secondPhone || '',
      address: newService.address || '',
      website: newService.website || '',
      logo: newService.logo || '',
      categoryId: newService.categoryId || '1',
      description: newService.description || '',
      languages: newService.languages || ['English'],
      locationId: newService.locationId || '1',
      status: 'approved',
      isPinned: newService.isPinned || false,
      createdAt: new Date().toISOString()
    };
    
    services.push(service);
    await redis.set('services', JSON.stringify(services));
    
    return NextResponse.json(service);
  } catch (error) {
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
    
    // CHECK FOR DUPLICATES (excluding current service)
    const nameLower = updated.name?.toLowerCase().trim();
    const duplicateName = services.find((s, i) => i !== index && s.name?.toLowerCase().trim() === nameLower);
    if (duplicateName) {
      return NextResponse.json({ error: 'A service with this name already exists' }, { status: 400 });
    }
    
    const normalizePhone = (phone: string) => phone?.replace(/[\s\-\(\)\.]/g, '') || '';
    const phoneNorm = normalizePhone(updated.phone);
    if (phoneNorm) {
      const duplicatePhone = services.find((s, i) => i !== index && normalizePhone(s.phone) === phoneNorm);
      if (duplicatePhone) {
        return NextResponse.json({ error: `This phone number is already used by "${duplicatePhone.name}"` }, { status: 400 });
      }
    }
    
    if (updated.website) {
      const websiteNorm = updated.website.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '').trim();
      const duplicateWebsite = services.find((s, i) => {
        if (i === index || !s.website) return false;
        const existingNorm = s.website.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '').trim();
        return existingNorm === websiteNorm;
      });
      if (duplicateWebsite) {
        return NextResponse.json({ error: `This website is already used by "${duplicateWebsite.name}"` }, { status: 400 });
      }
    }
    
    services[index] = { ...services[index], ...updated };
    await redis.set('services', JSON.stringify(services));
    
    return NextResponse.json(services[index]);
  } catch (error) {
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
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
