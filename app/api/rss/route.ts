import { NextResponse } from 'next/server';

interface RSSItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: string;
  image?: string;
}

// Parse RSS XML to extract items
function parseRSS(xml: string, source: string): RSSItem[] {
  const items: RSSItem[] = [];
  
  // Simple regex-based parsing (works for most RSS feeds)
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    
    const getTag = (tag: string): string => {
      const regex = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${tag}>`, 'i');
      const m = itemXml.match(regex);
      return m ? m[1].trim() : '';
    };
    
    // Get image from description or media:content
    let image = '';
    const imgMatch = itemXml.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch) image = imgMatch[1];
    
    const mediaMatch = itemXml.match(/<media:content[^>]+url=["']([^"']+)["']/i);
    if (!image && mediaMatch) image = mediaMatch[1];
    
    const enclosureMatch = itemXml.match(/<enclosure[^>]+url=["']([^"']+)["']/i);
    if (!image && enclosureMatch) image = enclosureMatch[1];
    
    const title = getTag('title').replace(/<!\[CDATA\[|\]\]>/g, '').trim();
    const link = getTag('link').replace(/<!\[CDATA\[|\]\]>/g, '').trim();
    let description = getTag('description').replace(/<!\[CDATA\[|\]\]>/g, '');
    
    // Strip HTML from description
    description = description.replace(/<[^>]*>/g, '').trim();
    // Truncate description
    if (description.length > 200) {
      description = description.substring(0, 200) + '...';
    }
    
    const pubDate = getTag('pubDate');
    
    if (title && link) {
      items.push({
        title,
        link,
        description,
        pubDate,
        source,
        image
      });
    }
  }
  
  return items;
}

export async function GET() {
  try {
    const feeds = [
      { url: 'https://anash.org/feed/', source: 'Anash.org' },
      { url: 'https://www.chabad.org/tools/rss/magazine_rss.xml', source: 'Chabad.org' },
    ];
    
    const allItems: RSSItem[] = [];
    
    for (const feed of feeds) {
      try {
        const response = await fetch(feed.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; CrownHeightsGroups/1.0)',
          },
          next: { revalidate: 300 } // Cache for 5 minutes
        });
        
        if (response.ok) {
          const xml = await response.text();
          const items = parseRSS(xml, feed.source);
          allItems.push(...items.slice(0, 10)); // Max 10 per source
        }
      } catch (error) {
        console.error(`Failed to fetch ${feed.source}:`, error);
      }
    }
    
    // Sort by date (newest first)
    allItems.sort((a, b) => {
      const dateA = new Date(a.pubDate).getTime() || 0;
      const dateB = new Date(b.pubDate).getTime() || 0;
      return dateB - dateA;
    });
    
    return NextResponse.json({
      items: allItems.slice(0, 20), // Return max 20 items
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('RSS fetch error:', error);
    return NextResponse.json({ 
      items: [], 
      error: 'Failed to fetch news' 
    }, { status: 500 });
  }
}
