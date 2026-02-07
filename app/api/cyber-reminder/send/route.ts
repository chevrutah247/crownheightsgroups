import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Cyber reminder send endpoint',
    note: 'POST to trigger email sends, or let Vercel cron handle it'
  });
}

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // TODO: Add actual email sending logic here
  // 1. Get subscribers from database who need reminders
  // 2. Send emails using Resend
  // 3. Update last_sent timestamp

  return NextResponse.json({
    success: true,
    message: 'Reminder check complete'
  });
}
