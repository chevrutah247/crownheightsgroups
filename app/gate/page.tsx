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
      setError('Incorrect answer. Try again!');
      setCode('');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        
        {/* Изображение синагоги 770 */}
        <div style={{ 
          marginBottom: '1.5rem',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/770.jpg" 
            alt="770 Eastern Parkway" 
            style={{ 
              width: '100%', 
              height: 'auto',
              display: 'block',
              maxHeight: '250px',
              objectFit: 'cover'
            }}
          />
        </div>

        <h1 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>Crown Heights Groups</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Community members only
        </p>
        
        <div style={{ 
          background: '#f8f9fa', 
          padding: '1.5rem', 
          borderRadius: '12px', 
          marginBottom: '1.5rem' 
        }}>
          <p style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
            🤔 What is the correct address on Eastern Parkway?
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Enter only the number
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}
          <input 
            type="text" 
            value={code} 
            onChange={(e) => setCode(e.target.value)} 
            placeholder="___" 
            className="form-input" 
            style={{ 
              textAlign: 'center', 
              fontSize: '2rem', 
              letterSpacing: '0.5rem', 
              marginBottom: '1rem',
              maxWidth: '150px',
              margin: '0 auto 1rem'
            }} 
            autoFocus 
          />
          <button type="submit" className="form-btn">Enter</button>
        </form>
      </div>
    </div>
  );
}
