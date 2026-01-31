'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface UserInfo { name: string; email: string; role: 'user' | 'admin'; }
interface Submission { id: string; title: string; status: string; type: string; createdAt: string; }

export default function ProfilePage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('session_token');
      if (!token) { window.location.href = '/auth/login'; return; }
      try {
        const response = await fetch('/api/auth/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) });
        const data = await response.json();
        if (data.valid) {
          setUser({ name: data.user.name, email: data.user.email, role: data.user.role });
          // Fetch user's submissions
          const subRes = await fetch(`/api/user/submissions?email=${encodeURIComponent(data.user.email)}`);
          const subData = await subRes.json();
          setSubmissions(Array.isArray(subData) ? subData : []);
        } else { localStorage.clear(); window.location.href = '/auth/login'; }
      } catch { window.location.href = '/auth/login'; }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const handleLogout = () => { localStorage.clear(); window.location.href = '/auth/login'; };

  const getStatusBadge = (status: string) => {
    if (status === 'approved') return { bg: '#dcfce7', color: '#166534', label: '✅ Approved' };
    if (status === 'rejected') return { bg: '#fee2e2', color: '#dc2626', label: '❌ Rejected' };
    return { bg: '#fef3c7', color: '#92400e', label: '⏳ Pending' };
  };

  const getTypeIcon = (type: string) => {
    if (type === 'group') return '👥';
    if (type === 'business') return '🏪';
    if (type === 'event') return '📅';
    if (type === 'campaign') return '💝';
    if (type === 'shabbos') return '🕯️';
    return '📄';
  };

  if (loading) {
    return <div className="auth-container"><div className="loading"><div className="spinner"></div></div></div>;
  }

  return (
    <>
      <Header user={user} onLogout={handleLogout} />
      
      <main className="main">
        <div className="page-header">
          <h1 className="page-title">👤 My Profile</h1>
          <p className="page-subtitle">Manage your account and submissions</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
          
          {/* User Info Card */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '2rem', color: 'white' }}>
                {user?.name?.charAt(0).toUpperCase() || '?'}
              </div>
              <h2 style={{ margin: '0 0 0.25rem 0' }}>{user?.name}</h2>
              <p style={{ color: '#666', margin: 0 }}>{user?.email}</p>
              {user?.role === 'admin' && <span style={{ display: 'inline-block', marginTop: '0.5rem', padding: '0.25rem 0.75rem', background: '#dbeafe', color: '#1d4ed8', borderRadius: '20px', fontSize: '0.85rem' }}>Admin</span>}
            </div>
            
            <div style={{ borderTop: '1px solid #eee', paddingTop: '1rem' }}>
              <Link href="/auth/forgot-password" style={{ display: 'block', padding: '0.75rem', background: '#f3f4f6', borderRadius: '8px', textDecoration: 'none', color: '#333', textAlign: 'center', marginBottom: '0.5rem' }}>
                🔐 Change Password
              </Link>
              <button onClick={handleLogout} style={{ width: '100%', padding: '0.75rem', background: '#fee2e2', border: 'none', borderRadius: '8px', color: '#dc2626', cursor: 'pointer', fontWeight: 500 }}>
                🚪 Logout
              </button>
            </div>
          </div>

          {/* Submissions Card */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem' }}>📋 My Submissions</h2>
            
            {submissions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                <p>You haven't submitted anything yet.</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginTop: '1rem' }}>
                  <Link href="/add/group" style={{ padding: '0.5rem 1rem', background: '#25D366', color: 'white', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem' }}>+ Add Group</Link>
                  <Link href="/add/business" style={{ padding: '0.5rem 1rem', background: '#8b5cf6', color: 'white', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem' }}>+ Add Business</Link>
                  <Link href="/add/event" style={{ padding: '0.5rem 1rem', background: '#f59e0b', color: 'white', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem' }}>+ Add Event</Link>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {submissions.map(sub => {
                  const badge = getStatusBadge(sub.status);
                  return (
                    <div key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                      <span style={{ fontSize: '1.5rem' }}>{getTypeIcon(sub.type)}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500 }}>{sub.title}</div>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>
                          {new Date(sub.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <span style={{ padding: '0.25rem 0.75rem', background: badge.bg, color: badge.color, borderRadius: '20px', fontSize: '0.8rem' }}>
                        {badge.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ maxWidth: '1100px', margin: '2rem auto 0' }}>
          <h3 style={{ marginBottom: '1rem' }}>➕ Add New</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            <Link href="/add/group" style={{ flex: '1 1 150px', padding: '1.5rem', background: 'white', borderRadius: '12px', textDecoration: 'none', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
              <div style={{ color: '#333', fontWeight: 500 }}>Add Group</div>
            </Link>
            <Link href="/add/business" style={{ flex: '1 1 150px', padding: '1.5rem', background: 'white', borderRadius: '12px', textDecoration: 'none', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏪</div>
              <div style={{ color: '#333', fontWeight: 500 }}>Add Business</div>
            </Link>
            <Link href="/add/event" style={{ flex: '1 1 150px', padding: '1.5rem', background: 'white', borderRadius: '12px', textDecoration: 'none', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📅</div>
              <div style={{ color: '#333', fontWeight: 500 }}>Add Event</div>
            </Link>
            <Link href="/add/shabbos" style={{ flex: '1 1 150px', padding: '1.5rem', background: 'white', borderRadius: '12px', textDecoration: 'none', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🕯️</div>
              <div style={{ color: '#333', fontWeight: 500 }}>Host Shabbos</div>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
