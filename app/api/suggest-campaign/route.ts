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
    const stored = await redis.get('campaignSuggestions');
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
    const stored = await redis.get('campaignSuggestions');
    if (stored) {
      suggestions = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (!Array.isArray(suggestions)) suggestions = [];
    }
    const suggestion = {
      id: String(Date.now()),
      title: data.title || '',
      description: data.description || '',
      goal: data.goal || 0,
      donationLink: data.donationLink || '',
      imageUrl: data.imageUrl || '',
      organizer: data.organizer || '',
      status: 'pending',
      submittedBy: data.submittedBy || 'anonymous',
      createdAt: new Date().toISOString()
    };
    suggestions.push(suggestion);
    await redis.set('campaignSuggestions', JSON.stringify(suggestions));
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
    const stored = await redis.get('campaignSuggestions');
    if (stored) {
      suggestions = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (!Array.isArray(suggestions)) suggestions = [];
    }
    const index = suggestions.findIndex((s: any) => s.id === id);
    if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (action === 'approve') {
      let campaigns: any[] = [];
      const campaignsStored = await redis.get('campaigns');
      if (campaignsStored) {
        campaigns = typeof campaignsStored === 'string' ? JSON.parse(campaignsStored) : campaignsStored;
        if (!Array.isArray(campaigns)) campaigns = [];
      }
      const s = suggestions[index];
      campaigns.push({
        id: String(Date.now()),
        title: s.title,
        description: s.description,
        goal: s.goal || 0,
        raised: 0,
        donationLink: s.donationLink,
        imageUrl: s.imageUrl,
        organizer: s.organizer,
        status: 'active',
        createdAt: new Date().toISOString()
      });
      await redis.set('campaigns', JSON.stringify(campaigns));
      suggestions[index].status = 'approved';
    } else {
      suggestions[index].status = 'rejected';
    }
    await redis.set('campaignSuggestions', JSON.stringify(suggestions));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}