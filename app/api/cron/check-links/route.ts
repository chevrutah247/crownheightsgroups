import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

const redis = new Redis({
  url: process.env.KV_REST_API_URL || '',
  token: process.env.KV_REST_API_TOKEN || '',
});

export const maxDuration = 300;

async function checkWhatsAppLink(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const html = await response.text();
    
    // Check for empty og:title - sign of deleted/invalid group
    const ogTitleMatch = html.match(/<meta property="og:title" content="([^"]*)"/);
    if (ogTitleMatch && ogTitleMatch[1] === '') {
      console.log('Empty og:title - group deleted');
      return false;
    }
    
    // Check for "invalid" or "expired" in page
    if (html.includes('invalid') || html.includes('expired') || html.includes('no longer available')) {
      return false;
    }
    
    // Check final URL
    const finalUrl = response.url;
    if (finalUrl === 'https://www.whatsapp.com/' || 
        finalUrl === 'https://whatsapp.com/' ||
        finalUrl.includes('/404')) {
      return false;
    }
    
    return response.status === 200;
  } catch (error) {
    console.error('Error checking link:', url, error);
    return true; // Assume valid on network error
  }
}

export async function GET(request: Request) {
  try {
    const groupsData = await redis.get('groups');
    let groups = Array.isArray(groupsData) ? groupsData : JSON.parse(groupsData as string || '[]');
    
    const approvedGroups = groups.filter((g: any) => g.status === 'approved');
    const brokenGroups: any[] = [];
    let checkedCount = 0;

    for (const group of approvedGroups) {
      const link = group.whatsappLinks?.[0] || group.whatsappLink;
      if (!link) continue;

      checkedCount++;
      const isValid = await checkWhatsAppLink(link);
      
      if (!isValid) {
        const idx = groups.findIndex((g: any) => g.id === group.id);
        if (idx !== -1) {
          groups[idx].status = 'broken';
          groups[idx].brokenAt = new Date().toISOString();
          groups[idx].brokenLink = link;
          brokenGroups.push({ title: group.title, link });
        }
      }
      
      // Rate limit
      await new Promise(r => setTimeout(r, 1000));
    }

    if (brokenGroups.length > 0) {
      await redis.set('groups', JSON.stringify(groups));
    }

    return NextResponse.json({
      checked: checkedCount,
      broken: brokenGroups.length,
      brokenGroups
    });
  } catch (error) {
    console.error('Link check error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
