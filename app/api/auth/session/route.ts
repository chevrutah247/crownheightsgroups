import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'No token provided' },
        { status: 401 }
      );
    }

    const user = validateSession(token);

    if (!user) {
      return NextResponse.json(
        { valid: false, error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      valid: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Session validation error:', error);
    return NextResponse.json(
      { valid: false, error: 'Session validation failed' },
      { status: 500 }
    );
  }
}
