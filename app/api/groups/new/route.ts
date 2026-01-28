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
    const redis = getRedis();
    if (!redis) return NextResponse.json([]);
    
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'week'; // today, yesterday, week, month
    
    const stored = await redis.get('groups');
    if (!stored) return NextResponse.json([]);
    
    const groups = typeof stored === 'string' ? JSON.parse(stored) : stored;
    if (!Array.isArray(groups)) return NextResponse.json([]);
    
    // Filter only approved groups
    const approvedGroups = groups.filter((g: any) => g.status === 'approved');
    
    // Calculate date range
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    
    let startDate: Date;
    let endDate: Date = new Date(today.getTime() + 24 * 60 * 60 * 1000); // End of today
    
    switch (period) {
      case 'today':
        startDate = today;
        break;
      case 'yesterday':
        startDate = yesterday;
        endDate = today;
        break;
      case 'week':
        startDate = weekAgo;
        break;
      case 'month':
        startDate = monthAgo;
        break;
      default:
        startDate = weekAgo;
    }
    
    // Filter by date
    const filteredGroups = approvedGroups.filter((g: any) => {
      if (!g.createdAt) return false;
      const createdAt = new Date(g.createdAt);
      return createdAt >= startDate && createdAt < endDate;
    });
    
    // Sort by newest first
    filteredGroups.sort((a: any, b: any) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    // Get locations and categories for enrichment
    const locationsStored = await redis.get('locations');
    const locations = locationsStored 
      ? (typeof locationsStored === 'string' ? JSON.parse(locationsStored) : locationsStored)
      : [];
    
    // Enrich groups with location names
    const enrichedGroups = filteredGroups.map((g: any) => {
      const location = locations.find((l: any) => l.id === g.locationId);
      return {
        ...g,
        locationName: location?.neighborhood || 'Unknown'
      };
    });
    
    return NextResponse.json({
      groups: enrichedGroups,
      period,
      count: enrichedGroups.length,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      }
    });
  } catch (error) {
    console.error('GET new groups error:', error);
    return NextResponse.json({ groups: [], error: String(error) });
  }
}
