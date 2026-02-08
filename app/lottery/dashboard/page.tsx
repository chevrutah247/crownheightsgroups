'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EmergencyBar from '@/components/EmergencyBar';

export default function LotteryDashboardPage() {
  const [email, setEmail] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [currentPool, setCurrentPool] = useState<any>(null);

  // Check if user email is stored
  useEffect(() => {
    const storedEmail = localStorage.getItem('lottery_email');
    if (storedEmail) {
      setEmail(storedEmail);
      fetchUserData(storedEmail);
    }
  }, []);

  const fetchUserData = async (userEmail: string) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/lottery/user-data?email=' + encodeURIComponent(userEmail));
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'User not found');
      }

      setUserData(data.user);
      setEntries(data.entries || []);
      setCurrentPool(data.currentPool);
      setIsLoggedIn(true);
      localStorage.setItem('lottery_email', userEmail);
      
    } catch (err: any) {
      setError(err.message);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      fetchUserData(email);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('lottery_email');
    setIsLoggedIn(false);
    setUserData(null);
    setEntries([]);
    setEmail('');
  };

  const copyReferralLink = () => {
    const link = `https://crownheightsgroups.com/lottery/join?ref=${userData?.referral_code}`;
    navigator.clipboard.writeText(link);
    alert('Referral link copied!');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Not logged in - show login form
  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)' }}>
        <EmergencyBar />
        <Header user={null} onLogout={() => {}} />
        
        <main style={{ maxWidth: '500px', margin: '0 auto', padding: '3rem 1rem' }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
          }}>
            <h1 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#1e3a5f' }}>
              🎰 Lottery Dashboard
            </h1>
            
            <p style={{ textAlign: 'center', color: '#666', marginBottom: '2rem' }}>
              Enter your email to view your lottery pool history
            </p>

            <form onSubmit={handleLogin}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                style={{
                  width: '100%',
                  padding: '1rem',
                  fontSize: '1.1rem',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  marginBottom: '1rem',
                  boxSizing: 'border-box'
                }}
              />

              {error && (
                <div style={{
                  background: '#fee2e2',
                  color: '#dc2626',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  textAlign: 'center'
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: loading ? '#9ca3af' : 'linear-gradient(135deg, #ffd700, #f59e0b)',
                  color: '#1e3a5f',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: loading ? 'wait' : 'pointer'
                }}
              >
                {loading ? 'Loading...' : 'View My Dashboard'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <p style={{ color: '#666', marginBottom: '1rem' }}>Not a member yet?</p>
              <Link href="/lottery/join" style={{
                color: '#3b82f6',
                fontWeight: 'bold',
                textDecoration: 'none'
              }}>
                Join This Week's Pool →
              </Link>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  // Logged in - show dashboard
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)' }}>
      <EmergencyBar />
      <Header user={null} onLogout={() => {}} />
      
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
        
        {/* Welcome Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a5f, #3b82f6)',
          borderRadius: '20px',
          padding: '2rem',
          color: 'white',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem' }}>
              👋 Welcome, {userData?.first_name}!
            </h1>
            <p style={{ margin: 0, opacity: 0.8 }}>{userData?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1rem',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>

        {/* Stats Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#22c55e' }}>
              ${userData?.credits?.toFixed(2) || '0.00'}
            </div>
            <div style={{ color: '#666', fontSize: '0.9rem' }}>Credits Balance</div>
          </div>
          
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
              {entries.length}
            </div>
            <div style={{ color: '#666', fontSize: '0.9rem' }}>Pools Joined</div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
              ${(entries.reduce((sum, e) => sum + (e.amount_paid || 0), 0)).toFixed(2)}
            </div>
            <div style={{ color: '#666', fontSize: '0.9rem' }}>Total Contributed</div>
          </div>
        </div>

        {/* Referral Section */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.1))',
          border: '2px solid rgba(34, 197, 94, 0.3)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ color: '#22c55e', margin: '0 0 1rem 0' }}>
            🎁 Your Referral Link
          </h3>
          <p style={{ color: '#94a3b8', marginBottom: '1rem', fontSize: '0.9rem' }}>
            Share this link with friends. You'll get $1 credit for each friend who joins!
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              readOnly
              value={`crownheightsgroups.com/lottery/join?ref=${userData?.referral_code}`}
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #374151',
                background: '#1e293b',
                color: 'white',
                fontSize: '0.9rem'
              }}
            />
            <button
              onClick={copyReferralLink}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#22c55e',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              📋 Copy
            </button>
          </div>
        </div>

        {/* Current Pool Status */}
        {currentPool && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#1e3a5f' }}>
              🎯 Current Week's Pool
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <div style={{ color: '#666', fontSize: '0.85rem' }}>Status</div>
                <div style={{ 
                  fontWeight: 'bold',
                  color: currentPool.status === 'open' ? '#22c55e' : '#f59e0b'
                }}>
                  {currentPool.status?.toUpperCase()}
                </div>
              </div>
              <div>
                <div style={{ color: '#666', fontSize: '0.85rem' }}>Participants</div>
                <div style={{ fontWeight: 'bold' }}>{currentPool.total_participants || 0}</div>
              </div>
              <div>
                <div style={{ color: '#666', fontSize: '0.85rem' }}>Pool Total</div>
                <div style={{ fontWeight: 'bold', color: '#22c55e' }}>
                  ${(currentPool.total_amount || 0).toFixed(2)}
                </div>
              </div>
              <div>
                <div style={{ color: '#666', fontSize: '0.85rem' }}>Closes</div>
                <div style={{ fontWeight: 'bold' }}>{formatDate(currentPool.week_end)}</div>
              </div>
            </div>

            {currentPool.admin_numbers && (
              <div style={{
                background: '#fef3c7',
                borderRadius: '8px',
                padding: '1rem',
                marginTop: '1rem'
              }}>
                <div style={{ fontWeight: 'bold', color: '#92400e', marginBottom: '0.5rem' }}>
                  🎱 This Week's Numbers:
                </div>
                <pre style={{ 
                  margin: 0, 
                  whiteSpace: 'pre-wrap', 
                  fontFamily: 'monospace',
                  fontSize: '0.9rem',
                  color: '#1e3a5f'
                }}>
                  {currentPool.admin_numbers}
                </pre>
              </div>
            )}

            {!entries.find(e => e.pool_week_id === currentPool.id) && currentPool.status === 'open' && (
              <Link href="/lottery/join" style={{
                display: 'block',
                textAlign: 'center',
                background: 'linear-gradient(135deg, #ffd700, #f59e0b)',
                color: '#1e3a5f',
                padding: '1rem',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 'bold',
                marginTop: '1rem'
              }}>
                🎟️ Join This Week's Pool
              </Link>
            )}

            {entries.find(e => e.pool_week_id === currentPool.id) && (
              <div style={{
                background: '#dcfce7',
                color: '#166534',
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center',
                marginTop: '1rem',
                fontWeight: 'bold'
              }}>
                ✅ You're in this week's pool!
              </div>
            )}
          </div>
        )}

        {/* Entry History */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '1.5rem'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#1e3a5f' }}>
            📜 Your Entry History
          </h3>
          
          {entries.length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center', padding: '2rem 0' }}>
              No entries yet. Join this week's pool to get started!
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', color: '#666' }}>Week</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', color: '#666' }}>Paid</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', color: '#666' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, i) => (
                    <tr key={entry.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '0.75rem' }}>
                        {formatDate(entry.created_at)}
                      </td>
                      <td style={{ padding: '0.75rem', color: '#22c55e', fontWeight: 'bold' }}>
                        ${(entry.amount_paid || 0).toFixed(2)}
                        {entry.credits_used > 0 && (
                          <span style={{ color: '#666', fontWeight: 'normal', fontSize: '0.8rem' }}>
                            {' '}(${entry.credits_used} credits)
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          background: entry.status === 'paid' ? '#dcfce7' : '#fef3c7',
                          color: entry.status === 'paid' ? '#166534' : '#92400e'
                        }}>
                          {entry.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Back Link */}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link href="/lottery" style={{ color: '#94a3b8' }}>
            ← Back to Lottery Pool
          </Link>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
