import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch from CISA (Cybersecurity and Infrastructure Security Agency)
    const rssUrl = 'https://www.cisa.gov/news.xml';
    
    const response = await fetch(rssUrl, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!response.ok) {
      // Fallback to static items if RSS fails
      return NextResponse.json({
        items: [
          {
            title: 'FBI: Watch out for QR code scams',
            link: 'https://www.fbi.gov/how-we-can-help-you/scams-and-safety',
            date: 'Recent'
          },
          {
            title: 'Beware of fake tech support calls',
            link: 'https://www.fbi.gov/how-we-can-help-you/scams-and-safety/common-scams-and-crimes/tech-support-scams',
            date: 'Recent'
          },
          {
            title: 'Email phishing attacks on the rise',
            link: 'https://www.cisa.gov/news-events/news',
            date: 'Recent'
          },
          {
            title: 'How to spot cryptocurrency scams',
            link: 'https://www.fbi.gov/how-we-can-help-you/scams-and-safety/common-scams-and-crimes/cryptocurrency-scams',
            date: 'Recent'
          },
          {
            title: 'Protect yourself from romance scams',
            link: 'https://www.fbi.gov/how-we-can-help-you/scams-and-safety/common-scams-and-crimes/romance-scams',
            date: 'Recent'
          }
        ]
      });
    }

    const xml = await response.text();
    
    // Simple XML parsing for RSS items
    const items: { title: string; link: string; date: string }[] = [];
    const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
    
    for (const item of itemMatches.slice(0, 10)) {
      const titleMatch = item.match(/<title>([\s\S]*?)<\/title>/);
      const linkMatch = item.match(/<link>([\s\S]*?)<\/link>/);
      const dateMatch = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
      
      if (titleMatch && linkMatch) {
        const title = titleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim();
        const link = linkMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim();
        const dateStr = dateMatch ? dateMatch[1].trim() : '';
        
        // Format date
        let date = 'Recent';
        if (dateStr) {
          try {
            const d = new Date(dateStr);
            date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          } catch {
            date = 'Recent';
          }
        }
        
        items.push({ title, link, date });
      }
    }

    return NextResponse.json({ items: items.length > 0 ? items : getFallbackItems() });
  } catch (error) {
    console.error('Error fetching cyber news:', error);
    return NextResponse.json({ items: getFallbackItems() });
  }
}

function getFallbackItems() {
  return [
    {
      title: 'FBI: Watch out for QR code scams',
      link: 'https://www.fbi.gov/how-we-can-help-you/scams-and-safety',
      date: 'Recent'
    },
    {
      title: 'Beware of fake tech support calls',
      link: 'https://www.fbi.gov/how-we-can-help-you/scams-and-safety/common-scams-and-crimes/tech-support-scams',
      date: 'Recent'
    },
    {
      title: 'Email phishing attacks on the rise',
      link: 'https://www.cisa.gov/news-events/news',
      date: 'Recent'
    },
    {
      title: 'How to spot cryptocurrency scams',
      link: 'https://www.fbi.gov/how-we-can-help-you/scams-and-safety/common-scams-and-crimes/cryptocurrency-scams',
      date: 'Recent'
    },
    {
      title: 'Protect yourself from romance scams',
      link: 'https://www.fbi.gov/how-we-can-help-you/scams-and-safety/common-scams-and-crimes/romance-scams',
      date: 'Recent'
    }
  ];
}
