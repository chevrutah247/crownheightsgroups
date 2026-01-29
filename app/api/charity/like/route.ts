import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

export const dynamic = 'force-dynamic';

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (url && token) return new Redis({ url, token });
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });

    const { campaignId, userEmail } = await request.json();

    if (!campaignId || !userEmail) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    const data = await redis.get('charity_campaigns');
    let campaigns = data ? (typeof data === 'string' ? JSON.parse(data) : data) : [];

    let updatedCampaign = null;

    campaigns = campaigns.map((c: any) => {
      if (c.id === campaignId) {
        const likedBy = c.likedBy || [];
        const alreadyLiked = likedBy.includes(userEmail);
        
        if (alreadyLiked) {
          // Unlike
          c.likedBy = likedBy.filter((e: string) => e !== userEmail);
          c.likes = Math.max(0, (c.likes || 1) - 1);
        } else {
          // Like
          c.likedBy = [...likedBy, userEmail];
          c.likes = (c.likes || 0) + 1;
        }
        updatedCampaign = c;
      }
      return c;
    });

    await redis.set('charity_campaigns', JSON.stringify(campaigns));

    return NextResponse.json({ 
      success: true, 
      likes: updatedCampaign?.likes || 0,
      likedBy: updatedCampaign?.likedBy || []
    });
  } catch (error) {
    console.error('Like error:', error);
    return NextResponse.json({ error: 'Failed to like' }, { status: 500 });
  }
}
