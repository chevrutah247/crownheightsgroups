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
    
    const stored = await redis.get('categorySuggestions');
    if (stored) {
      const data = typeof stored === 'string' ? JSON.parse(stored) : stored;
      return NextResponse.json(Array.isArray(data) ? data : []);
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
    
    const { name, type, suggestedBy, relatedItemId } = await request.json();
    
    let suggestions: any[] = [];
    const stored = await redis.get('categorySuggestions');
    if (stored) {
      suggestions = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (!Array.isArray(suggestions)) suggestions = [];
    }
    
    const suggestion = {
      id: String(Date.now()),
      name,
      type,
      suggestedBy,
      relatedItemId,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    suggestions.push(suggestion);
    await redis.set('categorySuggestions', JSON.stringify(suggestions));
    
    return NextResponse.json({ success: true, suggestion });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    
    const { id, action, newCategoryId, icon } = await request.json();
    
    let suggestions: any[] = [];
    const stored = await redis.get('categorySuggestions');
    if (stored) {
      suggestions = typeof stored === 'string' ? JSON.parse(stored) : stored;
    }
    
    const index = suggestions.findIndex(s => s.id === id);
    if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    
    const suggestion = suggestions[index];
    
    if (action === 'approve') {
      const catKey = suggestion.type === 'service' ? 'serviceCategories' : 'groupCategories';
      let categories: any[] = [];
      const catStored = await redis.get(catKey);
      if (catStored) {
        categories = typeof catStored === 'string' ? JSON.parse(catStored) : catStored;
      }
      
      const newCat = {
        id: String(Date.now()),
        name: suggestion.name,
        slug: suggestion.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        icon: icon || '📁',
        order: categories.length + 1
      };
      categories.push(newCat);
      await redis.set(catKey, JSON.stringify(categories));
      
      suggestions[index].status = 'approved';
      suggestions[index].approvedCategoryId = newCat.id;
    } else if (action === 'use-existing') {
      suggestions[index].status = 'mapped';
      suggestions[index].mappedToCategoryId = newCategoryId;
    } else if (action === 'reject') {
      suggestions[index].status = 'rejected';
    }
    
    await redis.set('categorySuggestions', JSON.stringify(suggestions));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    
    const { id } = await request.json();
    
    let suggestions: any[] = [];
    const stored = await redis.get('categorySuggestions');
    if (stored) {
      suggestions = typeof stored === 'string' ? JSON.parse(stored) : stored;
    }
    
    suggestions = suggestions.filter(s => s.id !== id);
    await redis.set('categorySuggestions', JSON.stringify(suggestions));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
