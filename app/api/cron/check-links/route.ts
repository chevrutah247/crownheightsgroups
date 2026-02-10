import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const redis = new Redis({
  url: process.env.KV_REST_API_URL || '',
  token: process.env.KV_REST_API_TOKEN || '',
});

async function checkLink(url: string): Promise<boolean> {
  try {
    const cleanUrl = url.replace(/[^\x20-\x7E]/g, '').trim();
    
    const response = await fetch(cleanUrl, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const html = await response.text();
    
    // WhatsApp checks
    if (cleanUrl.includes('chat.whatsapp.com')) {
      const ogTitleMatch = html.match(/<meta property="og:title" content="([^"]*)"/);
      if (ogTitleMatch && ogTitleMatch[1] === '') return false;
      
      if (html.includes('invite link is invalid') || 
          html.includes('This invite link has been revoked') ||
          html.includes("couldn't find")) return false;
    }
    
    // Telegram checks
    if (cleanUrl.includes('t.me/')) {
      if (html.includes("doesn't exist") || 
          html.includes('not exist') ||
          html.includes('Private channel')) return false;
    }
    
    // General checks
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
    const results = {
      groups: { checked: 0, broken: 0, brokenList: [] as any[] },
      torahGroups: { checked: 0, broken: 0, brokenList: [] as any[] }
    };

    // Check regular groups
    const groupsData = await redis.get('groups');
    let groups = Array.isArray(groupsData) ? groupsData : JSON.parse(groupsData as string || '[]');
    
    for (const group of groups.filter((g: any) => g.status === 'approved')) {
      const link = group.whatsappLinks?.[0] || group.whatsappLink;
      if (!link) continue;

      results.groups.checked++;
      const isValid = await checkLink(link);
      
      if (!isValid) {
        const idx = groups.findIndex((g: any) => g.id === group.id);
        if (idx !== -1) {
          groups[idx].status = 'broken';
          groups[idx].brokenAt = new Date().toISOString();
          groups[idx].brokenLink = link;
          results.groups.brokenList.push({ title: group.title, link });
          results.groups.broken++;
        }
      }
      await new Promise(r => setTimeout(r, 500));
    }

    if (results.groups.broken > 0) {
      await redis.set('groups', JSON.stringify(groups));
    }

    // Check Torah groups
    const torahData = await redis.get('torah_groups');
    let torahGroups = Array.isArray(torahData) ? torahData : JSON.parse(torahData as string || '[]');
    
    for (const group of torahGroups.filter((g: any) => g.status !== 'broken')) {
      const link = group.link;
      if (!link) continue;

      results.torahGroups.checked++;
      const isValid = await checkLink(link);
      
      if (!isValid) {
        const idx = torahGroups.findIndex((g: any) => g.id === group.id);
        if (idx !== -1) {
          torahGroups[idx].status = 'broken';
          torahGroups[idx].brokenAt = new Date().toISOString();
          results.torahGroups.brokenList.push({ name: group.name, link });
          results.torahGroups.broken++;
        }
      }
      await new Promise(r => setTimeout(r, 500));
    }

    if (results.torahGroups.broken > 0) {
      await redis.set('torah_groups', JSON.stringify(torahGroups));
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      groups: {
        checked: results.groups.checked,
        broken: results.groups.broken,
        brokenGroups: results.groups.brokenList
      },
      torahGroups: {
        checked: results.torahGroups.checked,
        broken: results.torahGroups.broken,
        brokenGroups: results.torahGroups.brokenList
      }
    });
  } catch (error) {
    console.error('Link check error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
