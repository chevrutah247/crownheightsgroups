import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const EMAIL_CONFIG = {
  user: 'contact@edonthego.org',
  pass: 'qvun irsl zsaf asux',
};

async function sendApprovalEmail(to: string, title: string, type: string) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: EMAIL_CONFIG.user, pass: EMAIL_CONFIG.pass },
    });
    const typeLabels: Record<string, string> = { group: 'WhatsApp Group', service: 'Business/Service', event: 'Event', campaign: 'Campaign' };
    const pageLinks: Record<string, string> = { group: '/groups', service: '/services', event: '/events', campaign: '/charity' };
    await transporter.sendMail({
      from: '"Crown Heights Groups" <' + EMAIL_CONFIG.user + '>',
      to,
      subject: '✅ Your ' + (typeLabels[type] || type) + ' has been approved!',
      html: '<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px;"><div style="background:linear-gradient(135deg,#10b981 0%,#059669 100%);padding:20px;border-radius:12px 12px 0 0;text-align:center;"><h2 style="color:white;margin:0;">✅ Approved!</h2></div><div style="background:#f8fafc;padding:20px;border:1px solid #e2e8f0;border-radius:0 0 12px 12px;"><p>Great news! Your submission <strong>"' + title + '"</strong> has been approved and is now live on Crown Heights Groups.</p><a href="https://crownheightsgroups.com' + (pageLinks[type] || '/') + '" style="display:inline-block;padding:12px 24px;background:#2563eb;color:white;text-decoration:none;border-radius:8px;font-weight:bold;margin-top:10px;">View on Site</a><p style="color:#666;font-size:0.9rem;margin-top:20px;">Thank you for contributing to our community!</p></div></div>',
    });
    console.log('Approval email sent to', to);
  } catch (error) {
    console.error('Failed to send approval email:', error);
  }
}

import { Redis } from '@upstash/redis';

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (url && token) return new Redis({ url, token });
  return null;
}

export async function GET() {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json([]);
    const stored = await redis.get('campaignSuggestions');
    if (stored) {
      const data = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (Array.isArray(data)) return NextResponse.json(data);
    }
    return NextResponse.json([]);
  } catch (error) {
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    const data = await request.json();
    let suggestions: any[] = [];
    const stored = await redis.get('campaignSuggestions');
    if (stored) {
      suggestions = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (!Array.isArray(suggestions)) suggestions = [];
    }
    const suggestion = {
      id: String(Date.now()),
      title: data.title || '',
      description: data.description || '',
      goal: data.goal || 0,
      donationLink: data.donationLink || '',
      imageUrl: data.imageUrl || '',
      organizer: data.organizer || '',
      status: 'pending',
      submittedBy: data.submittedBy || 'anonymous',
      createdAt: new Date().toISOString()
    };
    suggestions.push(suggestion);
    await redis.set('campaignSuggestions', JSON.stringify(suggestions));
    return NextResponse.json({ success: true, suggestion });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    const { id, action } = await request.json();
    let suggestions: any[] = [];
    const stored = await redis.get('campaignSuggestions');
    if (stored) {
      suggestions = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (!Array.isArray(suggestions)) suggestions = [];
    }
    const index = suggestions.findIndex((s: any) => s.id === id);
    if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (action === 'approve') {
      let campaigns: any[] = [];
      const campaignsStored = await redis.get('campaigns');
      if (campaignsStored) {
        campaigns = typeof campaignsStored === 'string' ? JSON.parse(campaignsStored) : campaignsStored;
        if (!Array.isArray(campaigns)) campaigns = [];
      }
      const s = suggestions[index];
      campaigns.push({
        id: String(Date.now()),
        title: s.title,
        description: s.description,
        goal: s.goal || 0,
        raised: 0,
        donationLink: s.donationLink,
        imageUrl: s.imageUrl,
        organizer: s.organizer,
        status: 'active',
        createdAt: new Date().toISOString()
      });
      await redis.set('campaigns', JSON.stringify(campaigns));
      suggestions[index].status = 'approved';
      // Send approval email
      if (s.submittedBy) {
        sendApprovalEmail(s.submittedBy, s.title, 'campaign');
      }
    } else {
      suggestions[index].status = 'rejected';
    }
    await redis.set('campaignSuggestions', JSON.stringify(suggestions));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}