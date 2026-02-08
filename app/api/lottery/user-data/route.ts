// app/api/lottery/user-data/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Get user
    const { data: user, error: userError } = await supabase
      .from('lottery_users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found. Have you joined a pool yet?' }, { status: 404 });
    }

    // Get user's entries
    const { data: entries, error: entriesError } = await supabase
      .from('pool_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Get current open pool
    const { data: currentPool } = await supabase
      .from('pool_weeks')
      .select('*')
      .in('status', ['open', 'numbers_sent'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        referral_code: user.referral_code,
        credits: user.credits || 0,
        created_at: user.created_at,
      },
      entries: entries || [],
      currentPool,
    });

  } catch (error: any) {
    console.error('Error fetching user data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
