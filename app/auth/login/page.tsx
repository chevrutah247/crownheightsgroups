'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

declare global {
  interface Window {
    grecaptcha: any;
    onRecaptchaLoad: () => void;
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [recaptchaReady, setRecaptchaReady] = useState(false);
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const recaptchaWidgetId = useRef<number | null>(null);

  const RECAPTCHA_SITE_KEY = '6LfRI2EsAAAAAETaREL_Haq9igyN4xHsL6zArHve';

  useEffect(() => {
    window.onRecaptchaLoad = () => {
      setRecaptchaReady(true);
    };

    if (!document.querySelector('script[src*="recaptcha"]')) {
      const script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/enterprise.js?onload=onRecaptchaLoad&render=explicit';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    } else if (window.grecaptcha && window.grecaptcha.enterprise) {
      setRecaptchaReady(true);
    }
  }, []);

  useEffect(() => {
    if (recaptchaReady && recaptchaRef.current && recaptchaWidgetId.current === null) {
      try {
        recaptchaWidgetId.current = window.grecaptcha.enterprise.render(recaptchaRef.current, {
          sitekey: RECAPTCHA_SITE_KEY,
          callback: (token: string) => setRecaptchaToken(token),
          'expired-callback': () => setRecaptchaToken(''),
          theme: 'light',
          size: 'normal',
        });
      } catch (e) {
        console.error('reCAPTCHA render error:', e);
      }
    }
  }, [recaptchaReady]);

  const resetRecaptcha = () => {
    setRecaptchaToken('');
    if (window.grecaptcha && window.grecaptcha.enterprise && recaptchaWidgetId.current !== null) {
      try { window.grecaptcha.enterprise.reset(recaptchaWidgetId.current); } catch (e) {}
    }
  };

  const handleLogin = async () => {
    setError('');

    if (!recaptchaToken) {
      setError('Please complete the reCAPTCHA verification');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: userPassword, recaptchaToken }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        resetRecaptcha();
        setLoading(false);
        return;
      }

      if (data.token) {
        document.cookie = 'session=' + data.token + '; path=/; max-age=604800';
        localStorage.setItem('session_token', data.token);
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      setTimeout(() => { window.location.replace('/'); }, 200);
    } catch (err) {
      setError('Network error. Please try again.');
      resetRecaptcha();
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ width: '70px', height: '70px', background: 'linear-gradient(135deg, #d69e2e, #b7791f)', borderRadius: '50%', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', fontFamily: 'Georgia, serif' }}>CH</span>
          </div>
          <h1 style={{ color: '#1e3a5f', marginBottom: '0.25rem', fontSize: '1.75rem' }}>Crown Heights Groups</h1>
          <p style={{ color: '#666', fontSize: '0.95rem' }}>Welcome back!</p>
        </div>

        {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

        <div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" style={{ width: '100%', padding: '0.875rem', border: '2px solid #ddd', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Password</label>
            <input type="password" value={userPassword} onChange={(e) => setUserPassword(e.target.value)} placeholder="Your password" onKeyDown={(e) => { if (e.key === 'Enter' && recaptchaToken) handleLogin(); }} style={{ width: '100%', padding: '0.875rem', border: '2px solid #ddd', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: '1rem', textAlign: 'right' }}>
            <Link href="/auth/forgot-password" style={{ color: '#2563eb', textDecoration: 'none', fontSize: '0.9rem' }}>Forgot password?</Link>
          </div>

          {/* reCAPTCHA */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div ref={recaptchaRef}></div>
          </div>

          <button type="button" onClick={handleLogin} disabled={loading || !recaptchaToken} style={{ width: '100%', padding: '1rem', background: (loading || !recaptchaToken) ? '#93c5fd' : '#2563eb', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold', cursor: (loading || !recaptchaToken) ? 'not-allowed' : 'pointer' }}>{loading ? 'Signing in...' : 'Sign In'}</button>
        </div>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <p style={{ color: '#666', fontSize: '0.95rem' }}>
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" style={{ color: '#10b981', fontWeight: 'bold', textDecoration: 'none' }}>Create Account</Link>
          </p>
        </div>

        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #eee', textAlign: 'center', color: '#999', fontSize: '0.8rem' }}>A community project for Crown Heights</div>
      </div>
    </div>
  );
}
