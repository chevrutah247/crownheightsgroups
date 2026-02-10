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

// Check if link is valid
async function checkLink(url: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10 sec timeout
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkChecker/1.0)'
      }
    });
    
    clearTimeout(timeout);
    
    // Check for WhatsApp specific errors
    if (url.includes('chat.whatsapp.com')) {
      // WhatsApp returns 200 even for invalid links, need to check with GET
      const getResponse = await fetch(url, {
        method: 'GET',
        signal: AbortSignal.timeout(10000),
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; LinkChecker/1.0)'
        }
      });
      const text = await getResponse.text();
      if (text.includes('invite link is invalid') || text.includes('This invite link has been revoked')) {
        return { valid: false, error: 'WhatsApp link is invalid or expired' };
      }
    }
    
    // Check for Telegram specific errors  
    if (url.includes('t.me/')) {
      const getResponse = await fetch(url, {
        method: 'GET',
        signal: AbortSignal.timeout(10000),
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; LinkChecker/1.0)'
        }
      });
      const text = await getResponse.text();
      if (text.includes('tgme_page_description') && text.includes('not exist')) {
        return { valid: false, error: 'Telegram link is invalid' };
      }
    }
    
    if (response.ok || response.status === 302 || response.status === 301) {
      return { valid: true };
    }
    
    if (response.status === 404) {
      return { valid: false, error: 'Link not found (404)' };
    }
    
    return { valid: true }; // Allow other status codes
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return { valid: false, error: 'Link timed out - may be invalid' };
    }
    // Network errors might be due to CORS, allow these
    return { valid: true };
  }
}

export async function POST(request: Request) {
  try {
    const { name, platform, link, description, language, submitterEmail } = await request.json();
    if (!name || !platform || !link) return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });

    // Validate URL format
    try {
      new URL(link);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Check if link is valid
    const linkCheck = await checkLink(link);
    if (!linkCheck.valid) {
      return NextResponse.json({ 
        error: `Link appears to be broken: ${linkCheck.error}. Please check and try again.` 
      }, { status: 400 });
    }

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
      const { data: suggestion, error: fetchError } = await supabase
        .from('torah_group_suggestions')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError || !suggestion) {
        return NextResponse.json({ error: 'Suggestion not found' }, { status: 404 });
      }
      
      // Check link again before approving
      const linkCheck = await checkLink(suggestion.link);
      if (!linkCheck.valid) {
        return NextResponse.json({ 
          error: `Cannot approve - link is broken: ${linkCheck.error}` 
        }, { status: 400 });
      }
      
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
