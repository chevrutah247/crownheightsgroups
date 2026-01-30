import { NextResponse } from 'next/server';

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  sourceIcon: string;
}

async function fetchRSS(url: string, source: string, sourceIcon: string): Promise<NewsItem[]> {
  try {
    const response = await fetch(url, { 
      next: { revalidate: 300 },
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    
    if (!response.ok) return [];
    
    const text = await response.text();
    const items: NewsItem[] = [];
    
    const itemMatches = text.match(/<item>([\s\S]*?)<\/item>/gi) || [];
    
    for (const item of itemMatches.slice(0, 10)) {
      const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/i);
      const link = item.match(/<link>(.*?)<\/link>/i);
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/i);
      
      if (title && link) {
        items.push({
          title: (title[1] || title[2] || '').trim(),
          link: link[1].trim(),
          pubDate: pubDate ? pubDate[1] : new Date().toISOString(),
          source,
          sourceIcon
        });
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
      { url: 'https://collive.com/feed/', source: 'COLlive', icon: '📰' },
      { url: 'https://www.chabad.info/feed/', source: 'Chabad.info', icon: '🕯️' },
      { url: 'https://crownheights.info/feed/', source: 'CrownHeights.info', icon: '🏘️' },
      { url: 'https://www.lubavitch.com/feed/', source: 'Lubavitch.com', icon: '✡️' },
      { url: 'https://www.theyeshivaworld.com/feed', source: 'Yeshiva World', icon: '📖' },
    ];
    
    const allNews = await Promise.all(
      feeds.map(feed => fetchRSS(feed.url, feed.source, feed.icon))
    );
    
    const combined = allNews.flat();
    combined.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
    
    return NextResponse.json(combined.slice(0, 50));
  } catch (error) {
    console.error('News API error:', error);
    return NextResponse.json([]);
  }
}
