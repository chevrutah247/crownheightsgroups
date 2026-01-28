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

// This endpoint can be called by a cron job (e.g., Vercel Cron)
// Add to vercel.json: { "crons": [{ "path": "/api/newsletter/send?secret=YOUR_SECRET", "schedule": "0 9 * * 0" }] }
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    const frequency = searchParams.get('frequency') || 'weekly';
    
    // Simple security check - in production use a proper secret
    if (secret !== process.env.CRON_SECRET && secret !== 'manual-trigger') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const redis = getRedis();
    if (!redis) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }
    
    // Get subscribers for this frequency
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
    
    // Get new groups from the past week/day/month
    const groupsStored = await redis.get('groups');
    let groups: any[] = [];
    if (groupsStored) {
      groups = typeof groupsStored === 'string' ? JSON.parse(groupsStored) : groupsStored;
    }
    
    // Calculate date range based on frequency
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
    
    // Get locations for group names
    const locationsStored = await redis.get('locations');
    let locations: any[] = [];
    if (locationsStored) {
      locations = typeof locationsStored === 'string' ? JSON.parse(locationsStored) : locationsStored;
    }
    
    // Create email content
    const periodText = frequency === 'daily' ? 'today' : frequency === 'weekly' ? 'this week' : 'this month';
    
    const groupsHtml = newGroups.slice(0, 10).map(g => {
      const location = locations.find(l => l.id === g.locationId);
      const link = g.whatsappLinks?.[0] || g.whatsappLink || '#';
      return `
        <div style="background: #f8fafc; border-radius: 8px; padding: 15px; margin-bottom: 10px;">
          <h3 style="margin: 0 0 5px 0; color: #1e3a5f;">${g.title}</h3>
          <p style="margin: 0 0 10px 0; color: #64748b; font-size: 14px;">
            ${g.description?.slice(0, 100)}${g.description?.length > 100 ? '...' : ''}
          </p>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #94a3b8; font-size: 13px;">📍 ${location?.neighborhood || 'Unknown'}</span>
            <a href="${link}" style="background: #25D366; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px;">Join</a>
          </div>
        </div>
      `;
    }).join('');
    
    const emailHtml = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1e3a5f; margin: 0;">🆕 New Groups ${periodText.charAt(0).toUpperCase() + periodText.slice(1)}</h1>
          <p style="color: #64748b;">Crown Heights Groups Weekly Update</p>
        </div>
        
        <p style="color: #475569; margin-bottom: 20px;">
          We found <strong>${newGroups.length}</strong> new group${newGroups.length !== 1 ? 's' : ''} ${periodText}!
        </p>
        
        ${groupsHtml}
        
        ${newGroups.length > 10 ? `<p style="text-align: center; color: #64748b;">... and ${newGroups.length - 10} more</p>` : ''}
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://crownheightsgroups.com/new" style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            View All New Groups
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
        
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">
          You're receiving this because you subscribed to ${frequency} updates.<br>
          <a href="https://crownheightsgroups.com/unsubscribe" style="color: #64748b;">Unsubscribe</a>
        </p>
      </div>
    `;
    
    // Send emails
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
          subject: `🆕 ${newGroups.length} New Groups Added ${periodText.charAt(0).toUpperCase() + periodText.slice(1)}`,
          html: emailHtml.replace('{{name}}', subscriber.name || 'Friend'),
        });
        
        sentCount++;
        
        // Update lastSentAt
        const subIndex = subscribers.findIndex(s => s.id === subscriber.id);
        if (subIndex !== -1) {
          subscribers[subIndex].lastSentAt = new Date().toISOString();
        }
      } catch (err: any) {
        errors.push(`${subscriber.email}: ${err.message}`);
      }
    }
    
    // Save updated subscribers
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
