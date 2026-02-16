// app/api/lottery/payment/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { Resend } from 'resend';

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
      referralCode,
      lotteryType,
      ticketQty: rawTicketQty
    } = body;

    const ticketQty = Math.min(Math.max(Math.floor(Number(rawTicketQty) || 1), 1), 10);

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
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (poolError && poolError.code !== 'PGRST116') {
      console.error('Error fetching pool week:', poolError);
      return NextResponse.json(
        { error: 'Database error: ' + poolError.message },
        { status: 500 }
      );
    }

    // Check if pool is expired (week_end has passed) — auto-close stale pools
    const now = new Date();
    if (poolWeek && new Date(poolWeek.week_end) < now) {
      console.log('Found expired open pool, closing it:', poolWeek.id);

      // Update stats and close
      const { count, data: oldEntries } = await supabase
        .from('pool_entries')
        .select('amount_paid', { count: 'exact' })
        .eq('pool_week_id', poolWeek.id)
        .eq('status', 'paid');

      const oldTotal = (oldEntries || []).reduce((sum, e) => sum + (e.amount_paid || 0), 0);

      await supabase
        .from('pool_weeks')
        .update({
          status: 'closed',
          total_participants: count || 0,
          total_amount: oldTotal,
        })
        .eq('id', poolWeek.id);

      // Also close any other stale open/numbers_sent pools
      await supabase
        .from('pool_weeks')
        .update({ status: 'closed' })
        .in('status', ['open', 'numbers_sent'])
        .lt('week_end', now.toISOString());

      poolWeek = null; // Force creation of new pool
    }

    if (!poolWeek) {
      // Create new pool week
      const { weekStart, weekEnd } = getNextPoolDates();

      const { data: newPool, error: newPoolError } = await supabase
        .from('pool_weeks')
        .insert({
          week_start: weekStart,
          week_end: weekEnd,
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

    // 4. Calculate amount based on lottery type
    const priceMap: Record<string, number> = {
      powerball: 300,      // $3.00 ($2 ticket + $1 service)
      megamillions: 600,   // $6.00 ($5 ticket + $1 service)
      both: 900,           // $9.00 ($7 tickets + $2 service)
    };
    const unitPriceCents = priceMap[lotteryType] || 300;
    const totalPriceCents = unitPriceCents * ticketQty;
    const totalPriceDollars = totalPriceCents / 100;

    let amountToPay = totalPriceCents;
    let creditsUsed = 0;

    if (user.credits && user.credits > 0) {
      const creditsInCents = Math.floor(user.credits * 100);
      if (creditsInCents >= amountToPay) {
        creditsUsed = totalPriceDollars;
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
      lottery_type: lotteryType || 'both',
      ticket_qty: ticketQty,
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

    // 7b. Update pool stats
    const { count: totalParticipants } = await supabase
      .from('pool_entries')
      .select('*', { count: 'exact', head: true })
      .eq('pool_week_id', poolWeek.id)
      .eq('status', 'paid');

    const { data: allEntries } = await supabase
      .from('pool_entries')
      .select('amount_paid')
      .eq('pool_week_id', poolWeek.id)
      .eq('status', 'paid');

    const totalAmount = (allEntries || []).reduce((sum, e) => sum + (e.amount_paid || 0), 0);

    await supabase
      .from('pool_weeks')
      .update({
        total_participants: totalParticipants || 0,
        total_amount: totalAmount,
      })
      .eq('id', poolWeek.id);

    // 8. Send confirmation email directly via Resend
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const weekEndDate = new Date(poolWeek.week_end).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      });
      const referralLink = `https://crownheightsgroups.com/lottery/join?ref=${user.referral_code}`;

      await resend.emails.send({
        from: 'Lottery Pool <lottery@crownheightsgroups.com>',
        to: user.email,
        subject: "🎉 You're In! Lottery Pool Confirmation",
        html: `
          <!DOCTYPE html>
          <html><head><meta charset="utf-8"></head>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f0f4f8;">
            <div style="background: linear-gradient(135deg, #1e3a5f, #3b82f6); border-radius: 16px; padding: 30px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 28px;">🎉 You're In!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Welcome to the Lottery Pool</p>
            </div>
            <div style="background: white; border-radius: 16px; padding: 30px; margin-top: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
              <p style="font-size: 18px; color: #333;">Hello <strong>${user.first_name}</strong>! 👋</p>
              <p style="font-size: 16px; color: #666; line-height: 1.6;">
                Thank you for joining this week's lottery pool${ticketQty > 1 ? ` with <strong>${ticketQty} shares</strong>` : ''}! Your payment of <strong>$${totalPriceDollars.toFixed(2)}</strong> has been confirmed.
              </p>
              <div style="background: #f0fdf4; border: 2px solid #86efac; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #166534; margin: 0 0 10px 0;">✅ What's Next?</h3>
                <ul style="color: #166534; margin: 0; padding-left: 20px;">
                  <li>We'll purchase lottery entries before the drawings</li>
                  <li>You'll receive an email with all the numbers</li>
                  <li>If we win, you'll be notified immediately!</li>
                </ul>
              </div>
              <div style="background: #fef3c7; border: 2px solid #fcd34d; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #92400e; margin: 0 0 10px 0;">🎁 Earn $1 Credit!</h3>
                <p style="color: #92400e; margin: 0 0 10px 0; font-size: 14px;">
                  Share your referral link with friends. For each friend who joins, you get $1 off your next entry!
                </p>
                <div style="background: white; padding: 10px; border-radius: 8px; word-break: break-all;">
                  <a href="${referralLink}" style="color: #3b82f6; font-size: 14px;">${referralLink}</a>
                </div>
              </div>
              <p style="font-size: 14px; color: #666;"><strong>Pool closes:</strong> ${weekEndDate} at 10:00 PM EST</p>
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #999; font-size: 12px; margin: 0;">
                  Medinat Hesed LLC - Lottery Pool<br>
                  <a href="https://crownheightsgroups.com/lottery" style="color: #3b82f6;">crownheightsgroups.com/lottery</a>
                </p>
              </div>
            </div>
          </body></html>
        `,
      });
      console.log('Confirmation email sent to:', user.email);
    } catch (emailErr) {
      console.error('Failed to send confirmation email:', emailErr);
    }

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

function getNextPoolDates(): { weekStart: string; weekEnd: string } {
  const now = new Date();
  const estNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const estDay = estNow.getDay();
  const estHour = estNow.getHours();

  let daysUntilThursday = (4 - estDay + 7) % 7;
  if (daysUntilThursday === 0 && estHour >= 22) {
    daysUntilThursday = 7;
  }

  const targetEST = new Date(estNow);
  targetEST.setDate(targetEST.getDate() + daysUntilThursday);
  targetEST.setHours(22, 0, 0, 0);

  const utcTarget = new Date(now.getTime() + (targetEST.getTime() - estNow.getTime()));
  const weekEnd = utcTarget.toISOString();

  const weekStartDate = new Date(utcTarget.getTime() - 7 * 24 * 60 * 60 * 1000 + 60 * 1000);
  const weekStart = weekStartDate.toISOString();

  return { weekStart, weekEnd };
}
