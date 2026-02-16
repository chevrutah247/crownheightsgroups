import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date().toISOString();

    // Find expired pools (both 'open' and 'numbers_sent')
    const { data: expiredPools, error } = await supabase
      .from('pool_weeks')
      .select('id, week_end, status')
      .in('status', ['open', 'numbers_sent'])
      .lt('week_end', now);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!expiredPools || expiredPools.length === 0) {
      // Check if there's an open pool at all, if not — create one
      const { data: activePools } = await supabase
        .from('pool_weeks')
        .select('id')
        .in('status', ['open', 'numbers_sent'])
        .limit(1);

      if (!activePools || activePools.length === 0) {
        // No active pool exists — create one
        const { weekStart, weekEnd } = getNextPoolDates();
        await supabase.from('pool_weeks').insert({
          week_start: weekStart,
          week_end: weekEnd,
          status: 'open',
        });
        return NextResponse.json({ message: 'No expired pools, created new open pool', closed: 0 });
      }

      return NextResponse.json({ message: 'No pools to close', closed: 0 });
    }

    // Update stats before closing
    for (const pool of expiredPools) {
      const { count, data: entries } = await supabase
        .from('pool_entries')
        .select('amount_paid', { count: 'exact' })
        .eq('pool_week_id', pool.id)
        .eq('status', 'paid');

      const totalAmount = (entries || []).reduce((sum, e) => sum + (e.amount_paid || 0), 0);

      await supabase
        .from('pool_weeks')
        .update({
          status: 'closed',
          total_participants: count || 0,
          total_amount: totalAmount,
        })
        .eq('id', pool.id);
    }

    // Create next week's pool
    const { weekStart, weekEnd } = getNextPoolDates();

    // Check no duplicate open pool
    const { data: existing } = await supabase
      .from('pool_weeks')
      .select('id')
      .eq('status', 'open')
      .limit(1);

    if (!existing || existing.length === 0) {
      await supabase.from('pool_weeks').insert({
        week_start: weekStart,
        week_end: weekEnd,
        status: 'open',
      });
    }

    return NextResponse.json({
      message: `Closed ${expiredPools.length} pool(s), created new pool`,
      closed: expiredPools.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function getNextPoolDates(): { weekStart: string; weekEnd: string } {
  // Thursday 10:00 PM EST = Friday 3:00 AM UTC (EST) or Friday 2:00 AM UTC (EDT)
  // We calculate the next Thursday 10 PM in America/New_York timezone
  const now = new Date();

  // Get current day in EST/EDT
  const estNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const estDay = estNow.getDay(); // 0=Sun, 4=Thu
  const estHour = estNow.getHours();

  let daysUntilThursday = (4 - estDay + 7) % 7;
  if (daysUntilThursday === 0 && estHour >= 22) {
    daysUntilThursday = 7;
  }

  // Build target date in EST
  const targetEST = new Date(estNow);
  targetEST.setDate(targetEST.getDate() + daysUntilThursday);
  targetEST.setHours(22, 0, 0, 0);

  // Convert back to UTC by finding the offset
  const utcTarget = new Date(now.getTime() + (targetEST.getTime() - estNow.getTime()));

  const weekEnd = utcTarget.toISOString();

  const weekStartDate = new Date(utcTarget.getTime() - 7 * 24 * 60 * 60 * 1000 + 60 * 1000); // -7 days + 1 minute
  const weekStart = weekStartDate.toISOString();

  return { weekStart, weekEnd };
}
