// app/api/lottery/admin/history/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const poolWeekId = searchParams.get('poolWeekId');

    // If specific week requested, return its details
    if (poolWeekId) {
      const { data: poolWeek, error: poolError } = await supabase
        .from('pool_weeks')
        .select('*')
        .eq('id', poolWeekId)
        .single();

      if (poolError) {
        return NextResponse.json({ error: poolError.message }, { status: 500 });
      }

      // Get participants for this week
      const { data: entries, error: entriesError } = await supabase
        .from('pool_entries')
        .select(`
          *,
          lottery_users (
            id,
            email,
            first_name,
            last_name,
            phone
          )
        `)
        .eq('pool_week_id', poolWeekId)
        .eq('status', 'paid')
        .order('created_at', { ascending: true });

      if (entriesError) {
        return NextResponse.json({ error: entriesError.message }, { status: 500 });
      }

      const participants = (entries || []).map(entry => ({
        id: entry.id,
        first_name: entry.lottery_users?.first_name,
        last_name: entry.lottery_users?.last_name,
        email: entry.lottery_users?.email,
        phone: entry.lottery_users?.phone,
        amount_paid: entry.amount_paid,
        user_numbers: entry.user_numbers,
        created_at: entry.created_at,
      }));

      return NextResponse.json({
        poolWeek,
        participants,
      });
    }

    // Otherwise return all weeks (history)
    const { data: weeks, error: weeksError } = await supabase
      .from('pool_weeks')
      .select('*')
      .order('week_start', { ascending: false });

    if (weeksError) {
      return NextResponse.json({ error: weeksError.message }, { status: 500 });
    }

    return NextResponse.json({ weeks: weeks || [] });

  } catch (error: any) {
    console.error('Error fetching history:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
