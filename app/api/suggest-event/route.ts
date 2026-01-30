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
    const stored = await redis.get('eventSuggestions');
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
    const stored = await redis.get('eventSuggestions');
    if (stored) {
      suggestions = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (!Array.isArray(suggestions)) suggestions = [];
    }
    const suggestion = {
      id: String(Date.now()),
      title: data.title || '',
      description: data.description || '',
      date: data.date || '',
      time: data.time || '',
      location: data.location || '',
      address: data.address || '',
      organizer: data.organizer || '',
      contactPhone: data.contactPhone || '',
      link: data.link || '',
      imageUrl: data.imageUrl || '',
      status: 'pending',
      submittedBy: data.submittedBy || 'anonymous',
      createdAt: new Date().toISOString()
    };
    suggestions.push(suggestion);
    await redis.set('eventSuggestions', JSON.stringify(suggestions));
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
    const stored = await redis.get('eventSuggestions');
    if (stored) {
      suggestions = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (!Array.isArray(suggestions)) suggestions = [];
    }
    const index = suggestions.findIndex((s: any) => s.id === id);
    if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (action === 'approve') {
      let events: any[] = [];
      const eventsStored = await redis.get('events');
      if (eventsStored) {
        events = typeof eventsStored === 'string' ? JSON.parse(eventsStored) : eventsStored;
        if (!Array.isArray(events)) events = [];
      }
      const s = suggestions[index];
      events.push({
        id: String(Date.now()),
        title: s.title,
        description: s.description,
        date: s.date,
        time: s.time,
        location: s.location,
        address: s.address,
        organizer: s.organizer,
        contactPhone: s.contactPhone,
        link: s.link,
        imageUrl: s.imageUrl,
        status: 'approved',
        createdAt: new Date().toISOString()
      });
      await redis.set('events', JSON.stringify(events));
      suggestions[index].status = 'approved';
    } else {
      suggestions[index].status = 'rejected';
    }
    await redis.set('eventSuggestions', JSON.stringify(suggestions));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
```

Также создайте файлы для campaigns (из предыдущего сообщения):

**Папка 3:** `app/api/campaigns/route.ts` — код из предыдущего сообщения

**Папка 4:** `app/api/suggest-campaign/route.ts` — код из предыдущего сообщения

Итого должно быть 4 новые папки:
```
app/api/
  events/route.ts
  suggest-event/route.ts
  campaigns/route.ts
  suggest-campaign/route.ts