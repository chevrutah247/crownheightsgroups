'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function GatePage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (code === '770') {
      document.cookie = 'gate_passed=true; path=/; max-age=2592000';
      router.push('/auth/login');
    } else {
      setError('Incorrect code');
      setCode('');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏠</div>
        <h1 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>Crown Heights Groups</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Enter the community code to continue
        </p>
        
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="error-message" style={{ marginBottom: '1rem' }}>
              {error}
            </div>
          )}
          
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter code"
            className="form-input"
            style={{ 
              textAlign: 'center', 
              fontSize: '1.5rem', 
              letterSpacing: '0.5rem',
              marginBottom: '1rem'
            }}
            autoFocus
          />
          
          <button type="submit" className="form-btn">
            Enter
          </button>
        </form>
        
        <p style={{ marginTop: '2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Don't know the code? Contact the community administrator.
        </p>
      </div>
    </div>
  );
}
