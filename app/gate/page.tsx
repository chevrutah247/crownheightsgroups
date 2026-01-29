'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function GatePage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === '770') {
      document.cookie = 'gate_passed=true; path=/; max-age=2592000';
      router.push('/auth/login');
    } else {
      setError('Incorrect answer. Hint: The famous address!');
      setCode('');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '420px', textAlign: 'center' }}>
        
        {/* 770 Image */}
        <div style={{ 
          width: '100%', 
          maxWidth: '300px',
          height: '180px', 
          margin: '0 auto 1.5rem',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '3px solid #c9a227',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)'
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
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>🏛️</div>
              <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>770 Eastern Parkway</div>
            </div>
          )}
        </div>

        <h1 style={{ marginBottom: '0.5rem', color: '#1e3a5f', fontSize: '1.75rem' }}>
          Crown Heights Groups
        </h1>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          Community members only
        </p>
        
        <div style={{ 
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', 
          padding: '1.25rem', 
          borderRadius: '12px',
          border: '1px solid #bae6fd',
          marginBottom: '1.5rem'
        }}>
          <p style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '0.5rem', color: '#0369a1' }}>
            🏠 What is the address of Chabad World Headquarters on Eastern Parkway?
          </p>
          <p style={{ color: '#0c4a6e', fontSize: '0.9rem', margin: 0 }}>
            Enter only the building number
          </p>
        </div>
        
        {error && (
          <div style={{ 
            background: '#fee2e2', 
            color: '#dc2626', 
            padding: '0.75rem', 
            borderRadius: '8px', 
            marginBottom: '1rem' 
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            value={code} 
            onChange={(e) => setCode(e.target.value)} 
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
              marginBottom: '1rem',
              boxSizing: 'border-box'
            }} 
            autoFocus 
          />
          <button 
            type="submit" 
            style={{
              width: '100%',
              padding: '1rem',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Enter Community
          </button>
        </form>

        <div style={{ 
          marginTop: '1.5rem', 
          paddingTop: '1rem', 
          borderTop: '1px solid #eee',
          color: '#999',
          fontSize: '0.8rem'
        }}>
          🕯️ A community project for Crown Heights
        </div>
      </div>
    </div>
  );
}
