const https = require('https');

function postJSON(urlStr, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const url = new URL(urlStr);
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
    };
    const req = https.request(options, (res) => {
      if (res.statusCode === 307 || res.statusCode === 308) {
        const loc = res.headers.location;
        res.resume();
        return postJSON(loc, body).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function main() {
  const newGroups = [
    // Marketplaces - Buy & Sell (category 4)
    { title: 'IL Marketplace – Buy & Sell', link: 'https://chat.whatsapp.com/EOiO1p7tayg8WbSUJAIz5j', categoryId: '4', locationId: '20' },
    { title: 'CA Marketplace – Buy & Sell', link: 'https://chat.whatsapp.com/CgqBCUKzOCT6e3L1QpWB2C', categoryId: '4', locationId: '10' },
    { title: 'FL Marketplace – Buy & Sell', link: 'https://chat.whatsapp.com/HK220pUsevJDqSr6GdAomf', categoryId: '4', locationId: '11' },
    { title: 'NJ Marketplace – Buy & Sell', link: 'https://chat.whatsapp.com/B6tmdrY2YI5Jx1BgI9qaFS', categoryId: '4', locationId: '20' },
    { title: 'NY Marketplace – Buy & Sell', link: 'https://chat.whatsapp.com/ENYQSsLPBJk2Ht4YtWGcVX', categoryId: '4', locationId: '20' },

    // Entertainment - Humor & Fun (category 15)
    { title: 'Jewish Comedy Videos', link: 'https://chat.whatsapp.com/DUE5YubyQbX37ZVXT5nRP6', categoryId: '15', locationId: '20' },
    { title: 'Funny Videos', link: 'https://chat.whatsapp.com/DTMG2nlqMHNKNFXuO4AE2f', categoryId: '15', locationId: '20' },

    // Entertainment - Music & Entertainment (category 23)
    { title: 'Instagram & TikTok Videos', link: 'https://chat.whatsapp.com/FdIU9Aj9Qxp5IcutfufcOE', categoryId: '23', locationId: '20' },
    { title: 'YouTube Clips', link: 'https://chat.whatsapp.com/Li0AGc6vEdyLxULAQVI6wt', categoryId: '23', locationId: '20' },
    { title: 'Recommended Movies', link: 'https://chat.whatsapp.com/CH4wzBTOvtGLsUSYK2Jk3X', categoryId: '23', locationId: '20' },
    { title: 'Jewish Music Videos', link: 'https://chat.whatsapp.com/DGr2hRnMHCfF8Oh0h91M3p', categoryId: '23', locationId: '20' },
    { title: 'Jewish Party Music', link: 'https://chat.whatsapp.com/Fq3KIKYMAjFJ7xTPt9YX72', categoryId: '23', locationId: '20' },
    { title: 'Beautiful Jewish Songs', link: 'https://chat.whatsapp.com/COSn3IHDt0YKJ1xtw8HbXG', categoryId: '23', locationId: '20' },

    // News (category 16 & 17)
    { title: 'AI World News', link: 'https://chat.whatsapp.com/CI3Vht6zq9oCtPIgEUBbNi', categoryId: '17', locationId: '20' },
    { title: 'Jewish World News', link: 'https://chat.whatsapp.com/B9D7remXorx7jLyn91VTTB', categoryId: '16', locationId: '20' },
    { title: 'Israel News', link: 'https://chat.whatsapp.com/EP2bs61LzVl3CdRv1XxtYE', categoryId: '16', locationId: '20' },
    { title: 'Global News', link: 'https://chat.whatsapp.com/JE7dDrj6nFqDXJBUSVLNWP', categoryId: '16', locationId: '20' },

    // Travel (category 19)
    { title: 'Jerusalem Pesach 2026', link: 'https://chat.whatsapp.com/BecZnyEEgzn4mOWqvV9ufB', categoryId: '19', locationId: '13' },
    { title: 'Miami Pesach 2026', link: 'https://chat.whatsapp.com/Ert4IFIpbnX9JdjdVK9jjM', categoryId: '19', locationId: '11' },
  ];

  let added = 0, skipped = 0, failed = 0;

  for (const g of newGroups) {
    const group = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
      title: g.title,
      description: 'Via JewishLinks.club',
      categoryId: g.categoryId,
      locationId: g.locationId,
      language: 'en',
      whatsappLinks: [g.link],
      status: 'approved',
      clicksCount: 0,
      tags: [],
      submittedBy: 'admin-import',
      createdAt: new Date().toISOString()
    };

    try {
      const res = await postJSON('https://www.crownheightsgroups.com/api/admin/import-group', group);
      if (res.status === 200) {
        const parsed = JSON.parse(res.data);
        console.log('✅', g.title, '- total:', parsed.total);
        added++;
      } else if (res.status === 409) {
        console.log('⭐️ SKIP:', g.title);
        skipped++;
      } else {
        console.log('❌', g.title, '- status:', res.status, res.data.substring(0,100));
        failed++;
      }
    } catch (e) {
      console.log('❌ FAIL:', g.title, e.message);
      failed++;
    }

    await new Promise(r => setTimeout(r, 1500));
  }

  console.log('\n--- SUMMARY ---');
  console.log('Added:', added, '| Skipped:', skipped, '| Failed:', failed);
}

main().catch(console.error);
