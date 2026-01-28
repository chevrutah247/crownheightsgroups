'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function SubscribePage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState('weekly');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, frequency })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Subscription failed');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      
      <main className="main">
        <div style={{ 
          maxWidth: '500px', 
          margin: '2rem auto',
          padding: '0 1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2.5rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            {success ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                <h2 style={{ color: '#1e3a5f', marginBottom: '0.5rem' }}>
                  You're Subscribed!
                </h2>
                <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                  You'll receive {frequency} updates about new groups at <strong>{email}</strong>
                </p>
                <Link 
                  href="/"
                  style={{
                    display: 'inline-block',
                    padding: '0.875rem 2rem',
                    background: '#2563eb',
                    color: 'white',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: 'bold'
                  }}
                >
                  Browse Groups
                </Link>
              </div>
            ) : (
              <>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📬</div>
                  <h1 style={{ color: '#1e3a5f', marginBottom: '0.5rem', fontSize: '1.5rem' }}>
                    Subscribe to Updates
                  </h1>
                  <p style={{ color: '#666' }}>
                    Get notified when new groups are added
                  </p>
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
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '0.5rem', 
                      fontWeight: 'bold', 
                      color: '#333' 
                    }}>
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Enter your name"
                      style={{ 
                        width: '100%',
                        padding: '0.875rem',
                        border: '2px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '0.5rem', 
                      fontWeight: 'bold', 
                      color: '#333' 
                    }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="your@email.com"
                      style={{ 
                        width: '100%',
                        padding: '0.875rem',
                        border: '2px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '0.5rem', 
                      fontWeight: 'bold', 
                      color: '#333' 
                    }}>
                      Update Frequency
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {[
                        { value: 'daily', label: '📅 Daily' },
                        { value: 'weekly', label: '📆 Weekly' },
                        { value: 'monthly', label: '🗓️ Monthly' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setFrequency(option.value)}
                          style={{
                            flex: 1,
                            padding: '0.75rem',
                            borderRadius: '8px',
                            border: frequency === option.value ? '2px solid #2563eb' : '2px solid #e2e8f0',
                            background: frequency === option.value ? '#eff6ff' : 'white',
                            color: frequency === option.value ? '#2563eb' : '#64748b',
                            fontWeight: frequency === option.value ? 'bold' : 'normal',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      background: loading ? '#94a3b8' : '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {loading ? 'Subscribing...' : 'Subscribe'}
                  </button>
                </form>

                <p style={{ 
                  marginTop: '1.5rem', 
                  textAlign: 'center',
                  color: '#94a3b8',
                  fontSize: '0.85rem'
                }}>
                  You can unsubscribe at any time. We respect your privacy.
                </p>
              </>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}
