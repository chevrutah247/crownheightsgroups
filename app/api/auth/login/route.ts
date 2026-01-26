import { NextRequest, NextResponse } from 'next/server';
import { validateLogin, createSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate credentials
    const result = await validateLogin(email, password);

    if (!result.success) {
      // Check if it's verification issue
      if (result.error === 'Please verify your email first') {
        return NextResponse.json(
          { error: result.error, needsVerification: true },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      );
    }

    // Create session
    const token = await createSession(email);

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: result.user!.id,
        name: result.user!.name,
        email: result.user!.email,
        role: result.user!.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}
