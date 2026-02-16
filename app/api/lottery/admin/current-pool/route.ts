// app/api/lottery/admin/current-pool/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Get current active pool week (open or numbers_sent)
    const { data: poolWeek, error: poolError } = await supabase
      .from('pool_weeks')
      .select('*')
      .in('status', ['open', 'numbers_sent'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (poolError && poolError.code !== 'PGRST116') {
      return NextResponse.json({ error: poolError.message }, { status: 500 });
    }

    if (!poolWeek) {
      return NextResponse.json({ poolWeek: null, participants: [] });
    }

    // Get all participants for this week with user info
    const { data: entries, error: entriesError } = await supabase
      .from('pool_entries')
      .select(`
        *,
        lottery_users (
          id,
          email,
          first_name,
          last_name,
          phone,
          referral_code
        )
      `)
      .eq('pool_week_id', poolWeek.id)
      .eq('status', 'paid')
      .order('created_at', { ascending: true });

    if (entriesError) {
      return NextResponse.json({ error: entriesError.message }, { status: 500 });
    }

    // Flatten the data
    const participants = (entries || []).map(entry => ({
      id: entry.id,
      user_id: entry.user_id,
      first_name: entry.lottery_users?.first_name,
      last_name: entry.lottery_users?.last_name,
      email: entry.lottery_users?.email,
      phone: entry.lottery_users?.phone,
      referral_code: entry.lottery_users?.referral_code,
      amount_paid: entry.amount_paid,
      credits_used: entry.credits_used,
      user_numbers: entry.user_numbers,
      assigned_numbers: entry.assigned_numbers,
      created_at: entry.created_at,
    }));

    return NextResponse.json({
      poolWeek,
      participants,
    });

  } catch (error: any) {
    console.error('Error fetching pool:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
