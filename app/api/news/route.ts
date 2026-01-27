import { NextResponse } from 'next/server';

const RSS_FEEDS = [
  { id: 'collive', name: 'COLlive', url: 'https://collive.com/feed/', color: '#1a365d' },
  { id: 'chabadinfo', name: 'Chabad.info', url: 'https://chabadinfo.com/feed/', color: '#b45309' },
  { id: 'crownheightsinfo', name: 'CrownHeights.info', url: 'https://crownheights.info/feed/', color: '#047857' },
  { id: 'lubavitch', name: 'Lubavitch.com', url: 'https://www.lubavitch.com/feed/', color: '#7c3aed' },
];

interface NewsItem {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  source: string;
  sourceColor: string;
  image?: string;
  description?: string;
}

let cachedNews: NewsItem[] = [];
let lastFetch = 0;
const CACHE_DURATION = 10 * 60 * 1000;

function extractImage(item: any): string | undefined {
  // Try thumbnail first
  if (item.thumbnail) return item.thumbnail;
  
  // Try enclosure
  if (item.enclosure && item.enclosure.link) return item.enclosure.link;
  
  // Try to extract from content
  if (item.content) {
    const imgMatch = item.content.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch) return imgMatch[1];
  }
  
  // Try description
  if (item.description) {
    const imgMatch = item.description.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch) return imgMatch[1];
  }
  
  return undefined;
}

function cleanDescription(text: string | undefined): string {
  if (!text) return '';
  // Remove HTML tags
  return text.replace(/<[^>]*>/g, '').slice(0, 150).trim();
}

async function fetchFeed(feed: typeof RSS_FEEDS[0]): Promise<NewsItem[]> {
  try {
    const proxyUrl = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(feed.url);
    
    const response = await fetch(proxyUrl, {
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) {
      console.error('Failed to fetch ' + feed.name + ': ' + response.status);
      return [];
    }
    
    const data = await response.json();
    
    if (data.status !== 'ok' || !data.items) {
      console.error('Invalid response from ' + feed.name);
      return [];
    }
    
    return data.items.slice(0, 10).map((item: any, index: number) => ({
      id: feed.id + '-' + index + '-' + Date.now(),
      title: item.title || 'No title',
      link: item.link || feed.url,
      pubDate: item.pubDate || new Date().toISOString(),
      source: feed.name,
      sourceColor: feed.color,
      image: extractImage(item),
      description: cleanDescription(item.description || item.content),
    }));
  } catch (error) {
    console.error('Error fetching ' + feed.name + ':', error);
    return [];
  }
}

export async function GET() {
  try {
    const now = Date.now();
    
    if (cachedNews.length > 0 && now - lastFetch < CACHE_DURATION) {
      return NextResponse.json({ news: cachedNews, cached: true });
    }

    const results = await Promise.allSettled(RSS_FEEDS.map(fetchFeed));
    
    const allNews: NewsItem[] = [];
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        allNews.push(...result.value);
      }
    });

    allNews.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

    if (allNews.length > 0) {
      cachedNews = allNews;
      lastFetch = now;
    }

    return NextResponse.json({ news: allNews, cached: false, count: allNews.length });
  } catch (error) {
    console.error('News API error:', error);
    if (cachedNews.length > 0) {
      return NextResponse.json({ news: cachedNews, cached: true, stale: true });
    }
    return NextResponse.json({ news: [], error: 'Failed to fetch news' });
  }
}
