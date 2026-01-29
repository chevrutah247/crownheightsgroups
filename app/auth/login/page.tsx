'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password === '770') {
      localStorage.setItem('community_verified', 'true');
      router.push('/auth/register');
    } else {
      setError('Incorrect answer. Hint: The famous address!');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          {/* 770 Image with fallback */}
          <div style={{ 
            width: '100%', 
            maxWidth: '300px',
            height: '180px', 
            margin: '0 auto 1rem',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '3px solid #c9a227',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {!imageError ? (
              <img 
                src="/770.jpg?v=2" 
                alt="770 Eastern Parkway"
                onError={() => setImageError(true)}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div style={{ 
                textAlign: 'center',
                color: 'white',
                padding: '1rem'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>🏛️</div>
                <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>770 Eastern Parkway</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Chabad World Headquarters</div>
              </div>
            )}
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
            🏠 What is the address of Chabad World Headquarters on Eastern Parkway?
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
              background: loading ? '#94a3b8' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Checking...' : 'Enter Community'}
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
