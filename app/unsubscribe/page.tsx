'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function UnsubscribePage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage('You have been unsubscribed successfully.');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f172a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{
        background: '#1e293b',
        borderRadius: '16px',
        padding: '3rem',
        maxWidth: '480px',
        width: '100%',
        textAlign: 'center',
      }}>
        <h1 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
          Unsubscribe
        </h1>
        <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
          Enter your email to unsubscribe from the weekly newsletter.
        </p>

        {status === 'success' ? (
          <div>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>&#10003;</div>
            <p style={{ color: '#4ade80', marginBottom: '1.5rem' }}>{message}</p>
            <Link href="/" style={{
              color: '#60a5fa',
              textDecoration: 'none',
            }}>
              Back to home
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid #334155',
                background: '#0f172a',
                color: 'white',
                fontSize: '1rem',
                marginBottom: '1rem',
                boxSizing: 'border-box',
              }}
            />

            {status === 'error' && (
              <p style={{ color: '#f87171', marginBottom: '1rem', fontSize: '0.875rem' }}>
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: 'none',
                background: '#ef4444',
                color: 'white',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                opacity: status === 'loading' ? 0.7 : 1,
              }}
            >
              {status === 'loading' ? 'Processing...' : 'Unsubscribe'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
