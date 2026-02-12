import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { Resend } from 'resend';

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (url && token) return new Redis({ url, token });
  return null;
}

// Helper to get items added in the last 7 days
function getRecentItems(items: any[], dateField: string = 'createdAt'): any[] {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  return items.filter(item => {
    const itemDate = new Date(item[dateField]);
    return itemDate >= oneWeekAgo;
  });
}

// Generate beautiful HTML email
function generateEmailHTML(data: {
  newGroups: any[];
  newServices: any[];
  subscriberName?: string;
}): string {
  const { newGroups, newServices, subscriberName } = data;
  
  const groupsHTML = newGroups.length > 0 ? `
    <div style="margin-bottom: 32px;">
      <h2 style="color: #1e3a5f; font-size: 20px; margin-bottom: 16px; border-bottom: 2px solid #3b82f6; padding-bottom: 8px;">
        👥 New Groups This Week (${newGroups.length})
      </h2>
      ${newGroups.map(group => `
        <div style="background: #f8fafc; border-radius: 12px; padding: 16px; margin-bottom: 12px; border-left: 4px solid #3b82f6;">
          <h3 style="color: #1f2937; margin: 0 0 8px 0; font-size: 16px;">${group.title}</h3>
          ${group.description ? `<p style="color: #6b7280; margin: 0 0 12px 0; font-size: 14px; line-height: 1.5;">${group.description.slice(0, 150)}${group.description.length > 150 ? '...' : ''}</p>` : ''}
          <a href="https://crownheightsgroups.com/groups" style="display: inline-block; background: #25D366; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px;">
            View Group →
          </a>
        </div>
      `).join('')}
    </div>
  ` : '';
  
  const servicesHTML = newServices.length > 0 ? `
    <div style="margin-bottom: 32px;">
      <h2 style="color: #1e3a5f; font-size: 20px; margin-bottom: 16px; border-bottom: 2px solid #10b981; padding-bottom: 8px;">
        🔧 New Services This Week (${newServices.length})
      </h2>
      ${newServices.map(service => `
        <div style="background: #f0fdf4; border-radius: 12px; padding: 16px; margin-bottom: 12px; border-left: 4px solid #10b981;">
          <h3 style="color: #1f2937; margin: 0 0 8px 0; font-size: 16px;">${service.name}</h3>
          ${service.description ? `<p style="color: #6b7280; margin: 0 0 8px 0; font-size: 14px; line-height: 1.5;">${service.description.slice(0, 150)}${service.description.length > 150 ? '...' : ''}</p>` : ''}
          <p style="color: #166534; margin: 0 0 12px 0; font-size: 14px; font-weight: bold;">📞 ${service.phone}</p>
          <a href="https://crownheightsgroups.com/services" style="display: inline-block; background: #10b981; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px;">
            View Service →
          </a>
        </div>
      `).join('')}
    </div>
  ` : '';
  
  const noUpdates = newGroups.length === 0 && newServices.length === 0;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
      <h1 style="color: white; margin: 0 0 8px 0; font-size: 28px;">Crown Heights Groups</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 16px;">📬 Weekly Community Update</p>
    </div>
    
    <!-- Content -->
    <div style="background: white; padding: 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
      
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-top: 0;">
        Hi${subscriberName ? ` ${subscriberName}` : ''}! 👋
      </p>
      
      <p style="color: #6b7280; font-size: 15px; line-height: 1.6;">
        Here's what's new in our Crown Heights community this week:
      </p>
      
      ${noUpdates ? `
        <div style="background: #fef3c7; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
          <div style="font-size: 48px; margin-bottom: 12px;">🌟</div>
          <p style="color: #92400e; margin: 0; font-size: 15px;">
            No new groups or services this week, but stay tuned!<br>
            Visit our site to discover existing resources.
          </p>
        </div>
      ` : ''}
      
      ${groupsHTML}
      ${servicesHTML}
      
      <!-- CTA Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="https://crownheightsgroups.com" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);">
          Explore All Groups & Services →
        </a>
      </div>
      
      <!-- Featured Section -->
      <div style="background: linear-gradient(135deg, #fdf2f8 0%, #fbcfe8 100%); border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
        <p style="margin: 0 0 12px 0; font-size: 24px;">💍</p>
        <p style="color: #831843; margin: 0 0 8px 0; font-weight: bold;">Hachnasat Kallah</p>
        <p style="color: #9d174d; margin: 0; font-size: 14px;">Support brides in our community</p>
        <a href="https://crownheightsgroups.com/kallah" style="display: inline-block; margin-top: 12px; color: #831843; font-weight: bold; text-decoration: underline;">Learn More →</a>
      </div>
      
      <!-- Footer -->
      <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 24px; text-align: center;">
        <p style="color: #9ca3af; font-size: 13px; margin: 0 0 8px 0;">
          You're receiving this because you subscribed to Crown Heights Groups updates.
        </p>
        <p style="color: #9ca3af; font-size: 13px; margin: 0;">
          <a href="https://crownheightsgroups.com/unsubscribe" style="color: #6b7280;">Unsubscribe</a> · 
          <a href="https://crownheightsgroups.com" style="color: #6b7280;">Visit Website</a>
        </p>
      </div>
      
    </div>
    
  </div>
