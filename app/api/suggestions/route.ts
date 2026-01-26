import { NextRequest, NextResponse } from 'next/server';
import { suggestions } from '@/lib/data';

export async function GET() {
  // Return pending suggestions
  const pending = suggestions.filter(s => s.status === 'pending');
  return NextResponse.json({ suggestions: pending });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, payload, contactEmail } = body;
    
    // Validate required fields
    if (!type || !payload) {
      return NextResponse.json(
        { error: 'Type and payload are required' },
        { status: 400 }
      );
    }
    
    // In production, this would save to database
    const newSuggestion = {
      id: `suggestion-${Date.now()}`,
      type,
      payload,
      status: 'pending' as const,
      contactEmail,
      createdAt: new Date().toISOString(),
    };
    
    // For demo, just log it
    console.log('New suggestion:', newSuggestion);
    
    return NextResponse.json({ 
      success: true, 
      id: newSuggestion.id,
      message: 'Your suggestion has been submitted for review'
    });
  } catch (error) {
    console.error('Error creating suggestion:', error);
    return NextResponse.json(
      { error: 'Failed to submit suggestion' },
      { status: 500 }
    );
  }
}
