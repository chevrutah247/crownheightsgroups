import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const REDIS_KEY = 'groups';

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (url && token) return new Redis({ url, token });
  return null;
}

async function getGroups(redis: Redis): Promise<any[]> {
  try {
    const stored = await redis.get(REDIS_KEY);
    if (stored) {
      const data = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (Array.isArray(data)) return data;
    }
    return [];
  } catch (error) {
    console.error('Error getting groups:', error);
    return [];
  }
}

function normalizeLink(link: string): string {
  return link.trim().toLowerCase().replace(/\/$/, '');
}

function getAllLinks(group: any): string[] {
  const links: string[] = [];
  if (group.whatsappLinks) links.push(...group.whatsappLinks);
  if (group.whatsappLink) links.push(group.whatsappLink);
  if (group.telegramLink) links.push(group.telegramLink);
  if (group.facebookLink) links.push(group.facebookLink);
  if (group.twitterLink) links.push(group.twitterLink);
  if (group.websiteLink) links.push(group.websiteLink);
  return links.filter(l => l && l.trim());
}

export async function GET() {
  try {
    const redis = getRedis();
    if (!redis) {
      console.error('Redis not available');
      return NextResponse.json([]);
    }
    const groups = await getGroups(redis);
    return NextResponse.json(groups);
  } catch (error) {
    console.error('GET groups error:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    
    const newGroup = await request.json();
    const groups = await getGroups(redis);
    
    // Get all links
    let whatsappLinks = newGroup.whatsappLinks || [];
    if (newGroup.whatsappLink && !whatsappLinks.length) {
      whatsappLinks = [newGroup.whatsappLink];
    }
    whatsappLinks = whatsappLinks.filter((link: string) => link && link.trim());
    
    const allNewLinks = getAllLinks({ ...newGroup, whatsappLinks });
    
    // CHECK FOR DUPLICATE LINKS
    for (const link of allNewLinks) {
      const linkNorm = normalizeLink(link);
      for (const g of groups) {
        const existingLinks = getAllLinks(g);
        if (existingLinks.some(l => normalizeLink(l) === linkNorm)) {
          return NextResponse.json({ 
            error: 'This link already exists in "' + g.title + '"',
            type: 'duplicate_link'
          }, { status: 400 });
        }
      }
    }
    
    // CHECK FOR DUPLICATE TITLE
    const titleLower = (newGroup.title || '').toLowerCase().trim();
    const duplicateTitle = groups.find(g => (g.title || '').toLowerCase().trim() === titleLower);
    
    if (duplicateTitle) {
      let counter = 2;
      let newTitle = newGroup.title + ' ' + counter;
      while (groups.find(g => (g.title || '').toLowerCase().trim() === newTitle.toLowerCase().trim())) {
        counter++;
        newTitle = newGroup.title + ' ' + counter;
      }
      return NextResponse.json({ 
        error: 'A group named "' + newGroup.title + '" already exists. Suggested: "' + newTitle + '"',
        type: 'duplicate_title',
        suggestedTitle: newTitle
      }, { status: 409 });
    }
    
    const id = String(Date.now());
    const group = {
      id,
      title: newGroup.title || '',
      description: newGroup.description || '',
      whatsappLinks: whatsappLinks,
      whatsappLink: whatsappLinks[0] || '',
      telegramLink: newGroup.telegramLink || '',
      facebookLink: newGroup.facebookLink || '',
      twitterLink: newGroup.twitterLink || '',
      websiteLink: newGroup.websiteLink || '',
      categoryId: newGroup.categoryId || '1',
      locationId: newGroup.locationId || '1',
      language: newGroup.language || 'English',
      status: newGroup.status || 'approved',
      clicksCount: 0,
      isPinned: newGroup.isPinned || false,
      pinnedOrder: newGroup.pinnedOrder || 999,
      tags: newGroup.tags || [],
      createdAt: new Date().toISOString()
    };
    
    groups.push(group);
    await redis.set(REDIS_KEY, JSON.stringify(groups));
    console.log('Group added:', group.title, 'Total:', groups.length);
    
    return NextResponse.json(group);
  } catch (error) {
    console.error('POST group error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    
    const updated = await request.json();
    const groups = await getGroups(redis);
    
    const index = groups.findIndex((g: any) => g.id === updated.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }
    
    let whatsappLinks = updated.whatsappLinks || [];
    if (updated.whatsappLink && !whatsappLinks.length) {
      whatsappLinks = [updated.whatsappLink];
    }
    whatsappLinks = whatsappLinks.filter((link: string) => link && link.trim());
    
    const allNewLinks = getAllLinks({ ...updated, whatsappLinks });
    
    // CHECK FOR DUPLICATE LINKS (excluding current)
    for (const link of allNewLinks) {
      const linkNorm = normalizeLink(link);
      for (let i = 0; i < groups.length; i++) {
        if (i === index) continue;
        const existingLinks = getAllLinks(groups[i]);
        if (existingLinks.some(l => normalizeLink(l) === linkNorm)) {
          return NextResponse.json({ 
            error: 'This link already exists in "' + groups[i].title + '"',
            type: 'duplicate_link'
          }, { status: 400 });
        }
      }
    }
    
    // CHECK FOR DUPLICATE TITLE (excluding current)
    const titleLower = (updated.title || '').toLowerCase().trim();
    const duplicateTitle = groups.find((g, i) => i !== index && (g.title || '').toLowerCase().trim() === titleLower);
    
    if (duplicateTitle && !updated.forceTitle) {
      let counter = 2;
      let newTitle = updated.title + ' ' + counter;
      while (groups.find((g, i) => i !== index && (g.title || '').toLowerCase().trim() === newTitle.toLowerCase().trim())) {
        counter++;
        newTitle = updated.title + ' ' + counter;
      }
      return NextResponse.json({ 
        error: 'A group named "' + updated.title + '" already exists. Suggested: "' + newTitle + '"',
        type: 'duplicate_title',
        suggestedTitle: newTitle
      }, { status: 409 });
    }
    
    groups[index] = {
      ...groups[index],
      ...updated,
      whatsappLinks: whatsappLinks,
      whatsappLink: whatsappLinks[0] || groups[index].whatsappLink || ''
    };
    
    await redis.set(REDIS_KEY, JSON.stringify(groups));
    console.log('Group updated:', groups[index].title);
    
    return NextResponse.json(groups[index]);
  } catch (error) {
    console.error('PUT group error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    
    const { id } = await request.json();
    const groups = await getGroups(redis);
    
    const deletedGroup = groups.find(g => g.id === id);
    const newGroups = groups.filter((g: any) => g.id !== id);
    
    await redis.set(REDIS_KEY, JSON.stringify(newGroups));
    console.log('Group deleted:', deletedGroup?.title, 'Remaining:', newGroups.length);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE group error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
