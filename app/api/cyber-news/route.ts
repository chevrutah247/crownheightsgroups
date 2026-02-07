import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // IC3 (FBI Internet Crime Complaint Center) RSS - best source for scam alerts
    const ic3RssUrl = 'https://www.ic3.gov/PSA/RSS';
    
    const items: { title: string; link: string; date: string; category?: string }[] = [];
    
    // Try IC3 RSS first
    try {
      const ic3Response = await fetch(ic3RssUrl, {
        next: { revalidate: 3600 }, // Cache for 1 hour
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; CrownHeightsGroups/1.0)'
        }
      });
      
      if (ic3Response.ok) {
        const xml = await ic3Response.text();
        const ic3Items = parseRSS(xml, 'IC3');
        items.push(...ic3Items);
      }
    } catch (err) {
      console.error('IC3 RSS error:', err);
    }

    // Try CISA RSS as backup
    try {
      const cisaResponse = await fetch('https://www.cisa.gov/cybersecurity-advisories/all.xml', {
        next: { revalidate: 3600 },
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; CrownHeightsGroups/1.0)'
        }
      });
      
      if (cisaResponse.ok) {
        const xml = await cisaResponse.text();
        const cisaItems = parseRSS(xml, 'CISA');
        items.push(...cisaItems);
      }
    } catch (err) {
      console.error('CISA RSS error:', err);
    }

    // Sort by date (most recent first) and limit
    const sortedItems = items
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime() || 0;
        const dateB = new Date(b.date).getTime() || 0;
        return dateB - dateA;
      })
      .slice(0, 15);

    return NextResponse.json({ 
      items: sortedItems.length > 0 ? sortedItems : getFallbackItems(),
      source: sortedItems.length > 0 ? 'live' : 'fallback',
      count: sortedItems.length
    });
  } catch (error) {
    console.error('Error fetching cyber news:', error);
    return NextResponse.json({ items: getFallbackItems(), source: 'fallback' });
  }
}

function parseRSS(xml: string, source: string): { title: string; link: string; date: string; category?: string }[] {
  const items: { title: string; link: string; date: string; category?: string }[] = [];
  
  // Match <item> or <entry> tags (RSS 2.0 or Atom)
  const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || 
                       xml.match(/<entry>([\s\S]*?)<\/entry>/g) || [];
  
  for (const item of itemMatches.slice(0, 10)) {
    // Title
    const titleMatch = item.match(/<title[^>]*>([\s\S]*?)<\/title>/);
    // Link (RSS 2.0 style or Atom style)
    const linkMatch = item.match(/<link[^>]*>([\s\S]*?)<\/link>/) || 
                      item.match(/<link[^>]*href="([^"]+)"/);
    // Date
    const dateMatch = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/) ||
                      item.match(/<updated>([\s\S]*?)<\/updated>/) ||
                      item.match(/<dc:date>([\s\S]*?)<\/dc:date>/);
    
    if (titleMatch) {
      let title = titleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim();
      // Clean up HTML entities
      title = title.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
      
      let link = '';
      if (linkMatch) {
        link = (linkMatch[2] || linkMatch[1]).replace(/<!\[CDATA\[|\]\]>/g, '').trim();
      }
      
      // Format date
      let date = 'Recent';
      if (dateMatch) {
        try {
          const d = new Date(dateMatch[1].trim());
          if (!isNaN(d.getTime())) {
            date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          }
        } catch {
          date = 'Recent';
        }
      }
      
      items.push({ 
        title, 
        link: link.startsWith('http') ? link : `https://www.ic3.gov${link}`,
        date,
        category: source
      });
    }
  }
  
  return items;
}

function getFallbackItems() {
  return [
    {
      title: '🚨 Criminals Using QR Codes to Steal Your Information',
      link: 'https://www.ic3.gov/PSA/2025/PSA250731',
      date: 'Jul 31, 2025',
      category: 'IC3'
    },
    {
      title: '🎭 Deepfake Scams - How to Spot Fake Videos and Voices',
      link: 'https://www.ic3.gov/PSA',
      date: 'Sep 4, 2025',
      category: 'IC3'
    },
    {
      title: '📱 Virtual Kidnapping Scams Using AI-Generated Voices',
      link: 'https://www.ic3.gov/PSA/2025/PSA251205',
      date: 'Dec 5, 2025',
      category: 'IC3'
    },
    {
      title: '💰 Investment Fraud Through Social Media Groups',
      link: 'https://www.ic3.gov/PSA/2025/PSA250703',
      date: 'Jul 3, 2025',
      category: 'IC3'
    },
    {
      title: '👴 Elder Fraud - Scammers Target Seniors',
      link: 'https://www.ic3.gov/CrimeInfo/ElderFraud',
      date: 'Recent',
      category: 'IC3'
    },
    {
      title: '🏦 Business Email Compromise (BEC) Scams',
      link: 'https://www.ic3.gov/CrimeInfo/BEC',
      date: 'Recent',
      category: 'IC3'
    },
    {
      title: '🔐 Ransomware Attacks on the Rise',
      link: 'https://www.ic3.gov/CrimeInfo/Ransomware',
      date: 'Recent',
      category: 'IC3'
    },
    {
      title: '📧 Check Fraud Through Mail Theft Increasing',
      link: 'https://www.ic3.gov/PSA/2025/PSA250127',
      date: 'Jan 27, 2025',
      category: 'IC3'
    }
  ];
}
