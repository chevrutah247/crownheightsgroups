cat > app/api/news/route.ts << 'ENDOFFILE'
import { NextResponse } from 'next/server';

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  sourceIcon: string;
  image?: string;
  category: string;
}

async function fetchRSS(url: string, source: string, sourceIcon: string, defaultCategory: string): Promise<NewsItem[]> {
  try {
    const response = await fetch(url, { 
      next: { revalidate: 300 },
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    
    if (!response.ok) return [];
    
    const text = await response.text();
    const items: NewsItem[] = [];
    
    const itemMatches = text.match(/<item>([\s\S]*?)<\/item>/gi) || [];
    
    for (const item of itemMatches.slice(0, 15)) {
      const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/i);
      const link = item.match(/<link>(.*?)<\/link>|<link\/>\s*(https?:\/\/[^\s<]+)/i);
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/i);
      
      let image = '';
      
      // Try multiple image extraction patterns
      const patterns = [
        /<media:content[^>]*url=["']([^"']+)["']/i,
        /<media:thumbnail[^>]*url=["']([^"']+)["']/i,
        /<enclosure[^>]*url=["']([^"']+\.(?:jpg|jpeg|png|gif|webp)[^"']*)["']/i,
        /<image>[\s\S]*?<url>([^<]+)<\/url>/i,
        /src=["'](https?:\/\/[^"']+\.(?:jpg|jpeg|png|gif|webp)[^"']*)["']/i,
        /<img[^>]*src=["']([^"']+)["']/i,
      ];
      
      for (const pattern of patterns) {
        const match = item.match(pattern);
        if (match && match[1]) {
          image = match[1];
          break;
        }
      }
      
      // Also check content:encoded for images
      const contentMatch = item.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/i);
      if (!image && contentMatch) {
        const imgMatch = contentMatch[1].match(/src=["'](https?:\/\/[^"']+\.(?:jpg|jpeg|png|gif|webp)[^"']*)["']/i);
        if (imgMatch) image = imgMatch[1];
      }
      
      // Check description for images
      const descMatch = item.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>|<description>([\s\S]*?)<\/description>/i);
      if (!image && descMatch) {
        const desc = descMatch[1] || descMatch[2] || '';
        const imgMatch = desc.match(/src=["'](https?:\/\/[^"']+\.(?:jpg|jpeg|png|gif|webp)[^"']*)["']/i);
        if (imgMatch) image = imgMatch[1];
      }
      
      if (title && link) {
        const linkText = (link[1] || link[2] || '').trim();
        if (linkText) {
          items.push({
            title: (title[1] || title[2] || '').trim(),
            link: linkText,
            pubDate: pubDate ? pubDate[1] : new Date().toISOString(),
            source,
            sourceIcon,
            image: image || undefined,
            category: defaultCategory
          });
        }
      }
    }
    
    return items;
  } catch (error) {
    console.error('RSS fetch error for ' + source + ':', error);
    return [];
  }
}

export async function GET() {
  try {
    const feeds = [
      { url: 'https://collive.com/feed/', source: 'COLlive', icon: '📰', category: 'community' },
      { url: 'https://www.chabad.info/feed/', source: 'Chabad.info', icon: '🕯️', category: 'community' },
      { url: 'https://crownheights.info/feed/', source: 'CrownHeights.info', icon: '🏘️', category: 'community' },
      { url: 'https://www.lubavitch.com/feed/', source: 'Lubavitch.com', icon: '✡️', category: 'community' },
      { url: 'https://www.theyeshivaworld.com/feed', source: 'Yeshiva World', icon: '📖', category: 'world' },
      { url: 'https://www.chabad.org/tools/rss/rss.xml', source: 'Chabad.org', icon: '🔯', category: 'torah' },
    ];
    
    const allNews = await Promise.all(
      feeds.map(feed => fetchRSS(feed.url, feed.source, feed.icon, feed.category))
    );
    
    const combined = allNews.flat();
    combined.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
    
    return NextResponse.json(combined.slice(0, 60));
  } catch (error) {
    console.error('News API error:', error);
    return NextResponse.json([]);
  }
}
ENDOFFILE