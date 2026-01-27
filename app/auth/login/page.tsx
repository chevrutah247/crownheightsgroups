'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      localStorage.setItem('session_token', data.token);
      localStorage.setItem('user_email', data.user.email);
      localStorage.setItem('user_name', data.user.name);
      localStorage.setItem('user_role', data.user.role);

      window.location.href = '/';
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '420px' }}>
        {/* 770 Photo */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ 
            width: '200px', 
            height: '150px', 
            margin: '0 auto 1rem',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '3px solid #c9a227',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            <img 
              src="/770.jpg" 
              alt="770 Eastern Parkway"
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover',
                objectPosition: 'center top'
              }}
            />
          </div>
          <h1 style={{ color: '#1e3a5f', marginBottom: '0.25rem', fontSize: '1.75rem' }}>
            Crown Heights Groups
          </h1>
          <p style={{ color: '#666', fontSize: '0.95rem' }}>
            Community members only
          </p>
        </div>

        {/* Password Hint */}
        <div style={{ 
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', 
          padding: '1rem', 
          borderRadius: '12px',
          border: '1px solid #bae6fd',
          marginBottom: '1rem'
        }}>
          <div style={{ fontWeight: 'bold', color: '#0369a1', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
            🤔 What is the address of this building?
          </div>
          <div style={{ color: '#0c4a6e', fontSize: '0.9rem' }}>
            Enter only the number
          </div>
        </div>

        {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="_ _ _"
              style={{ textAlign: 'center', fontSize: '1.25rem', letterSpacing: '0.5rem' }}
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Checking...' : 'Enter'}
          </button>
        </form>

        <div className="auth-link">
          New here? <Link href="/auth/register">Create account</Link>
        </div>

        <div style={{ 
          marginTop: '1.5rem', 
          paddingTop: '1rem', 
          borderTop: '1px solid #eee',
          textAlign: 'center',
          color: '#999',
          fontSize: '0.8rem'
        }}>
          🕯️ A community project for Crown Heights
        </div>
      </div>
    </div>
  );
}
