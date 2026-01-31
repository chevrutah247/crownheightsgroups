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

async function fetchRSS(url: string, source: string, sourceIcon: string, category: string): Promise<NewsItem[]> {
  try {
    const response = await fetch(url, { 
      next: { revalidate: 300 },
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)' }
    });
    if (!response.ok) return [];
    const text = await response.text();
    const items: NewsItem[] = [];
    const itemMatches = text.match(/<item>([\s\S]*?)<\/item>/gi) || [];
    for (const item of itemMatches.slice(0, 12)) {
      const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/i);
      const link = item.match(/<link>(.*?)<\/link>/i);
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/i);
      let image = '';
      const mediaContent = item.match(/<media:content[^>]*url=["']([^"']+)["']/i);
      const mediaThumbnail = item.match(/<media:thumbnail[^>]*url=["']([^"']+)["']/i);
      const enclosure = item.match(/<enclosure[^>]*url=["']([^"']+\.(?:jpg|jpeg|png|gif|webp)[^"']*)["']/i);
      const contentImg = item.match(/<content:encoded>[\s\S]*?src=["'](https?:\/\/[^"']+\.(?:jpg|jpeg|png|gif|webp)[^"']*)["']/i);
      const descImg = item.match(/<description>[\s\S]*?src=["'](https?:\/\/[^"']+\.(?:jpg|jpeg|png|gif|webp)[^"']*)["']/i);
      const imgTag = item.match(/<image>([\s\S]*?)<\/image>/i);
      const imgUrl = imgTag ? imgTag[0].match(/<url>(.*?)<\/url>/i) : null;
      
      if (mediaContent) image = mediaContent[1];
      else if (mediaThumbnail) image = mediaThumbnail[1];
      else if (enclosure) image = enclosure[1];
      else if (contentImg) image = contentImg[1];
      else if (descImg) image = descImg[1];
      else if (imgUrl) image = imgUrl[1];
      
      if (title && link) {
        items.push({
          title: (title[1] || title[2] || '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').trim(),
          link: link[1].trim(),
          pubDate: pubDate ? pubDate[1] : new Date().toISOString(),
          source,
          sourceIcon,
          image: image || undefined,
          category
        });
      }
    }
    return items;
  } catch (error) {
    console.error(`Error fetching ${source}:`, error);
    return [];
  }
}

export async function GET() {
  try {
    const feeds = [
      // Community News (Crown Heights / Chabad)
      { url: 'https://collive.com/feed/', source: 'COLlive', icon: '📰', category: 'community' },
      { url: 'https://www.chabad.info/feed/', source: 'Chabad.info', icon: '🕯️', category: 'community' },
      { url: 'https://crownheights.info/feed/', source: 'CrownHeights.info', icon: '🏘️', category: 'community' },
      { url: 'https://www.lubavitch.com/feed/', source: 'Lubavitch.com', icon: '✡️', category: 'community' },
      
      // Torah / Jewish Life
      { url: 'https://www.theyeshivaworld.com/feed', source: 'Yeshiva World', icon: '📖', category: 'torah' },
      
      // World Jewish News
      { url: 'https://www.jpost.com/rss/rssfeedsheadlines.aspx', source: 'Jerusalem Post', icon: '🇮🇱', category: 'world' },
      { url: 'https://www.timesofisrael.com/feed/', source: 'Times of Israel', icon: '🕰️', category: 'world' },
      { url: 'https://www.ynetnews.com/Integration/StoryRss1854.xml', source: 'Ynet News', icon: '📺', category: 'world' },
      { url: 'https://www.israelnationalnews.com/Rss/Rss.aspx/All', source: 'Israel National News', icon: '🔯', category: 'world' },
      { url: 'https://jewishinsider.com/feed/', source: 'Jewish Insider', icon: '💼', category: 'world' },
      
      // Russian News
      { url: 'https://www.jewish.ru/rss/', source: 'Jewish.ru', icon: '🇷🇺', category: 'russian' },
      { url: 'https://jewishNews.com.ua/feed/', source: 'JewishNews UA', icon: '🇺🇦', category: 'russian' },
      { url: 'https://mignews.com/rss/news.xml', source: 'MigNews', icon: '📰', category: 'russian' },
      { url: 'http://www.sem40.ru/rss/news.xml', source: 'Sem40', icon: '✡️', category: 'russian' },
      { url: 'https://www.isra.com/rss/', source: 'Isra.com', icon: '🇮🇱', category: 'russian' },
    ];
    
    const allNews = await Promise.all(
      feeds.map(feed => fetchRSS(feed.url, feed.source, feed.icon, feed.category))
    );
    
    const combined = allNews.flat();
    combined.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
    
    return NextResponse.json(combined.slice(0, 100));
  } catch (error) {
    console.error('News API error:', error);
    return NextResponse.json([]);
  }
}
