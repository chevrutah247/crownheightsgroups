'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { categories } from '@/lib/data';

interface Group {
  id: string;
  title: string;
  description: string;
  whatsappLink?: string;
  whatsappLinks?: string[];
  categoryId: string;
  locationId: string;
  locationName?: string;
  createdAt: string;
  clicksCount: number;
}

interface UserInfo {
  name: string;
  email: string;
  role: 'user' | 'admin';
}

type Period = 'today' | 'yesterday' | 'week' | 'month';

export default function NewGroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('week');
  const [count, setCount] = useState(0);
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    // Check auth
    const checkAuth = async () => {
      const token = localStorage.getItem('session_token');
      if (token) {
        try {
          const response = await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
          });
          const data = await response.json();
          if (data.valid) {
            setUser(data.user);
          }
        } catch (error) {
          console.error('Auth check failed:', error);
        }
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    fetchGroups(period);
  }, [period]);

  const fetchGroups = async (selectedPeriod: Period) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/groups/new?period=${selectedPeriod}`);
      const data = await res.json();
      setGroups(data.groups || []);
      setCount(data.count || 0);
    } catch (error) {
      console.error('Failed to fetch groups:', error);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('session_token');
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('session_token');
    setUser(null);
    window.location.href = '/auth/login';
  };

  const getCategoryById = (id: string) => {
    return categories.find(c => c.id === id);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const periodLabels: Record<Period, string> = {
    today: '📅 Today',
    yesterday: '📅 Yesterday', 
    week: '📅 This Week',
    month: '📅 This Month'
  };

  return (
    <>
      <Header user={user} onLogout={handleLogout} />
      
      <main className="main">
        <div className="page-header">
          <h1 className="page-title">🆕 New Groups</h1>
          <p className="page-subtitle">
            Recently added WhatsApp groups
          </p>
        </div>

        {/* Period Filter */}
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '2rem',
          padding: '0 1rem'
        }}>
          {(['today', 'yesterday', 'week', 'month'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding: '0.75rem 1.25rem',
                borderRadius: '25px',
                border: 'none',
                background: period === p ? '#2563eb' : '#f1f5f9',
                color: period === p ? 'white' : '#475569',
                fontWeight: period === p ? 'bold' : 'normal',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: '0.95rem'
              }}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '1.5rem',
          color: '#666'
        }}>
          {loading ? (
            'Loading...'
          ) : (
            <span>
              Found <strong style={{ color: '#2563eb' }}>{count}</strong> new group{count !== 1 ? 's' : ''} {period === 'today' ? 'today' : period === 'yesterday' ? 'yesterday' : period === 'week' ? 'this week' : 'this month'}
            </span>
          )}
        </div>

        {/* Groups List */}
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div className="spinner"></div>
            </div>
          ) : groups.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem',
              background: '#f8fafc',
              borderRadius: '12px'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
              <h3 style={{ color: '#475569', marginBottom: '0.5rem' }}>No new groups</h3>
              <p style={{ color: '#94a3b8' }}>
                {period === 'today' 
                  ? 'No groups were added today yet.' 
                  : period === 'yesterday'
                  ? 'No groups were added yesterday.'
                  : `No groups were added in the last ${period === 'week' ? '7 days' : 'month'}.`}
              </p>
              <Link 
                href="/suggest"
                style={{
                  display: 'inline-block',
                  marginTop: '1rem',
                  padding: '0.75rem 1.5rem',
                  background: '#10b981',
                  color: 'white',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 'bold'
                }}
              >
                ➕ Suggest a Group
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {groups.map((group) => {
                const category = getCategoryById(group.categoryId);
                const mainLink = group.whatsappLinks?.[0] || group.whatsappLink;
                
                return (
                  <div 
                    key={group.id}
                    style={{
                      background: 'white',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      border: '1px solid #e2e8f0',
                      transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>{category?.icon || '📱'}</span>
                        <h3 style={{ margin: 0, color: '#1e3a5f', fontSize: '1.1rem' }}>
                          {group.title}
                        </h3>
                      </div>
                      <span style={{ 
                        background: '#dbeafe', 
                        color: '#1e40af',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: '500'
                      }}>
                        {formatDate(group.createdAt)}
                      </span>
                    </div>
                    
                    <p style={{ 
                      color: '#64748b', 
                      margin: '0 0 1rem 0',
                      fontSize: '0.95rem',
                      lineHeight: '1.5'
                    }}>
                      {group.description?.slice(0, 150)}{group.description?.length > 150 ? '...' : ''}
                    </p>
                    
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '0.5rem'
                    }}>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ 
                          background: '#f1f5f9', 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          color: '#475569'
                        }}>
                          📍 {group.locationName || 'Unknown'}
                        </span>
                        <span style={{ 
                          background: '#f1f5f9', 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          color: '#475569'
                        }}>
                          {category?.name || 'General'}
                        </span>
                      </div>
                      
                      {mainLink && (
                        <a
                          href={mainLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            background: '#25D366',
                            color: 'white',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontWeight: 'bold',
                            fontSize: '0.9rem'
                          }}
                        >
                          Join Group
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Subscribe CTA */}
        <div style={{ 
          maxWidth: '600px', 
          margin: '3rem auto',
          padding: '2rem',
          background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
          borderRadius: '16px',
          textAlign: 'center',
          color: 'white'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.3rem' }}>
            📬 Get Weekly Updates
          </h3>
          <p style={{ margin: '0 0 1.5rem 0', opacity: 0.9 }}>
            Subscribe to receive new groups in your inbox every week
          </p>
          <Link 
            href="/subscribe"
            style={{
              display: 'inline-block',
              padding: '0.875rem 2rem',
              background: 'white',
              color: '#1e3a5f',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '1rem'
            }}
          >
            Subscribe Now →
          </Link>
        </div>
      </main>
      
      <Footer />
    </>
  );
}
