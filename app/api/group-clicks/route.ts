import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (url && token) return new Redis({ url, token });
  return null;
}

const DAILY_LIMIT = 3;

export async function POST(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    
    const { userId, groupId, groupTitle } = await request.json();
    
    if (!userId || !groupId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const today = new Date().toISOString().split('T')[0];
    const userKey = `groupClicks:${userId}:${today}`;
    
    let clicks: any[] = [];
    const stored = await redis.get(userKey);
    if (stored) {
      clicks = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (!Array.isArray(clicks)) clicks = [];
    }
    
    const alreadyClicked = clicks.some((c: any) => c.groupId === groupId);
    if (alreadyClicked) {
      return NextResponse.json({ 
        allowed: true, 
        remaining: DAILY_LIMIT - clicks.length,
        message: 'Already joined this group today'
      });
    }
    
    if (clicks.length >= DAILY_LIMIT) {
      return NextResponse.json({ 
        allowed: false, 
        remaining: 0,
        message: `You can join maximum ${DAILY_LIMIT} new groups per day. Try again tomorrow!`
      });
    }
    
    clicks.push({
      groupId,
      groupTitle,
      timestamp: new Date().toISOString()
    });
    
    await redis.set(userKey, JSON.stringify(clicks), { ex: 172800 });
    
    let groups: any[] = [];
    const groupsStored = await redis.get('groups');
    if (groupsStored) {
      groups = typeof groupsStored === 'string' ? JSON.parse(groupsStored) : groupsStored;
      if (Array.isArray(groups)) {
        const groupIndex = groups.findIndex((g: any) => g.id === groupId);
        if (groupIndex !== -1) {
          groups[groupIndex].clicksCount = (groups[groupIndex].clicksCount || 0) + 1;
          await redis.set('groups', JSON.stringify(groups));
        }
      }
    }
    
    return NextResponse.json({ 
      allowed: true, 
      remaining: DAILY_LIMIT - clicks.length,
      message: `${DAILY_LIMIT - clicks.length} groups remaining today`
    });
    
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ remaining: DAILY_LIMIT });
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ remaining: DAILY_LIMIT });
    }
    
    const today = new Date().toISOString().split('T')[0];
    const userKey = `groupClicks:${userId}:${today}`;
    
    let clicks: any[] = [];
    const stored = await redis.get(userKey);
    if (stored) {
      clicks = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (!Array.isArray(clicks)) clicks = [];
    }
    
    return NextResponse.json({ 
      remaining: Math.max(0, DAILY_LIMIT - clicks.length),
      clickedToday: clicks.map((c: any) => c.groupId)
    });
    
  } catch (error) {
    return NextResponse.json({ remaining: DAILY_LIMIT });
  }
}