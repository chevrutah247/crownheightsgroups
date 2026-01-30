import { NextResponse } from 'next/server';

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  sourceIcon: string;
  image?: string;
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
    for (const item of itemMatches.slice(0, 15)) {
      const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/i);
      const link = item.match(/<link>(.*?)<\/link>/i);
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/i);
      let image = '';
      const mediaContent = item.match(/<media:content[^>]*url=["']([^"']+)["']/i);
      const mediaThumbnail = item.match(/<media:thumbnail[^>]*url=["']([^"']+)["']/i);
      const enclosure = item.match(/<enclosure[^>]*url=["']([^"']+\.(?:jpg|jpeg|png|gif|webp)[^"']*)["']/i);
      const contentImg = item.match(/<content:encoded>[\s\S]*?src=["'](https?:\/\/[^"']+\.(?:jpg|jpeg|png|gif|webp)[^"']*)["']/i);
      const descImg = item.match(/<description>[\s\S]*?src=["'](https?:\/\/[^"']+\.(?:jpg|jpeg|png|gif|webp)[^"']*)["']/i);
      if (mediaContent) image = mediaContent[1];
      else if (mediaThumbnail) image = mediaThumbnail[1];
      else if (enclosure) image = enclosure[1];
      else if (contentImg) image = contentImg[1];
      else if (descImg) image = descImg[1];
      if (title && link) {
        items.push({
          title: (title[1] || title[2] || '').trim(),
          link: link[1].trim(),
          pubDate: pubDate ? pubDate[1] : new Date().toISOString(),
          source,
          sourceIcon,
          image: image || undefined
        });
      }
    }
    return items;
  } catch (error) {
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
    const allNews = await Promise.all(feeds.map(feed => fetchRSS(feed.url, feed.source, feed.icon)));
    const combined = allNews.flat();
    combined.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
    return NextResponse.json(combined.slice(0, 60));
  } catch (error) {
    return NextResponse.json([]);
  }
}