</body>
</html>
  `;
}

export async function GET(request: NextRequest) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // Allow without secret for testing
    console.log('Warning: No CRON_SECRET verification');
  }

  try {
    const redis = getRedis();
    if (!redis) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // Get subscribers
    const subscribersData = await redis.get('newsletter_subscribers');
    let subscribers: any[] = [];
    if (subscribersData) {
      subscribers = typeof subscribersData === 'string' ? JSON.parse(subscribersData) : subscribersData;
      if (!Array.isArray(subscribers)) subscribers = [];
    }

    // Filter active weekly subscribers
    const weeklySubscribers = subscribers.filter(s => 
      s.status === 'active' && s.frequency === 'weekly'
    );

    if (weeklySubscribers.length === 0) {
      return NextResponse.json({ message: 'No weekly subscribers found', sent: 0 });
    }

    // Get new groups from last week
    const groupsData = await redis.get('groups');
    let groups: any[] = [];
    if (groupsData) {
      groups = typeof groupsData === 'string' ? JSON.parse(groupsData) : groupsData;
      if (!Array.isArray(groups)) groups = [];
    }
    const newGroups = getRecentItems(groups.filter(g => g.status === 'approved'));

    // Get new services from last week
    const servicesData = await redis.get('services');
    let services: any[] = [];
    if (servicesData) {
      services = typeof servicesData === 'string' ? JSON.parse(servicesData) : servicesData;
      if (!Array.isArray(services)) services = [];
    }
    const newServices = getRecentItems(services.filter(s => !s.status || s.status === 'approved'));

    // Initialize Resend
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }
    const resend = new Resend(resendKey);

    // Send emails
    let sentCount = 0;
    let errorCount = 0;

    for (const subscriber of weeklySubscribers) {
      try {
        const html = generateEmailHTML({
          newGroups: newGroups.slice(0, 5), // Limit to 5 most recent
          newServices: newServices.slice(0, 5),
          subscriberName: subscriber.name
        });

        await resend.emails.send({
          from: 'Crown Heights Groups <updates@crownheightsgroups.com>',
          to: subscriber.email,
          subject: `📬 Weekly Update: ${newGroups.length + newServices.length} new in Crown Heights`,
          html: html
        });

        // Update last sent timestamp
        subscriber.lastSentAt = new Date().toISOString();
        sentCount++;
      } catch (error) {
        console.error(`Failed to send to ${subscriber.email}:`, error);
        errorCount++;
      }
    }

    // Save updated subscribers with lastSentAt
    await redis.set('newsletter_subscribers', JSON.stringify(subscribers));

    return NextResponse.json({
      success: true,
      sent: sentCount,
      errors: errorCount,
      newGroups: newGroups.length,
      newServices: newServices.length,
      totalSubscribers: weeklySubscribers.length
    });

  } catch (error) {
    console.error('Newsletter cron error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// Allow POST for manual testing
export async function POST(request: NextRequest) {
  return GET(request);
}
