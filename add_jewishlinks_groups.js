const https = require('https');
const http = require('http');

function fetchJSON(urlStr) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const mod = url.protocol === 'https:' ? https : http;
    mod.get(urlStr, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 308) {
        return fetchJSON(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { console.log('Raw:', data.substring(0,200)); reject(e); } });
    }).on('error', reject);
  });
}

function postJSON(urlStr, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const mod = url.protocol === 'https:' ? https : http;
    const payload = JSON.stringify(body);
    const req = mod.request(urlStr, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 308) {
        return postJSON(res.headers.location, body).then(resolve).catch(reject);
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
  // Get existing groups
  console.log('Fetching existing groups...');
  const groups = await fetchJSON('https://www.crownheightsgroups.com/api/admin/groups');
  
  const existingLinks = new Set();
  const existingTitles = new Set();
  groups.forEach(g => {
    if (g.whatsappLink) existingLinks.add(g.whatsappLink);
    if (g.whatsappLinks) g.whatsappLinks.forEach(l => existingLinks.add(l));
    existingTitles.add(g.title?.toLowerCase());
  });
  
  console.log('Existing groups:', groups.length);

  const newGroups = [
    { title: 'Business & Networking - Israel', link: 'https://chat.whatsapp.com/By94n1t2ITZ1xA7VM6WKvU', categoryId: '1769517422754', locationId: '20' },
    { title: 'Business & Networking - Europe', link: 'https://chat.whatsapp.com/B58i2Aay4mhCB2oB9YtNxa', categoryId: '1769517422754', locationId: '20' },
    { title: 'Business & Networking - Midwest', link: 'https://chat.whatsapp.com/HTwFq9tjF9KKfUdSpLh0iW', categoryId: '1769517422754', locationId: '12' },
    { title: 'Business & Networking - California', link: 'https://chat.whatsapp.com/G4uO1lXRGdnCCG7cbdKOct', categoryId: '1769517422754', locationId: '10' },
    { title: 'Business & Networking - Florida', link: 'https://chat.whatsapp.com/FlXQPnMFOuq4eoRAo9xO2q', categoryId: '1769517422754', locationId: '11' },
    { title: 'Business & Networking - NJ', link: 'https://chat.whatsapp.com/Dil1CtaK2io6M8nl7DvXNo', categoryId: '1769517422754', locationId: '6' },
    { title: 'Business & Networking - NY', link: 'https://chat.whatsapp.com/Jfw3SYKrall67fn7KBveyZ', categoryId: '1769517422754', locationId: '9' },
    { title: 'Car Rental', link: 'https://chat.whatsapp.com/FsfWPjjVVZ0Bcq42Ldr6iq', categoryId: '6', locationId: '20' },
    { title: 'Car Lease', link: 'https://chat.whatsapp.com/FwH3LPLyThsAa3upPRYV6x', categoryId: '6', locationId: '20' },
    { title: 'Car Sales - CA & West Coast', link: 'https://chat.whatsapp.com/JDuQVdS6FtpGvY8AJcNibN', categoryId: '6', locationId: '10' },
    { title: 'Car Sales - IL & Midwest', link: 'https://chat.whatsapp.com/Ljsmpxr5KCnDF3Qqcyeo2o', categoryId: '6', locationId: '12' },
    { title: 'Car Sales - FL & Southeast', link: 'https://chat.whatsapp.com/Dw2GeCxbVWNAhGwEvl8UAK', categoryId: '6', locationId: '11' },
    { title: 'Car Sales - NY & Northeast', link: 'https://chat.whatsapp.com/H7O5B6RegQk40KJ3fh48ZI', categoryId: '6', locationId: '9' },
    { title: 'Daily Inspiration & Quotes', link: 'https://chat.whatsapp.com/DFuFZoXeh0bLWmXGwzZiCa', categoryId: '2', locationId: '20' },
    { title: 'Smart Deals', link: 'https://chat.whatsapp.com/EHHnHGq3VsT0h9JKfC2UGw', categoryId: '4', locationId: '20' },
    { title: 'Travel Deals', link: 'https://chat.whatsapp.com/FGFQ8lHPCam9HoLP6enZZO', categoryId: '19', locationId: '20' },
    { title: 'Israel Events', link: 'https://chat.whatsapp.com/GTHyr3sbqHl3YRKrxpJfZy', categoryId: '7', locationId: '20' },
    { title: 'FL Events', link: 'https://chat.whatsapp.com/Iw0jM2y4jpuEVKz242Z2YV', categoryId: '7', locationId: '11' },
    { title: 'Events - NY & NJ', link: 'https://chat.whatsapp.com/H8NjHQboymwEzBOxK9Ubku', categoryId: '7', locationId: '9' },
  ];

  let added = 0, skipped = 0;
  
  for (const g of newGroups) {
    if (existingLinks.has(g.link)) {
      console.log('⏭️  SKIP (dup link):', g.title);
      skipped++;
      continue;
    }
    if (existingTitles.has(g.title.toLowerCase())) {
      console.log('⏭️  SKIP (dup title):', g.title);
      skipped++;
      continue;
    }

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

    groups.push(group);
    existingLinks.add(g.link);
    console.log('✅ ADD:', g.title);
    added++;
    
    // Small delay for unique IDs
    await new Promise(r => setTimeout(r, 50));
  }

  console.log('\n--- SUMMARY ---');
  console.log('Added:', added);
  console.log('Skipped:', skipped);
  console.log('Total groups now:', groups.length);

  if (added > 0) {
    console.log('\nSaving to Redis...');
    const res = await postJSON('https://www.crownheightsgroups.com/api/admin/groups', groups);
    console.log('Save result:', res.status, res.data.substring(0, 200));
  }
}

main().catch(console.error);
