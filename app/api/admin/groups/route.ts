import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (url && token) return new Redis({ url, token });
  return null;
}

export async function GET() {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json([]);
    const stored = await redis.get('groups');
    if (stored) {
      const data = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (Array.isArray(data)) return NextResponse.json(data);
    }
    return NextResponse.json([]);
  } catch (error) {
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    
    const newGroup = await request.json();
    
    let groups: any[] = [];
    const stored = await redis.get('groups');
    if (stored) {
      groups = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (!Array.isArray(groups)) groups = [];
    }
    
    // Get WhatsApp links
    let whatsappLinks = newGroup.whatsappLinks || [];
    if (newGroup.whatsappLink && !whatsappLinks.length) {
      whatsappLinks = [newGroup.whatsappLink];
    }
    whatsappLinks = whatsappLinks.filter((link: string) => link && link.trim());
    
    // CHECK FOR DUPLICATE LINKS (main check - blocks if duplicate)
    for (const link of whatsappLinks) {
      const linkClean = link.trim().toLowerCase();
      const duplicateLink = groups.find(g => {
        const existingLinks = g.whatsappLinks || [g.whatsappLink].filter(Boolean);
        return existingLinks.some((l: string) => l && l.toLowerCase().trim() === linkClean);
      });
      if (duplicateLink) {
        return NextResponse.json({ 
          error: 'This WhatsApp link already exists in group "' + duplicateLink.title + '"',
          type: 'duplicate_link'
        }, { status: 400 });
      }
    }
    
    // CHECK FOR DUPLICATE TITLE (warning only - suggests new name)
    const titleLower = newGroup.title?.toLowerCase().trim();
    const duplicateTitle = groups.find(g => g.title?.toLowerCase().trim() === titleLower);
    
    let finalTitle = newGroup.title;
    if (duplicateTitle) {
      // Find a unique name by adding a number
      let counter = 2;
      let newTitle = newGroup.title + ' ' + counter;
      while (groups.find(g => g.title?.toLowerCase().trim() === newTitle.toLowerCase().trim())) {
        counter++;
        newTitle = newGroup.title + ' ' + counter;
      }
      finalTitle = newTitle;
      
      // Return suggestion instead of error
      return NextResponse.json({ 
        error: 'A group named "' + newGroup.title + '" already exists. Suggested name: "' + finalTitle + '"',
        type: 'duplicate_title',
        suggestedTitle: finalTitle
      }, { status: 409 });
    }
    
    const id = String(Date.now());
    const group = {
      id,
      title: finalTitle,
      description: newGroup.description || '',
      whatsappLinks: whatsappLinks,
      whatsappLink: whatsappLinks[0] || '',
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
    await redis.set('groups', JSON.stringify(groups));
    
    return NextResponse.json(group);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    
    const updated = await request.json();
    
    let groups: any[] = [];
    const stored = await redis.get('groups');
    if (stored) {
      groups = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (!Array.isArray(groups)) groups = [];
    }
    
    const index = groups.findIndex((g: any) => g.id === updated.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }
    
    let whatsappLinks = updated.whatsappLinks || [];
    if (updated.whatsappLink && !whatsappLinks.length) {
      whatsappLinks = [updated.whatsappLink];
    }
    whatsappLinks = whatsappLinks.filter((link: string) => link && link.trim());
    
    // CHECK FOR DUPLICATE LINKS (excluding current group)
    for (const link of whatsappLinks) {
      const linkClean = link.trim().toLowerCase();
      const duplicateLink = groups.find((g, i) => {
        if (i === index) return false;
        const existingLinks = g.whatsappLinks || [g.whatsappLink].filter(Boolean);
        return existingLinks.some((l: string) => l && l.toLowerCase().trim() === linkClean);
      });
      if (duplicateLink) {
        return NextResponse.json({ 
          error: 'This WhatsApp link already exists in group "' + duplicateLink.title + '"',
          type: 'duplicate_link'
        }, { status: 400 });
      }
    }
    
    // CHECK FOR DUPLICATE TITLE (excluding current group - warning only)
    const titleLower = updated.title?.toLowerCase().trim();
    const duplicateTitle = groups.find((g, i) => i !== index && g.title?.toLowerCase().trim() === titleLower);
    
    if (duplicateTitle && !updated.forceTitle) {
      let counter = 2;
      let newTitle = updated.title + ' ' + counter;
      while (groups.find((g, i) => i !== index && g.title?.toLowerCase().trim() === newTitle.toLowerCase().trim())) {
        counter++;
        newTitle = updated.title + ' ' + counter;
      }
      
      return NextResponse.json({ 
        error: 'A group named "' + updated.title + '" already exists. Suggested name: "' + newTitle + '"',
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
    
    await redis.set('groups', JSON.stringify(groups));
    
    return NextResponse.json(groups[index]);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    
    const { id } = await request.json();
    
    let groups: any[] = [];
    const stored = await redis.get('groups');
    if (stored) {
      groups = typeof stored === 'string' ? JSON.parse(stored) : stored;
      if (!Array.isArray(groups)) groups = [];
    }
    
    groups = groups.filter((g: any) => g.id !== id);
    await redis.set('groups', JSON.stringify(groups));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
