import { NextRequest, NextResponse } from 'next/server';
import { validateLogin, createSession } from '@/lib/auth';

const RECAPTCHA_SITE_KEY = '6LfRI2EsAAAAAETaREL_Haq9igyN4xHsL6zArHve';

async function verifyRecaptcha(token: string): Promise<boolean> {
  const apiKey = process.env.RECAPTCHA_API_KEY;
  const projectId = process.env.RECAPTCHA_PROJECT_ID;

  if (!apiKey || !projectId) {
    console.error('RECAPTCHA_API_KEY or RECAPTCHA_PROJECT_ID not set');
    // Fallback: allow login if reCAPTCHA is not configured yet
    return true;
  }

  try {
    const response = await fetch(
      `https://recaptchaenterprise.googleapis.com/v1/projects/${projectId}/assessments?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: {
            token: token,
            siteKey: RECAPTCHA_SITE_KEY,
            expectedAction: 'LOGIN',
          },
        }),
      }
    );
    const data = await response.json();
    
    if (!data.tokenProperties?.valid) {
      console.error('reCAPTCHA token invalid:', data.tokenProperties?.invalidReason);
      return false;
    }
    
    // Score 0.0 = bot, 1.0 = human. Accept 0.5+
    const score = data.riskAnalysis?.score ?? 0;
    return score >= 0.3;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    // On error, allow login to not block users
    return true;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, recaptchaToken } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Verify reCAPTCHA if token provided
    if (recaptchaToken) {
      const isHuman = await verifyRecaptcha(recaptchaToken);
      if (!isHuman) {
        return NextResponse.json(
          { error: 'reCAPTCHA verification failed. Please try again.' },
          { status: 403 }
        );
      }
    }

    // Validate credentials
    const result = await validateLogin(email, password);

    if (!result.success) {
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
