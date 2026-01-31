import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (url && token) return new Redis({ url, token });
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const redis = getRedis();
    if (!redis) return NextResponse.json([]);

    const submissions: any[] = [];

    // Get groups
    const groups = await redis.get('groups');
    if (groups) {
      const data = typeof groups === 'string' ? JSON.parse(groups) : groups;
      if (Array.isArray(data)) {
        data.filter(g => g.submittedBy?.toLowerCase() === email.toLowerCase())
          .forEach(g => submissions.push({ id: g.id, title: g.title, status: g.status, type: 'group', createdAt: g.createdAt }));
      }
    }

    // Get group suggestions
    const groupSuggestions = await redis.get('groupSuggestions');
    if (groupSuggestions) {
      const data = typeof groupSuggestions === 'string' ? JSON.parse(groupSuggestions) : groupSuggestions;
      if (Array.isArray(data)) {
        data.filter(g => g.submittedBy?.toLowerCase() === email.toLowerCase())
          .forEach(g => submissions.push({ id: g.id, title: g.title, status: 'pending', type: 'group', createdAt: g.createdAt }));
      }
    }

    // Get services/businesses
    const services = await redis.get('services');
    if (services) {
      const data = typeof services === 'string' ? JSON.parse(services) : services;
      if (Array.isArray(data)) {
        data.filter(s => s.submittedBy?.toLowerCase() === email.toLowerCase())
          .forEach(s => submissions.push({ id: s.id, title: s.name, status: s.status, type: 'business', createdAt: s.createdAt }));
      }
    }

    // Get events
    const events = await redis.get('events');
    if (events) {
      const data = typeof events === 'string' ? JSON.parse(events) : events;
      if (Array.isArray(data)) {
        data.filter(e => e.submittedBy?.toLowerCase() === email.toLowerCase())
          .forEach(e => submissions.push({ id: e.id, title: e.title, status: e.status, type: 'event', createdAt: e.createdAt }));
      }
    }

    // Get campaigns
    const campaigns = await redis.get('campaigns');
    if (campaigns) {
      const data = typeof campaigns === 'string' ? JSON.parse(campaigns) : campaigns;
      if (Array.isArray(data)) {
        data.filter(c => c.submittedBy?.toLowerCase() === email.toLowerCase())
          .forEach(c => submissions.push({ id: c.id, title: c.title, status: c.status, type: 'campaign', createdAt: c.createdAt }));
      }
    }

    // Sort by date descending
    submissions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Submissions error:', error);
    return NextResponse.json([]);
  }
}
