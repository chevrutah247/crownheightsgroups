import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (url && token) return new Redis({ url, token });
  return null;
}

export async function GET() {
  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    
    const [groups, groupCategories, services, serviceCategories, locations, users] = await Promise.all([
      redis.get('groups'),
      redis.get('groupCategories'),
      redis.get('services'),
      redis.get('serviceCategories'),
      redis.get('locations'),
      redis.get('users')
    ]);
    
    const backup = {
      timestamp: new Date().toISOString(),
      data: {
        groups: groups ? (typeof groups === 'string' ? JSON.parse(groups) : groups) : [],
        groupCategories: groupCategories ? (typeof groupCategories === 'string' ? JSON.parse(groupCategories) : groupCategories) : [],
        services: services ? (typeof services === 'string' ? JSON.parse(services) : services) : [],
        serviceCategories: serviceCategories ? (typeof serviceCategories === 'string' ? JSON.parse(serviceCategories) : serviceCategories) : [],
        locations: locations ? (typeof locations === 'string' ? JSON.parse(locations) : locations) : [],
        users: users ? (typeof users === 'string' ? JSON.parse(users) : users) : []
      }
    };
    
    return NextResponse.json(backup);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
