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
    { title: 'AI World News', link: 'https://chat.whatsapp.com/CI3Vht6zq9oCtPlgEUBbNi', categoryId: '17', locationId: '20' },
    { title: 'Link Center', link: 'https://chat.whatsapp.com/HyapCSq4VOvBn9OrMc7bbk', categoryId: '24', locationId: '20' },
    { title: 'Promotions & Shares', link: 'https://chat.whatsapp.com/EfWdZbh8IB1Igu3nkmpSBU', categoryId: '4', locationId: '20' },
    { title: 'Open Chat', link: 'https://chat.whatsapp.com/IiFm56Rl72WJNXLVDv9Gs4', categoryId: '1', locationId: '20' },
    { title: 'Israel - Giveaways', link: 'https://chat.whatsapp.com/GXmV4pvgHSV6LA9G7hw2yt', categoryId: '1769517534610', locationId: '20' },
    { title: 'Los Angeles - Giveaways', link: 'https://chat.whatsapp.com/IiGoUX0lzCQFPkMiwx3RMi', categoryId: '1769517534610', locationId: '10' },
    { title: 'Miami - Giveaways', link: 'https://chat.whatsapp.com/BZ2gDG2eDYcGbq0ixdHJ0O', categoryId: '1769517534610', locationId: '11' },
    { title: 'NYC Giveaways', link: 'https://chat.whatsapp.com/IiKxvSxGDZsFgIDeyuVXnU', categoryId: '1769517534610', locationId: '9' },
    { title: 'Lakewood Giveaways', link: 'https://chat.whatsapp.com/J35fk1s52i6JY5ogY33jEG', categoryId: '1769517534610', locationId: '6' },
    { title: 'Jewish Community Jobs', link: 'https://chat.whatsapp.com/DjcGzsLLcFIA7ifVJFTBIA', categoryId: '3', locationId: '20' },
    { title: 'Driving Jobs', link: 'https://chat.whatsapp.com/ECbxTp7CvBz5INMXgZ0pXp', categoryId: '3', locationId: '20' },
    { title: 'Jobs - Israel', link: 'https://chat.whatsapp.com/Cytx4IaTzJYFTPjtpNR406', categoryId: '3', locationId: '20' },
    { title: 'Jobs - NJ', link: 'https://chat.whatsapp.com/BuKJanH1PmjDZMQ6DSXapA', categoryId: '3', locationId: '20' },
    { title: 'Jobs - NY', link: 'https://chat.whatsapp.com/EN7pv1A9PJt4auPXd6zbVC', categoryId: '3', locationId: '9' },
    { title: 'Jobs - California', link: 'https://chat.whatsapp.com/JxtsLub1hV84sNU1K8U3kH', categoryId: '3', locationId: '10' },
    { title: 'Jobs - Florida', link: 'https://chat.whatsapp.com/Ke6m0oCWOz8787jzH49CLO', categoryId: '3', locationId: '11' },
    { title: 'Judaica Gallery', link: 'https://chat.whatsapp.com/D9mROyN1Vmb02NSwv05EGq', categoryId: '1', locationId: '20' },
    { title: 'Judaica Marketplace - Israel', link: 'https://chat.whatsapp.com/DpONcTxIyaE6ct0enIQpyU', categoryId: '4', locationId: '20' },
    { title: 'Judaica Marketplace - USA', link: 'https://chat.whatsapp.com/GYiAXKi6zuHKxDoldm3QM7', categoryId: '4', locationId: '20' },
    { title: 'Kosher Recipes', link: 'https://chat.whatsapp.com/EiVfUoa0Tt3FFpnZ5PNVhJ', categoryId: '10', locationId: '20' },
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
        console.log('⏭️  SKIP:', g.title);
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
