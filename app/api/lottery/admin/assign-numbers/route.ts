// app/api/lottery/admin/assign-numbers/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { entryId, assignedNumbers } = await request.json();

    if (!entryId) {
      return NextResponse.json({ error: 'Entry ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('pool_entries')
      .update({ assigned_numbers: assignedNumbers || null })
      .eq('id', entryId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error assigning numbers:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
