import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import nodemailer from 'nodemailer';

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (url && token) return new Redis({ url, token });
  return null;
}

const EMAIL_CONFIG = {
  user: 'contact@edonthego.org',
  pass: 'qvun irsl zsaf asux',
};

async function checkWhatsAppLink(link: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(link, {
      method: 'GET',
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      signal: controller.signal,
    });
    
    clearTimeout(timeout);
    
    const finalUrl = response.url;
    if (finalUrl === 'https://www.whatsapp.com/' || 
        finalUrl === 'https://whatsapp.com/' ||
        finalUrl.includes('/404') ||
        response.status === 404) {
      return false;
    }
    return true;
  } catch {
    return true;
  }
}

async function sendBrokenLinkReport(brokenGroups: any[]) {
  if (brokenGroups.length === 0) return;
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: EMAIL_CONFIG.user, pass: EMAIL_CONFIG.pass },
  });

  await transporter.sendMail({
    from: `"Crown Heights Groups" <${EMAIL_CONFIG.user}>`,
    to: 'chevrutah24x7@gmail.com',
    subject: `⚠️ ${brokenGroups.length} Groups Hidden - Broken Links Found`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #fef2f2; padding: 20px; border-radius: 12px 12px 0 0; border-left: 4px solid #dc2626;">
          <h2 style="color: #dc2626; margin: 0;">⚠️ Broken Links Found</h2>
        </div>
        <div style="background: #fff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 12px 12px;">
          <p>The following <strong>${brokenGroups.length} groups</strong> have been hidden because their WhatsApp links are no longer working:</p>
          <ul style="padding-left: 20px;">
            ${brokenGroups.map(g => `<li style="margin-bottom: 10px;"><strong>${g.title}</strong><br/><code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 12px;">${g.brokenLink}</code></li>`).join('')}
          </ul>
          <p style="margin-top: 20px;"><a href="https://crownheightsgroups.com/admin" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Review in Admin Panel</a></p>
        </div>
      </div>
    `,
  });
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'No Redis' }, { status: 500 });

    const stored = await redis.get('groups');
    if (!stored) return NextResponse.json({ checked: 0, broken: 0 });

    const groups = typeof stored === 'string' ? JSON.parse(stored) : stored;
    const brokenGroups: any[] = [];
    let checkedCount = 0;

    for (const group of groups) {
      if (group.status !== 'approved') continue;
      
      const links = group.whatsappLinks || (group.whatsappLink ? [group.whatsappLink] : []);
      
      for (const link of links) {
        if (!link || !link.includes('chat.whatsapp.com')) continue;
        checkedCount++;
        
        const isValid = await checkWhatsAppLink(link);
        
        if (!isValid) {
          group.status = 'broken';
          group.previousStatus = 'approved';
          group.brokenAt = new Date().toISOString();
          group.brokenLink = link;
          brokenGroups.push({ id: group.id, title: group.title, brokenLink: link });
          break;
        }
        
        await new Promise(r => setTimeout(r, 1000));
      }
      
      group.lastLinkCheck = new Date().toISOString();
    }

    await redis.set('groups', JSON.stringify(groups));

    if (brokenGroups.length > 0) {
      await sendBrokenLinkReport(brokenGroups);
    }

    return NextResponse.json({ 
      checked: checkedCount, 
      broken: brokenGroups.length,
      brokenGroups: brokenGroups.map(g => ({ title: g.title, link: g.brokenLink }))
    });
  } catch (error) {
    console.error('Link check error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
