import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function POST(request: Request) {
  try {
    const group = await request.json();

    const groups: any[] = await redis.get('groups') || [];

    const existingLinks = new Set<string>();
    groups.forEach((g: any) => {
      if (g.whatsappLink) existingLinks.add(g.whatsappLink);
      if (g.whatsappLinks) g.whatsappLinks.forEach((l: string) => existingLinks.add(l));
    });

    const newLinks = group.whatsappLinks || (group.whatsappLink ? [group.whatsappLink] : []);
    for (const link of newLinks) {
      if (existingLinks.has(link)) {
        return NextResponse.json({ error: 'Duplicate link', link }, { status: 409 });
      }
    }

    groups.push(group);
    await redis.set('groups', groups);

    return NextResponse.json({ success: true, total: groups.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
