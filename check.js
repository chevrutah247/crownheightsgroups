const { Redis } = require('@upstash/redis');
const redis = new Redis({ url: 'https://credible-dogfish-42233.upstash.io', token: 'AaT5AAIncDJmYTg3NzM2OGMzZDM0ZTA0YTA1ZDgyMzI3ZmNlYTAxNnAyNDIyMzM' });
redis.get('businesses').then(b => {
  if (!b) { console.log('No businesses'); return; }
  const data = Array.isArray(b) ? b : JSON.parse(b);
  console.log('Total:', data.length);
  data.forEach(x => console.log(x.businessName, '- status:', x.status));
});
