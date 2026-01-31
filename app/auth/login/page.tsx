'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [mode, setMode] = useState<'verify' | 'login'>('login');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const router = useRouter();

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError('');
    setLoading(true);
    if (password === '770') {
      localStorage.setItem('community_verified', 'true');
      router.push('/auth/register');
    } else {
      setError('Incorrect answer. Hint: The famous address!');
      setLoading(false);
    }
    return false;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError('');
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: userPassword }),
      });
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return false;
      }
      
      if (data.token) {
        document.cookie = `session=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}`;
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      window.location.href = '/';
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
    }
    return false;
  };

  const onLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    handleLogin(e as unknown as React.FormEvent);
  };

  const onVerifyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    handleVerify(e as unknown as React.FormEvent);
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
          <p style={{ color: '#666', fontSize: '0.95rem' }}>{mode === 'verify' ? 'New member? Answer to continue' : 'Welcome back!'}</p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: '#f3f4f6', padding: '4px', borderRadius: '10px' }}>
          <button type="button" onClick={() => { setMode('login'); setError(''); }} style={{ flex: 1, padding: '0.75rem', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', background: mode === 'login' ? 'white' : 'transparent', color: mode === 'login' ? '#2563eb' : '#6b7280', boxShadow: mode === 'login' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>🔑 Login</button>
          <button type="button" onClick={() => { setMode('verify'); setError(''); }} style={{ flex: 1, padding: '0.75rem', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', background: mode === 'verify' ? 'white' : 'transparent', color: mode === 'verify' ? '#10b981' : '#6b7280', boxShadow: mode === 'verify' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>✨ Register</button>
        </div>

        {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

        {mode === 'login' && (
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" style={{ width: '100%', padding: '0.875rem', border: '2px solid #ddd', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>Password</label>
              <input type="password" value={userPassword} onChange={(e) => setUserPassword(e.target.value)} placeholder="Enter your password" style={{ width: '100%', padding: '0.875rem', border: '2px solid #ddd', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' }} />
            </div>
            <button type="button" onClick={onLoginClick} disabled={loading || !email || !userPassword} style={{ width: '100%', padding: '1rem', background: (loading || !email || !userPassword) ? '#94a3b8' : '#2563eb', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold', cursor: (loading || !email || !userPassword) ? 'not-allowed' : 'pointer' }}>{loading ? 'Signing in...' : 'Sign In'}</button>
          </div>
        )}

        {mode === 'verify' && (
          <div>
            <div style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', padding: '1.25rem', borderRadius: '12px', border: '1px solid #bae6fd', marginBottom: '1.5rem' }}>
              <div style={{ fontWeight: 'bold', color: '#0369a1', fontSize: '1rem', marginBottom: '0.5rem' }}>🏠 What is the address of Chabad World Headquarters on Eastern Parkway?</div>
              <div style={{ color: '#0c4a6e', fontSize: '0.9rem' }}>Enter only the building number</div>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="_ _ _" maxLength={3} style={{ width: '100%', textAlign: 'center', fontSize: '2rem', letterSpacing: '1rem', padding: '1rem', border: '2px solid #ddd', borderRadius: '12px', boxSizing: 'border-box' }} />
            </div>
            <button type="button" onClick={onVerifyClick} disabled={loading || !password} style={{ width: '100%', padding: '1rem', background: (loading || !password) ? '#94a3b8' : '#10b981', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold', cursor: (loading || !password) ? 'not-allowed' : 'pointer' }}>{loading ? 'Checking...' : 'Continue to Register'}</button>
          </div>
        )}

        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #eee', textAlign: 'center', color: '#999', fontSize: '0.8rem' }}>🕯️ A community project for Crown Heights</div>
      </div>
    </div>
  );
}
