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
  const [mode, setMode] = useState<'verify' | 'login'>('login');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [recaptchaReady, setRecaptchaReady] = useState(false);
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const recaptchaWidgetId = useRef<number | null>(null);

  const RECAPTCHA_SITE_KEY = '6LdSIGEsAAAAANzcxUoDOD4TefhjO_oroH05wdwW';

  useEffect(() => {
    // Load reCAPTCHA script
    window.onRecaptchaLoad = () => {
      setRecaptchaReady(true);
    };

    if (!document.querySelector('script[src*="recaptcha"]')) {
      const script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    } else if (window.grecaptcha && window.grecaptcha.render) {
      setRecaptchaReady(true);
    }
  }, []);

  useEffect(() => {
    if (recaptchaReady && recaptchaRef.current && recaptchaWidgetId.current === null) {
      try {
        recaptchaWidgetId.current = window.grecaptcha.render(recaptchaRef.current, {
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
  }, [recaptchaReady, mode]);

  const resetRecaptcha = () => {
    setRecaptchaToken('');
    if (window.grecaptcha && recaptchaWidgetId.current !== null) {
      try { window.grecaptcha.reset(recaptchaWidgetId.current); } catch (e) {}
    }
  };

  const handleVerify = () => {
    setError('');
    setLoading(true);
    if (password === '770') {
      localStorage.setItem('community_verified', 'true');
      document.cookie = 'gate_passed=true; path=/; max-age=31536000';
      setTimeout(() => { window.location.href = '/auth/register'; }, 100);
    } else {
      setError('Incorrect answer. Hint: The famous address!');
      setLoading(false);
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
      
      document.cookie = 'gate_passed=true; path=/; max-age=31536000';
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
          <div style={{ width: '100%', maxWidth: '300px', height: '180px', margin: '0 auto 1rem', borderRadius: '12px', overflow: 'hidden', border: '3px solid #c9a227', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {!imageError ? (
              <img src="/770-building.jpg?v=2" alt="770" onError={() => setImageError(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ textAlign: 'center', color: 'white', padding: '1rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>🏛️</div>
                <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>770 Eastern Parkway</div>
              </div>
            )}
          </div>
          <h1 style={{ color: '#1e3a5f', marginBottom: '0.25rem', fontSize: '1.75rem' }}>Crown Heights Groups</h1>
          <p style={{ color: '#666', fontSize: '0.95rem' }}>{mode === 'verify' ? 'New member?' : 'Welcome back!'}</p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: '#f3f4f6', padding: '4px', borderRadius: '10px' }}>
          <button type="button" onClick={() => { setMode('login'); setError(''); }} style={{ flex: 1, padding: '0.75rem', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', background: mode === 'login' ? 'white' : 'transparent', color: mode === 'login' ? '#2563eb' : '#6b7280' }}>🔑 Login</button>
          <button type="button" onClick={() => { setMode('verify'); setError(''); }} style={{ flex: 1, padding: '0.75rem', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', background: mode === 'verify' ? 'white' : 'transparent', color: mode === 'verify' ? '#10b981' : '#6b7280' }}>✨ Register</button>
        </div>

        {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

        {mode === 'login' && (
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
        )}

        {mode === 'verify' && (
          <div>
            <div style={{ background: '#e0f2fe', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
              <div style={{ fontWeight: 'bold', color: '#0369a1' }}>🏠 What is the address of Chabad World Headquarters?</div>
              <div style={{ color: '#0c4a6e', fontSize: '0.9rem' }}>Enter only the building number</div>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="_ _ _" maxLength={3} style={{ width: '100%', textAlign: 'center', fontSize: '2rem', letterSpacing: '1rem', padding: '1rem', border: '2px solid #ddd', borderRadius: '12px', boxSizing: 'border-box' }} />
            </div>
            <button type="button" onClick={handleVerify} disabled={loading} style={{ width: '100%', padding: '1rem', background: loading ? '#6ee7b7' : '#10b981', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>{loading ? 'Checking...' : 'Continue to Register'}</button>
          </div>
        )}

        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #eee', textAlign: 'center', color: '#999', fontSize: '0.8rem' }}>🕯️ A community project</div>
      </div>
    </div>
  );
}
