import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const { name, phone, email, website, address, description, category, submitterEmail } = data;

    if (!name || !phone || !category) {
      return NextResponse.json({ error: 'Name, phone, and category are required' }, { status: 400 });
    }

    // Save to service_suggestions table
    const { data: suggestion, error } = await supabase
      .from('service_suggestions')
      .insert({
        name,
        phone,
        email: email || null,
        website: website || null,
        address: address || null,
        description: description || null,
        category,
        submitted_by: submitterEmail || null,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving suggestion:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, suggestion });

  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('service_suggestions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, action } = await request.json();

    if (!id || !action) {
      return NextResponse.json({ error: 'ID and action required' }, { status: 400 });
    }

    if (action === 'approve') {
      // Get the suggestion
      const { data: suggestion, error: fetchError } = await supabase
        .from('service_suggestions')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !suggestion) {
        return NextResponse.json({ error: 'Suggestion not found' }, { status: 404 });
      }

      // Create the service
      const { error: createError } = await supabase
        .from('services')
        .insert({
          name: suggestion.name,
          phone: suggestion.phone,
          email: suggestion.email,
          website: suggestion.website,
          address: suggestion.address,
          description: suggestion.description,
          status: 'approved',
        });

      if (createError) {
        console.error('Error creating service:', createError);
        return NextResponse.json({ error: createError.message }, { status: 500 });
      }

      // Delete the suggestion
      await supabase
        .from('service_suggestions')
        .delete()
        .eq('id', id);

      return NextResponse.json({ success: true, action: 'approved' });

    } else if (action === 'reject') {
      // Delete the suggestion
      const { error } = await supabase
        .from('service_suggestions')
        .delete()
        .eq('id', id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, action: 'rejected' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
