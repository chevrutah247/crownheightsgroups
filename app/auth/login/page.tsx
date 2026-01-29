'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password === '770') {
      localStorage.setItem('community_verified', 'true');
      router.push('/auth/register');
    } else {
      setError('Incorrect answer. Try again!');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ 
            width: '220px', 
            height: '160px', 
            margin: '0 auto 1rem',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '3px solid #c9a227',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            background: '#1e3a5f',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {!imageLoaded && <span style={{ fontSize: '4rem' }}>🏛️</span>}
            <img 
              src="/770.jpg" 
              alt="770 Eastern Parkway"
              onLoad={() => setImageLoaded(true)}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover',
                objectPosition: 'center top',
                display: imageLoaded ? 'block' : 'none'
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

        <div style={{ 
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', 
          padding: '1.25rem', 
          borderRadius: '12px',
          border: '1px solid #bae6fd',
          marginBottom: '1.5rem'
        }}>
          <div style={{ fontWeight: 'bold', color: '#0369a1', fontSize: '1rem', marginBottom: '0.5rem' }}>
            🏠 What is the address of Chabad Headquarters on Eastern Parkway, Crown Heights?
          </div>
          <div style={{ color: '#0c4a6e', fontSize: '0.9rem' }}>
            Enter only the building number
          </div>
        </div>

        {error && (
          <div style={{ 
            background: '#fee2e2', 
            color: '#dc2626', 
            padding: '0.75rem', 
            borderRadius: '8px', 
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="_ _ _"
              maxLength={3}
              style={{ 
                width: '100%',
                textAlign: 'center', 
                fontSize: '2rem', 
                letterSpacing: '1rem',
                padding: '1rem',
                border: '2px solid #ddd',
                borderRadius: '12px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: '100%',
              padding: '1rem',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Checking...' : 'Enter'}
          </button>
        </form>

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
