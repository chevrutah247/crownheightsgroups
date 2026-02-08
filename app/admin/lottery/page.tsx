'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EmergencyBar from '@/components/EmergencyBar';

interface Participant {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  user_numbers: string;
  amount_paid: number;
  created_at: string;
}

interface PoolWeek {
  id: string;
  week_start: string;
  week_end: string;
  status: string;
  total_participants: number;
  total_amount: number;
  admin_numbers: string;
}

export default function AdminLotteryPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [poolWeek, setPoolWeek] = useState<PoolWeek | null>(null);
  const [adminNumbers, setAdminNumbers] = useState('');
  const [sendingEmails, setSendingEmails] = useState(false);
  const [message, setMessage] = useState('');

  // Check admin auth
  useEffect(() => {
    const adminAuth = sessionStorage.getItem('lottery_admin');
    if (adminAuth === 'true') {
      setIsAdmin(true);
      fetchData();
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = () => {
    // Simple password check - in production use proper auth
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === 'lottery2026') {
      sessionStorage.setItem('lottery_admin', 'true');
      setIsAdmin(true);
      fetchData();
    } else {
      alert('Wrong password');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/lottery/admin/current-pool');
      const data = await res.json();
      
      if (data.poolWeek) {
        setPoolWeek(data.poolWeek);
        setAdminNumbers(data.poolWeek.admin_numbers || '');
      }
      if (data.participants) {
        setParticipants(data.participants);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveNumbers = async () => {
    try {
      const res = await fetch('/api/lottery/admin/save-numbers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          poolWeekId: poolWeek?.id,
          adminNumbers,
        }),
      });

      if (res.ok) {
        setMessage('Numbers saved!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Failed to save numbers:', error);
      setMessage('Error saving numbers');
    }
  };

  const sendNumbersEmail = async () => {
    if (!confirm('Send numbers to all participants? This will close registration for this week.')) {
      return;
    }

    setSendingEmails(true);
    setMessage('');

    try {
      const res = await fetch('/api/lottery/admin/send-numbers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          poolWeekId: poolWeek?.id,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`✅ Numbers sent to ${data.sent} participants!`);
        fetchData(); // Refresh data
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to send emails:', error);
      setMessage('❌ Error sending emails');
    } finally {
      setSendingEmails(false);
    }
  };

  const closePool = async () => {
    if (!confirm('Close this pool and start a new week?')) {
      return;
    }

    try {
      const res = await fetch('/api/lottery/admin/close-pool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          poolWeekId: poolWeek?.id,
        }),
      });

      if (res.ok) {
        setMessage('Pool closed. New week started!');
        fetchData();
      }
    } catch (error) {
      console.error('Failed to close pool:', error);
    }
  };

  if (!isAdmin) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a' }}>
        <EmergencyBar />
        <Header user={null} onLogout={() => {}} />
        
        <main style={{ maxWidth: '400px', margin: '0 auto', padding: '4rem 1rem' }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '2rem',
            textAlign: 'center'
          }}>
            <h1 style={{ color: '#1e3a5f', marginBottom: '1.5rem' }}>🔐 Admin Access</h1>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              style={{
                width: '100%',
                padding: '1rem',
                fontSize: '1.1rem',
                borderRadius: '12px',
                border: '2px solid #e5e7eb',
                marginBottom: '1rem'
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
            <button
              onClick={handleLogin}
              style={{
                width: '100%',
                padding: '1rem',
                background: '#1e3a5f',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1.1rem',
                cursor: 'pointer'
              }}
            >
              Login
            </button>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'white', fontSize: '1.5rem' }}>⏳ Loading...</p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a' }}>
      <EmergencyBar />
      <Header user={null} onLogout={() => {}} />
      
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        
        <h1 style={{ color: '#ffd700', fontSize: '2rem', marginBottom: '2rem' }}>
          🎰 Lottery Pool Admin
        </h1>

        {message && (
          <div style={{
            background: message.includes('✅') ? '#dcfce7' : '#fef2f2',
            border: `2px solid ${message.includes('✅') ? '#86efac' : '#fecaca'}`,
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.5rem',
            color: message.includes('✅') ? '#166534' : '#dc2626',
            fontSize: '1.1rem'
          }}>
            {message}
          </div>
        )}

        {/* Pool Week Info */}
        <div style={{
          background: '#1e293b',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h2 style={{ color: 'white', marginBottom: '1rem' }}>Current Pool Week</h2>
          
          {poolWeek ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <p style={{ color: '#94a3b8', margin: 0 }}>Status</p>
                <p style={{ 
                  color: poolWeek.status === 'open' ? '#22c55e' : '#f59e0b',
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                  margin: '0.25rem 0 0 0'
                }}>
                  {poolWeek.status.toUpperCase()}
                </p>
              </div>
              <div>
                <p style={{ color: '#94a3b8', margin: 0 }}>Participants</p>
                <p style={{ color: '#ffd700', fontSize: '1.3rem', fontWeight: 'bold', margin: '0.25rem 0 0 0' }}>
                  {poolWeek.total_participants}
                </p>
              </div>
              <div>
                <p style={{ color: '#94a3b8', margin: 0 }}>Pool Total</p>
                <p style={{ color: '#22c55e', fontSize: '1.3rem', fontWeight: 'bold', margin: '0.25rem 0 0 0' }}>
                  ${poolWeek.total_amount?.toFixed(2)}
                </p>
              </div>
              <div>
                <p style={{ color: '#94a3b8', margin: 0 }}>Closes</p>
                <p style={{ color: 'white', fontSize: '1.1rem', margin: '0.25rem 0 0 0' }}>
                  {formatDate(poolWeek.week_end)}
                </p>
              </div>
            </div>
          ) : (
            <p style={{ color: '#94a3b8' }}>No active pool week</p>
          )}
        </div>

        {/* Admin Numbers Input */}
        <div style={{
          background: '#1e293b',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h2 style={{ color: 'white', marginBottom: '1rem' }}>🎱 Enter Ticket Numbers</h2>
          <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>
            Enter all lottery numbers you purchased. These will be emailed to all participants.
          </p>
          
          <textarea
            value={adminNumbers}
            onChange={(e) => setAdminNumbers(e.target.value)}
            placeholder={`Mega Millions:
02 - 15 - 34 - 48 - 67 (Mega: 12)
05 - 22 - 33 - 45 - 70 (Mega: 08)

Powerball:
10 - 24 - 35 - 52 - 61 (PB: 05)
03 - 18 - 27 - 44 - 69 (PB: 22)`}
            style={{
              width: '100%',
              minHeight: '200px',
              padding: '1rem',
              fontSize: '1rem',
              fontFamily: 'monospace',
              borderRadius: '12px',
              border: '2px solid #334155',
              background: '#0f172a',
              color: 'white',
              marginBottom: '1rem',
              resize: 'vertical'
            }}
          />

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={saveNumbers}
              style={{
                padding: '1rem 2rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              💾 Save Numbers
            </button>

            <button
              onClick={sendNumbersEmail}
              disabled={sendingEmails || !adminNumbers}
              style={{
                padding: '1rem 2rem',
                background: sendingEmails ? '#9ca3af' : '#22c55e',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: sendingEmails ? 'wait' : 'pointer'
              }}
            >
              {sendingEmails ? '⏳ Sending...' : '📧 Send to All Participants'}
            </button>

            <button
              onClick={closePool}
              style={{
                padding: '1rem 2rem',
                background: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              🔒 Close Pool & Start New Week
            </button>
          </div>
        </div>

        {/* Participants List */}
        <div style={{
          background: '#1e293b',
          borderRadius: '16px',
          padding: '1.5rem'
        }}>
          <h2 style={{ color: 'white', marginBottom: '1rem' }}>
            👥 Participants ({participants.length})
          </h2>

          {participants.length === 0 ? (
            <p style={{ color: '#94a3b8' }}>No participants yet this week.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #334155' }}>
                    <th style={{ textAlign: 'left', padding: '1rem', color: '#94a3b8' }}>#</th>
                    <th style={{ textAlign: 'left', padding: '1rem', color: '#94a3b8' }}>Name</th>
                    <th style={{ textAlign: 'left', padding: '1rem', color: '#94a3b8' }}>Email</th>
                    <th style={{ textAlign: 'left', padding: '1rem', color: '#94a3b8' }}>Phone</th>
                    <th style={{ textAlign: 'left', padding: '1rem', color: '#94a3b8' }}>Their Numbers</th>
                    <th style={{ textAlign: 'right', padding: '1rem', color: '#94a3b8' }}>Paid</th>
                    <th style={{ textAlign: 'left', padding: '1rem', color: '#94a3b8' }}>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((p, i) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #334155' }}>
                      <td style={{ padding: '1rem', color: '#ffd700' }}>{i + 1}</td>
                      <td style={{ padding: '1rem', color: 'white' }}>
                        {p.first_name} {p.last_name}
                      </td>
                      <td style={{ padding: '1rem', color: '#94a3b8' }}>{p.email}</td>
                      <td style={{ padding: '1rem', color: '#94a3b8' }}>{p.phone || '-'}</td>
                      <td style={{ padding: '1rem', color: '#ffd700', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                        {p.user_numbers ? JSON.parse(p.user_numbers) : '-'}
                      </td>
                      <td style={{ padding: '1rem', color: '#22c55e', textAlign: 'right' }}>
                        ${p.amount_paid?.toFixed(2)}
                      </td>
                      <td style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                        {formatDate(p.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: '2px solid #334155' }}>
                    <td colSpan={5} style={{ padding: '1rem', color: 'white', fontWeight: 'bold' }}>
                      Total
                    </td>
                    <td style={{ padding: '1rem', color: '#22c55e', textAlign: 'right', fontWeight: 'bold' }}>
                      ${participants.reduce((sum, p) => sum + (p.amount_paid || 0), 0).toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* User Numbers from Participants */}
        {participants.some(p => p.user_numbers) && (
          <div style={{
            background: '#1e293b',
            borderRadius: '16px',
            padding: '1.5rem',
            marginTop: '2rem'
          }}>
            <h2 style={{ color: 'white', marginBottom: '1rem' }}>🎯 Numbers Requested by Participants</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {participants
                .filter(p => p.user_numbers)
                .map(p => (
                  <div key={p.id} style={{
                    background: '#0f172a',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{ color: '#94a3b8' }}>{p.first_name}:</span>
                    <span style={{ color: '#ffd700', fontFamily: 'monospace' }}>
                      {JSON.parse(p.user_numbers)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

      </main>
      
      <Footer />
    </div>
  );
}
