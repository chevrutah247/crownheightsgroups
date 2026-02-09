import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

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
