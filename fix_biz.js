const { Redis } = require('@upstash/redis');
const redis = new Redis({ url: 'https://credible-dogfish-42233.upstash.io', token: 'AaT5AAIncDJmYTg3NzM2OGMzZDM0ZTA0YTA1ZDgyMzI3ZmNlYTAxNnAyNDIyMzM' });

redis.get('businesses').then(async b => {
  if (!b) return;
  let data = Array.isArray(b) ? b : JSON.parse(b);
  
  // Remove test entries
  data = data.filter(x => !x.businessName.toLowerCase().includes('test'));
  
  // Approve all pending
  data.forEach(x => {
    if (x.status === 'pending') x.status = 'approved';
  });
  
  await redis.set('businesses', JSON.stringify(data));
  console.log('Fixed! Remaining:', data.length);
  data.forEach(x => console.log(x.businessName, '-', x.status));
});
