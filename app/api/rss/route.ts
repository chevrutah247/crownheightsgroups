import { NextResponse } from 'next/server';

interface RSSItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: string;
  category: string;
  image?: string;
}

function parseRSS(xml: string, source: string, category: string): RSSItem[] {
  const items: RSSItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    
    const getTag = (tag: string): string => {
      const regex = new RegExp('<' + tag + '[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</' + tag + '>', 'i');
      const m = itemXml.match(regex);
      return m ? m[1].trim() : '';
    };
    
    let image = '';
    const imgMatch = itemXml.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch) image = imgMatch[1];
    
    const mediaMatch = itemXml.match(/<media:content[^>]+url=["']([^"']+)["']/i);
    if (!image && mediaMatch) image = mediaMatch[1];
    
    const enclosureMatch = itemXml.match(/<enclosure[^>]+url=["']([^"']+)["']/i);
    if (!image && enclosureMatch) image = enclosureMatch[1];
    
    const mediaThumbnail = itemXml.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/i);
    if (!image && mediaThumbnail) image = mediaThumbnail[1];

    const title = getTag('title').replace(/<!\[CDATA\[|\]\]>/g, '').trim();
    const link = getTag('link').replace(/<!\[CDATA\[|\]\]>/g, '').trim();
    let description = getTag('description').replace(/<!\[CDATA\[|\]\]>/g, '');
    
    description = description.replace(/<[^>]*>/g, '').trim();
    if (description.length > 200) {
      description = description.substring(0, 200) + '...';
    }
    
    const pubDate = getTag('pubDate');
    
    if (title && link) {
      items.push({ title, link, description, pubDate, source, category, image });
    }
  }
  
  return items;
}

export async function GET() {
  try {
    const feeds = [
      { url: 'https://anash.org/feed/', source: 'Anash.org', category: 'community' },
      { url: 'https://collive.com/feed/', source: 'COLlive', category: 'community' },
      { url: 'https://crownheights.info/feed/', source: 'CrownHeights.info', category: 'community' },
      { url: 'https://www.lubavitch.com/feed/', source: 'Lubavitch.com', category: 'community' },
      { url: 'https://www.chabad.org/tools/rss/magazine_rss.xml', source: 'Chabad.org', category: 'religious' },
      { url: 'https://www.jpost.com/rss/rssfeedsfrontpage.aspx', source: 'Jerusalem Post', category: 'world' },
    ];
    
    const allItems: RSSItem[] = [];
    
    for (const feed of feeds) {
      try {
        const response = await fetch(feed.url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CrownHeightsGroups/1.0)' },
          next: { revalidate: 300 }
        });
        
        if (response.ok) {
          const xml = await response.text();
          const items = parseRSS(xml, feed.source, feed.category);
          allItems.push(...items.slice(0, 10));
        }
      } catch (error) {
        console.error('Failed to fetch ' + feed.source + ':', error);
      }
    }
    
    allItems.sort((a, b) => {
      const dateA = new Date(a.pubDate).getTime() || 0;
      const dateB = new Date(b.pubDate).getTime() || 0;
      return dateB - dateA;
    });
    
    return NextResponse.json({
      items: allItems.slice(0, 40),
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('RSS fetch error:', error);
    return NextResponse.json({ items: [], error: 'Failed to fetch news' }, { status: 500 });
  }
}
