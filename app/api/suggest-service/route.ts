import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Redis } from '@upstash/redis';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (url && token) return new Redis({ url, token });
  return null;
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, phone, email, website, address, description, category, submitterEmail } = data;

    if (!name || !phone || !category) {
      return NextResponse.json({ error: 'Name, phone, and category are required' }, { status: 400 });
    }

    const { data: suggestion, error } = await supabase
      .from('service_suggestions')
      .insert({
        name, phone,
        email: email || null,
        website: website || null,
        address: address || null,
        description: description || null,
        category,
        submitted_by: submitterEmail || null,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, suggestion });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('service_suggestions')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, action } = await request.json();

    if (!id || !action) {
      return NextResponse.json({ error: 'ID and action required' }, { status: 400 });
    }

    if (action === 'approve') {
      // Get the suggestion from Supabase
      const { data: suggestion, error: fetchError } = await supabase
        .from('service_suggestions')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !suggestion) {
        return NextResponse.json({ error: 'Suggestion not found' }, { status: 404 });
      }

      // Add to Redis (where services are stored)
      const redis = getRedis();
      if (!redis) {
        return NextResponse.json({ error: 'Redis not available' }, { status: 500 });
      }

      let services: any[] = [];
      const stored = await redis.get('services');
      if (stored) {
        services = typeof stored === 'string' ? JSON.parse(stored) : stored;
        if (!Array.isArray(services)) services = [];
      }

      const newService = {
        id: String(Date.now()),
        name: suggestion.name,
        phone: suggestion.phone,
        categoryId: '1',
        description: suggestion.description || '',
        address: suggestion.address || '',
        website: suggestion.website || '',
        email: suggestion.email || '',
        languages: ['English'],
        isPinned: false,
        status: 'approved',
        createdAt: new Date().toISOString()
      };

      services.push(newService);
      await redis.set('services', JSON.stringify(services));

      // Delete suggestion from Supabase
      await supabase.from('service_suggestions').delete().eq('id', id);

      return NextResponse.json({ success: true, action: 'approved' });

    } else if (action === 'reject') {
      await supabase.from('service_suggestions').delete().eq('id', id);
      return NextResponse.json({ success: true, action: 'rejected' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
