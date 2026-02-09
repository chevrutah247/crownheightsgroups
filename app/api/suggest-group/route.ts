import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Redis } from '@upstash/redis';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (url && token) return new Redis({ url, token });
  return null;
}

export async function POST(request: Request) {
  try {
    const { name, platform, link, description, language, submitterEmail } = await request.json();
    if (!name || !platform || !link) return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });

    const { error } = await supabase.from('torah_group_suggestions').insert({
      name, platform, link, description: description || null, language: language || 'english',
      submitted_by: submitterEmail || null, status: 'pending', created_at: new Date().toISOString()
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  const { data, error } = await supabase.from('torah_group_suggestions').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function PUT(request: Request) {
  try {
    const { id, action } = await request.json();
    
    if (action === 'approve') {
      // Get the suggestion
      const { data: suggestion, error: fetchError } = await supabase
        .from('torah_group_suggestions')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError || !suggestion) {
        return NextResponse.json({ error: 'Suggestion not found' }, { status: 404 });
      }
      
      // Add to Redis torah_groups
      const redis = getRedis();
      if (redis) {
        let groups: any[] = [];
        const stored = await redis.get('torah_groups');
        if (stored) {
          groups = typeof stored === 'string' ? JSON.parse(stored) : stored;
          if (!Array.isArray(groups)) groups = [];
        }
        
        const newGroup = {
          id: String(Date.now()),
          name: suggestion.name,
          platform: suggestion.platform,
          link: suggestion.link,
          description: suggestion.description || '',
          language: suggestion.language || 'english',
          languages: [suggestion.language || 'english'],
          createdAt: new Date().toISOString()
        };
        
        groups.push(newGroup);
        await redis.set('torah_groups', JSON.stringify(groups));
      }
      
      // Delete from suggestions
      await supabase.from('torah_group_suggestions').delete().eq('id', id);
      
      return NextResponse.json({ success: true });
    }
    
    if (action === 'reject') {
      await supabase.from('torah_group_suggestions').delete().eq('id', id);
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
