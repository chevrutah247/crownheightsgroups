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
    // Find open pools that have passed their end date
    const now = new Date().toISOString();

    const { data: expiredPools, error } = await supabase
      .from('pool_weeks')
      .select('id, week_end')
      .eq('status', 'open')
      .lt('week_end', now);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!expiredPools || expiredPools.length === 0) {
      return NextResponse.json({ message: 'No pools to close', closed: 0 });
    }

    // Close expired pools
    const { error: updateError } = await supabase
      .from('pool_weeks')
      .update({ status: 'closed' })
      .in('id', expiredPools.map(p => p.id));

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Create next week's pool automatically
    const nextThursday = getNextThursday10pmEST();
    const weekStart = new Date(nextThursday);
    weekStart.setDate(weekStart.getDate() - 7);
    weekStart.setHours(22, 1, 0, 0);

    await supabase.from('pool_weeks').insert({
      week_start: weekStart.toISOString(),
      week_end: nextThursday.toISOString(),
      status: 'open',
    });

    return NextResponse.json({
      message: `Closed ${expiredPools.length} pool(s), created new pool`,
      closed: expiredPools.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function getNextThursday10pmEST(): Date {
  // Use America/New_York to handle DST automatically
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
  const parts = formatter.formatToParts(now);
  const get = (type: string) => parseInt(parts.find(p => p.type === type)?.value || '0');

  const estDay = now.getDay(); // 0=Sun, 4=Thu
  let daysUntil = (4 - estDay + 7) % 7;
  if (daysUntil === 0 && get('hour') >= 22) {
    daysUntil = 7;
  }

  const target = new Date(now);
  target.setDate(target.getDate() + daysUntil);

  // Set to 22:00 EST/EDT (convert to UTC)
  const estDate = new Date(target.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  estDate.setHours(22, 0, 0, 0);
  const offset = target.getTime() - estDate.getTime();

  const result = new Date(target);
  result.setHours(22, 0, 0, 0);
  result.setTime(result.getTime() + offset);

  return result;
}
