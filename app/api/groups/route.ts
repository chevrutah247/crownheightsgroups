import { NextRequest, NextResponse } from 'next/server';
import { groups, getApprovedGroups, getCategoryById, getLocationById } from '@/lib/data';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const locationId = searchParams.get('location');
  const categoryId = searchParams.get('category');
  const search = searchParams.get('search');
  const sort = searchParams.get('sort') || 'popular';
  
  let result = getApprovedGroups();
  
  // Filter by location
  if (locationId) {
    result = result.filter(g => g.locationId === locationId);
  }
  
  // Filter by category
  if (categoryId) {
    result = result.filter(g => g.categoryId === categoryId);
  }
  
  // Search filter
  if (search) {
    const query = search.toLowerCase();
    result = result.filter(g => 
      g.title.toLowerCase().includes(query) ||
      g.description.toLowerCase().includes(query) ||
      g.tags?.some(t => t.toLowerCase().includes(query))
    );
  }
  
  // Sort
  switch (sort) {
    case 'popular':
      result.sort((a, b) => b.clicksCount - a.clicksCount);
      break;
    case 'date':
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    case 'alpha':
      result.sort((a, b) => a.title.localeCompare(b.title));
      break;
  }
  
  // Enrich with category and location data
  const enrichedResult = result.map(group => ({
    ...group,
    category: getCategoryById(group.categoryId),
    location: getLocationById(group.locationId),
  }));
  
  return NextResponse.json({
    groups: enrichedResult,
    total: enrichedResult.length,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // In production, this would validate and save to database
    // For now, return success
    return NextResponse.json({ success: true, id: 'new-id' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create group' },
      { status: 500 }
    );
  }
}
