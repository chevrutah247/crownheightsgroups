'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface NewsItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: string;
  image?: string;
}

interface UserInfo {
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export default function EventsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(function() {
    const checkAuth = async function() {
      const token = localStorage.getItem('session_token');
      if (token) {
        try {
          const response = await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
          });
          const data = await response.json();
          if (data.valid) setUser(data.user);
        } catch (error) {
          console.error('Auth check failed:', error);
        }
      }
    };
    checkAuth();
  }, []);

  useEffect(function() {
    const fetchNews = async function() {
      try {
        const res = await fetch('/api/rss/events');
        const data = await res.json();
        setNews(data.items || []);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const handleLogout = async function() {
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

  const formatDate = function(dateStr: string) {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours < 1) return 'Just now';
      if (hours < 24) return hours + 'h ago';
      if (hours < 48) return 'Yesterday';
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (e) {
      return '';
    }
  };

  const sources: string[] = ['all'].concat(Array.from(new Set(news.map(function(n) { return n.source; }))));
  const filteredNews = filter === 'all' ? news : news.filter(function(n) { return n.source === filter; });

  const getSourceBgColor = function(source: string) {
    if (source === 'COLlive') return '#ef4444';
    if (source === 'CrownHeights.info') return '#2563eb';
    if (source === 'Anash.org') return '#16a34a';
    if (source === 'Lubavitch.com') return '#9333ea';
    return '#6b7280';
  };

  if (loading) {
    return (
      <div className="app-container">
        <Header user={user} onLogout={handleLogout} />
        <main className="main-content" style={{ paddingTop: '120px', minHeight: '100vh', background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' }}>
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <p style={{ color: '#64748b' }}>Loading events...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="app-container">
      <Header user={user} onLogout={handleLogout} />
      <main className="main-content" style={{ paddingTop: '120px', minHeight: '100vh', background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1e3a5f', marginBottom: '10px' }}>Community Events</h1>
            <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Latest events and happenings in the community</p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginBottom: '30px' }}>
            {sources.map(function(source) {
              return (
                <button
                  key={source}
                  onClick={function() { setFilter(source); }}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '25px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px',
                    background: filter === source ? '#f59e0b' : 'white',
                    color: filter === source ? 'white' : '#475569'
                  }}
                >
                  {source === 'all' ? 'All Sources' : source}
                </button>
              );
            })}
          </div>
          {filteredNews.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '25px', marginBottom: '50px' }}>
              {filteredNews.map(function(item, index) {
                return (
                  
                    key={index}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: 'white',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      textDecoration: 'none',
                      display: 'block'
                    }}
                  >
                    {item.image && (
                      <div style={{ height: '180px', overflow: 'hidden' }}>
                        <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                    <div style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ padding: '4px 12px', borderRadius: '20px', color: 'white', fontSize: '12px', fontWeight: '600', background: getSourceBgColor(item.source) }}>{item.source}</span>
                        <span style={{ color: '#94a3b8', fontSize: '13px' }}>{formatDate(item.pubDate)}</span>
                      </div>
                      <h3 style={{ margin: '0 0 10px 0', fontSize: '17px', fontWeight: '700', color: '#1e3a5f' }}>{item.title}</h3>
                      {item.description && <p style={{ margin: '0', color: '#64748b', fontSize: '14px' }}>{item.description.slice(0, 120)}</p>}
                      <div style={{ marginTop: '15px', color: '#f59e0b', fontWeight: '600', fontSize: '14px' }}>Read more</div>
                    </div>
                  </a>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '16px' }}>
              <h3 style={{ color: '#1e3a5f', marginBottom: '10px' }}>No events found</h3>
              <p style={{ color: '#64748b' }}>Check back later for community events</p>
            </div>
          )}
          <div style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', borderRadius: '20px', padding: '40px', textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ color: 'white', marginBottom: '15px', fontSize: '1.5rem' }}>Looking for Event Groups?</h2>
            <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '20px' }}>Join WhatsApp groups to stay updated on community events</p>
            <Link href="/groups?category=events" style={{ display: 'inline-block', background: 'white', color: '#d97706', padding: '14px 32px', borderRadius: '30px', fontWeight: '700', textDecoration: 'none' }}>Browse Event Groups</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
