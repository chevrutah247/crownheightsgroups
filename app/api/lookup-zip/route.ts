import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const zip = searchParams.get('zip');
    const country = searchParams.get('country') || 'us';
    
    if (!zip || zip.length < 3) {
      return NextResponse.json({ error: 'ZIP code required' }, { status: 400 });
    }
    
    // Use Zippopotam.us free API
    const response = await fetch(`https://api.zippopotam.us/${country.toLowerCase()}/${zip}`);
    
    if (!response.ok) {
      return NextResponse.json({ error: 'ZIP code not found' }, { status: 404 });
    }
    
    const data = await response.json();
    
    // Format response
    const place = data.places?.[0];
    if (!place) {
      return NextResponse.json({ error: 'No data for ZIP' }, { status: 404 });
    }
    
    return NextResponse.json({
      zipCode: data['post code'],
      city: place['place name'],
      state: place['state abbreviation'] || place.state,
      stateFull: place.state,
      country: data.country,
      countryCode: data['country abbreviation']
    });
  } catch (error) {
    console.error('ZIP lookup error:', error);
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 });
  }
}
