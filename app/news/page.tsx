'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  sourceIcon: string;
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const token = localStorage.getItem('session_token');
    if (token) {
      fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })
        .then(r => r.json())
        .then(data => { if (data.valid) setUser(data.user); })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    fetch('/api/news')
      .then(r => r.json())
      .then(data => setNews(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('session_token');
    setUser(null);
    window.location.href = '/auth/login';
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return hours + 'h ago';
    if (hours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const sources = ['all', ...Array.from(new Set(news.map(n => n.source)))];
  const filteredNews = filter === 'all' ? news : news.filter(n => n.source === filter);

  const getSourceColor = (source: string): string => {
    if (source === 'COLlive') return '#dc2626';
    if (source === 'CrownHeights.info') return '#16a34a';
    if (source === 'Chabad.info') return '#f59e0b';
    if (source === 'Lubavitch.com') return '#8b5cf6';
    if (source === 'Yeshiva World') return '#3b82f6';
    if (source === 'Chabad.org') return '#c9a227';
    return '#666';
  };

  const decodeHtml = (text: string): string => {
    return text.replace(/&#8217;/g, "'").replace(/&#8216;/g, "'").replace(/&#8220;/g, '"').replace(/&#8221;/g, '"').replace(/&#038;/g, '&').replace(/&amp;/g, '&');
  };

  if (loading) {
    return (
      <div>
        <Header user={user} onLogout={handleLogout} />
        <main className="main" style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Loading news...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header user={user} onLogout={handleLogout} />
      <main className="main">
        <div className="page-header">
          <h1 className="page-title">Community News</h1>
          <p className="page-subtitle">Latest updates from Jewish news sources</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem', padding: '0 1rem' }}>
          {sources.map(source => (
            <button key={source} onClick={() => setFilter(source)} style={{ padding: '0.5rem 1rem', borderRadius: '20px', border: 'none', background: filter === source ? '#1e3a5f' : '#e5e7eb', color: filter === source ? 'white' : '#475569', fontWeight: filter === source ? 'bold' : 'normal', cursor: 'pointer', fontSize: '0.9rem' }}>
              {source === 'all' ? 'All Sources' : source}
            </button>
          ))}
        </div>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1rem' }}>
          {filteredNews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: '#f8fafc', borderRadius: '12px' }}>
              <h3 style={{ color: '#475569' }}>No news available</h3>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {filteredNews.map((item, index) => (
                <a key={index} href={item.link} target="_blank" rel="noopener noreferrer" style={{ display: 'block', background: 'white', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0', textDecoration: 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ background: getSourceColor(item.source) + '20', color: getSourceColor(item.source), padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>{item.sourceIcon} {item.source}</span>
                    <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{formatDate(item.pubDate)}</span>
                  </div>
                  <h3 style={{ margin: 0, color: '#1e3a5f', fontSize: '1rem', lineHeight: '1.5' }}>{decodeHtml(item.title)}</h3>
                </a>
              ))}
            </div>
          )}
        </div>
        <div style={{ maxWidth: '600px', margin: '3rem auto', padding: '1.5rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: '16px', textAlign: 'center', color: 'white' }}>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>Check Out Updates</h3>
          <p style={{ margin: '0 0 1rem 0', opacity: 0.9 }}>See recently added groups</p>
          <Link href="/updates" style={{ display: 'inline-block', padding: '0.75rem 1.5rem', background: 'white', color: '#059669', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>View Updates</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
