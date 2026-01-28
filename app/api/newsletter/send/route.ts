import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import nodemailer from 'nodemailer';

const EMAIL_CONFIG = {
  user: 'contact@edonthego.org',
  pass: 'qvun irsl zsaf asux',
};

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (url && token) return new Redis({ url, token });
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    const frequency = searchParams.get('frequency') || 'weekly';
    
    if (secret !== process.env.CRON_SECRET && secret !== 'manual-trigger') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const redis = getRedis();
    if (!redis) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }
    
    const subscribersStored = await redis.get('newsletter_subscribers');
    let subscribers: any[] = [];
    if (subscribersStored) {
      subscribers = typeof subscribersStored === 'string' ? JSON.parse(subscribersStored) : subscribersStored;
    }
    
    const activeSubscribers = subscribers.filter(s => 
      s.status === 'active' && s.frequency === frequency
    );
    
    if (activeSubscribers.length === 0) {
      return NextResponse.json({ message: 'No subscribers for this frequency', sent: 0 });
    }
    
    const groupsStored = await redis.get('groups');
    let groups: any[] = [];
    if (groupsStored) {
      groups = typeof groupsStored === 'string' ? JSON.parse(groupsStored) : groupsStored;
    }
    
    const now = new Date();
    let startDate: Date;
    
    switch (frequency) {
      case 'daily':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    const newGroups = groups.filter(g => 
      g.status === 'approved' && 
      g.createdAt && 
      new Date(g.createdAt) >= startDate
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    if (newGroups.length === 0) {
      return NextResponse.json({ message: 'No new groups to report', sent: 0 });
    }
    
    const locationsStored = await redis.get('locations');
    let locations: any[] = [];
    if (locationsStored) {
      locations = typeof locationsStored === 'string' ? JSON.parse(locationsStored) : locationsStored;
    }
    
    const periodText = frequency === 'daily' ? 'today' : frequency === 'weekly' ? 'this week' : 'this month';
    
    const groupsHtml = newGroups.slice(0, 10).map((g, index) => {
      const location = locations.find(l => l.id === g.locationId);
      const link = g.whatsappLinks?.[0] || g.whatsappLink || '#';
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'];
      const bgColor = colors[index % colors.length];
      return `
        <div style="background: linear-gradient(135deg, ${bgColor}22 0%, ${bgColor}11 100%); border-left: 4px solid ${bgColor}; border-radius: 12px; padding: 20px; margin-bottom: 15px;">
          <h3 style="margin: 0 0 8px 0; color: #1a1a2e; font-size: 18px; font-weight: 700;">${g.title}</h3>
          ${g.description ? `<p style="margin: 0 0 12px 0; color: #4a4a68; font-size: 14px;">${g.description.slice(0, 100)}${g.description.length > 100 ? '...' : ''}</p>` : ''}
          <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
            <td style="color: #6b7280; font-size: 13px;">📍 ${location?.neighborhood || 'Worldwide'}</td>
            <td align="right"><a href="${link}" style="background: linear-gradient(135deg, #25D366 0%, #128C7E 100%); color: white; padding: 10px 24px; border-radius: 25px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">Join Group →</a></td>
          </tr></table>
        </div>
      `;
    }).join('');
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="margin: 0; padding: 0; background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);">
        <div style="font-family: 'Segoe UI', -apple-system, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          
          <div style="background: white; border-radius: 20px 20px 0 0; padding: 40px 30px; text-align: center;">
            <div style="font-size: 60px; margin-bottom: 15px;">🎉</div>
            <h1 style="color: #1a1a2e; margin: 0 0 10px 0; font-size: 28px; font-weight: 800;">
              ${newGroups.length} New Groups ${periodText.charAt(0).toUpperCase() + periodText.slice(1)}!
            </h1>
            <p style="color: #6b7280; margin: 0; font-size: 16px;">Fresh WhatsApp groups just for you</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px 30px; text-align: center;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
              <td align="center" style="color: white;">
                <div style="font-size: 32px; font-weight: 800;">${newGroups.length}</div>
                <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.9;">New Groups</div>
              </td>
              <td align="center" style="color: white;">
                <div style="font-size: 32px; font-weight: 800;">80+</div>
                <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.9;">Total Groups</div>
              </td>
              <td align="center" style="color: white;">
                <div style="font-size: 32px; font-weight: 800;">15+</div>
                <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.9;">Categories</div>
              </td>
            </tr></table>
          </div>
          
          <div style="background: white; padding: 30px;">
            <h2 style="color: #1a1a2e; margin: 0 0 20px 0; font-size: 20px; font-weight: 700;">🔥 Latest Groups</h2>
            ${groupsHtml}
            ${newGroups.length > 10 ? `<p style="text-align: center; color: #6b7280; font-size: 15px; margin: 20px 0 0 0;">... and <strong>${newGroups.length - 10}</strong> more waiting for you!</p>` : ''}
          </div>
          
          <div style="background: #f8fafc; border-radius: 0 0 20px 20px; padding: 30px; text-align: center;">
            <a href="https://crownheightsgroups.com/new" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 40px; border-radius: 30px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block;">
              🚀 View All New Groups
            </a>
            <p style="color: #9ca3af; font-size: 13px; margin: 20px 0 0 0;">
              Browse all categories at <a href="https://crownheightsgroups.com" style="color: #667eea; text-decoration: none; font-weight: 600;">CrownHeightsGroups.com</a>
            </p>
          </div>
          
          <div style="text-align: center; padding: 30px 20px;">
            <p style="color: rgba(255,255,255,0.8); font-size: 13px; margin: 0 0 10px 0;">
              You're receiving this because you subscribed to ${frequency} updates.
            </p>
            <a href="https://crownheightsgroups.com/unsubscribe" style="color: rgba(255,255,255,0.6); font-size: 12px;">Unsubscribe</a>
          </div>
          
        </div>
      </body>
      </html>
    `;
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_CONFIG.user,
        pass: EMAIL_CONFIG.pass,
      },
    });
    
    let sentCount = 0;
    const errors: string[] = [];
    
    for (const subscriber of activeSubscribers) {
      try {
        await transporter.sendMail({
          from: `"Crown Heights Groups" <${EMAIL_CONFIG.user}>`,
          to: subscriber.email,
          subject: `🎉 ${newGroups.length} New Groups Added ${periodText.charAt(0).toUpperCase() + periodText.slice(1)}!`,
          html: emailHtml,
        });
        
        sentCount++;
        
        const subIndex = subscribers.findIndex(s => s.id === subscriber.id);
        if (subIndex !== -1) {
          subscribers[subIndex].lastSentAt = new Date().toISOString();
        }
      } catch (err: any) {
        errors.push(`${subscriber.email}: ${err.message}`);
      }
    }
    
    await redis.set('newsletter_subscribers', JSON.stringify(subscribers));
    
    return NextResponse.json({ 
      success: true, 
      sent: sentCount,
      total: activeSubscribers.length,
      newGroups: newGroups.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Newsletter send error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
