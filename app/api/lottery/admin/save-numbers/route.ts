// app/api/lottery/admin/save-numbers/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { poolWeekId, adminNumbers } = await request.json();

    if (!poolWeekId) {
      return NextResponse.json({ error: 'Pool week ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('pool_weeks')
      .update({ admin_numbers: adminNumbers })
      .eq('id', poolWeekId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error saving numbers:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
