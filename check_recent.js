const { Redis } = require('@upstash/redis');
const redis = new Redis({ url: 'https://credible-dogfish-42233.upstash.io', token: 'AaT5AAIncDJmYTg3NzM2OGMzZDM0ZTA0YTA1ZDgyMzI3ZmNlYTAxNnAyNDIyMzM' });

redis.get('groups').then(g => {
  const data = Array.isArray(g) ? g : JSON.parse(g);
  data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  console.log('Last 5 groups:');
  data.slice(0, 5).forEach(x => {
    const link = x.whatsappLinks?.[0] || x.whatsappLink || 'no link';
    console.log('-', x.title, '|', link.substring(0, 50));
  });
});
