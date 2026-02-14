// app/api/lottery/payment/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Square API via fetch (no SDK needed)
async function createSquarePayment(sourceId: string, amountCents: number, email: string, note: string) {
  const response = await fetch('https://connect.squareup.com/v2/payments', {
    method: 'POST',
    headers: {
      'Square-Version': '2024-01-18',
      'Authorization': `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source_id: sourceId,
      idempotency_key: randomUUID(),
      location_id: process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID,
      amount_money: {
        amount: amountCents,
        currency: 'USD',
      },
      note: note,
      buyer_email_address: email,
    }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    const errorMessage = data.errors?.[0]?.detail || 'Payment failed';
    throw new Error(errorMessage);
  }

  return data.payment;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      sourceId,
      email, 
      firstName, 
      lastName, 
      phone,
      userNumbers,
      referralCode
    } = body;

    console.log('Payment request received:', { email, firstName, lastName });

    if (!sourceId || !email || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 1. Get or create user
    let { data: user, error: userError } = await supabase
      .from('lottery_users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (userError && userError.code !== 'PGRST116') {
      console.error('Error fetching user:', userError);
      return NextResponse.json(
        { error: 'Database error: ' + userError.message },
        { status: 500 }
      );
    }

    if (!user) {
      // Create new user
      const newUserData: any = {
        email: email.toLowerCase(),
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
      };

      // Check if referred
      if (referralCode) {
        const { data: referrer } = await supabase
          .from('lottery_users')
          .select('id')
          .eq('referral_code', referralCode.toUpperCase())
          .single();
        
        if (referrer) {
          newUserData.referred_by = referrer.id;
        }
      }

      const { data: newUser, error: createError } = await supabase
        .from('lottery_users')
        .insert(newUserData)
        .select()
        .single();

      if (createError) {
        console.error('Error creating user:', createError);
        return NextResponse.json(
          { error: 'Failed to create user: ' + createError.message },
          { status: 500 }
        );
      }

      user = newUser;
      console.log('Created new user:', user.id);

      // Create referral record and credit $1 to referrer
      if (newUserData.referred_by) {
        await supabase.from('referrals').insert({
          referrer_id: newUserData.referred_by,
          referred_id: user.id,
        });

        // Credit $1 to referrer
        const { data: referrer } = await supabase
          .from('lottery_users')
          .select('credits')
          .eq('id', newUserData.referred_by)
          .single();

        if (referrer) {
          await supabase
            .from('lottery_users')
            .update({ credits: (referrer.credits || 0) + 1 })
            .eq('id', newUserData.referred_by);
        }
      }
    } else {
      console.log('Found existing user:', user.id);
    }

    // 2. Get current open pool week
    let { data: poolWeek, error: poolError } = await supabase
      .from('pool_weeks')
      .select('*')
      .eq('status', 'open')
      .single();

    if (poolError && poolError.code !== 'PGRST116') {
      console.error('Error fetching pool week:', poolError);
      return NextResponse.json(
        { error: 'Database error: ' + poolError.message },
        { status: 500 }
      );
    }

    if (!poolWeek) {
      // Create new pool week if none exists
      const now = new Date();
      const thursday = new Date(now);
      thursday.setDate(thursday.getDate() + ((4 - thursday.getDay() + 7) % 7));
      thursday.setHours(22, 0, 0, 0);
      
      if (now > thursday) {
        thursday.setDate(thursday.getDate() + 7);
      }

      const weekStart = new Date(thursday);
      weekStart.setDate(weekStart.getDate() - 7);
      weekStart.setHours(22, 1, 0, 0);

      const { data: newPool, error: newPoolError } = await supabase
        .from('pool_weeks')
        .insert({
          week_start: weekStart.toISOString(),
          week_end: thursday.toISOString(),
          status: 'open'
        })
        .select()
        .single();

      if (newPoolError) {
        console.error('Error creating pool week:', newPoolError);
        return NextResponse.json(
          { error: 'Failed to create pool week: ' + newPoolError.message },
          { status: 500 }
        );
      }

      poolWeek = newPool;
      console.log('Created new pool week:', poolWeek.id);
    }

    // 3. Check if user already has entry this week
    const { data: existingEntry } = await supabase
      .from('pool_entries')
      .select('*')
      .eq('user_id', user.id)
      .eq('pool_week_id', poolWeek.id)
      .single();

    if (existingEntry && existingEntry.status === 'paid') {
      return NextResponse.json(
        { error: 'You have already joined this week\'s pool' },
        { status: 400 }
      );
    }

    // 4. Calculate amount (check for credits)
    let amountToPay = 300; // $3.00 in cents
    let creditsUsed = 0;

    if (user.credits && user.credits > 0) {
      const creditsInCents = Math.floor(user.credits * 100);
      if (creditsInCents >= amountToPay) {
        creditsUsed = 3.00;
        amountToPay = 0;
      } else {
        creditsUsed = user.credits;
        amountToPay = amountToPay - creditsInCents;
      }
    }

    let paymentId = null;

    // 5. Process Square payment if needed
    if (amountToPay > 0) {
      try {
        console.log('Processing Square payment:', amountToPay, 'cents');
        
        const payment = await createSquarePayment(
          sourceId,
          amountToPay,
          email,
          `Lottery Pool Entry - Week ${poolWeek.id}`
        );

        paymentId = payment.id;
        console.log('Square payment successful:', paymentId);

      } catch (paymentError: any) {
        console.error('Square payment error:', paymentError);
        return NextResponse.json(
          { error: paymentError.message || 'Payment processing failed' },
          { status: 400 }
        );
      }
    }

    // 6. Create or update pool entry
    const entryData = {
      user_id: user.id,
      pool_week_id: poolWeek.id,
      amount_paid: (amountToPay / 100) + creditsUsed,
      credits_used: creditsUsed,
      payment_method: amountToPay > 0 ? 'square' : 'credits',
      payment_id: paymentId,
      user_numbers: userNumbers ? JSON.stringify(userNumbers) : null,
      status: 'paid',
    };

    const { data: entry, error: entryError } = existingEntry
      ? await supabase
          .from('pool_entries')
          .update(entryData)
          .eq('id', existingEntry.id)
          .select()
          .single()
      : await supabase
          .from('pool_entries')
          .insert(entryData)
          .select()
          .single();

    if (entryError) {
      console.error('Error creating entry:', entryError);
      return NextResponse.json(
        { error: 'Failed to create pool entry: ' + entryError.message },
        { status: 500 }
      );
    }

    console.log('Pool entry created:', entry.id);

    // 7. Deduct credits if used
    if (creditsUsed > 0) {
      await supabase
        .from('lottery_users')
        .update({ credits: (user.credits || 0) - creditsUsed })
        .eq('id', user.id);
    }

    // 8. Send confirmation email (non-blocking)
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/lottery/send-confirmation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        firstName: user.first_name,
        poolWeekEnd: poolWeek.week_end,
        referralCode: user.referral_code,
      }),
    }).catch(err => console.error('Failed to send confirmation email:', err));

    return NextResponse.json({
      success: true,
      message: 'Payment successful! You have joined this week\'s pool.',
      entry: {
        id: entry.id,
        poolWeekEnd: poolWeek.week_end,
      },
      user: {
        referralCode: user.referral_code,
        credits: (user.credits || 0) - creditsUsed,
      },
    });

  } catch (error: any) {
    console.error('Payment error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
