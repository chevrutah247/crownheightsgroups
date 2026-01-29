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
  category: string;
  image?: string;
}

interface UserInfo {
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('community');

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
    fetch('/api/rss')
      .then(r => r.json())
      .then(data => setNews(data.items || []))
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

  const categories = [
    { id: 'community', name: 'Community' },
    { id: 'religious', name: 'Torah' },
    { id: 'world', name: 'World News' }
  ];

  const categoryFiltered = news.filter(n => n.category === categoryFilter);
  const sources = ['all', ...Array.from(new Set(categoryFiltered.map(n => n.source)))];
  const filteredNews = filter === 'all' ? categoryFiltered : categoryFiltered.filter(n => n.source === filter);

  const getSourceColor = (source: string) => {
    const colors: Record<string, string> = {
      'Anash.org': '#1e3a5f',
      'Chabad.org': '#c9a227',
      'COLlive': '#dc2626',
      'CrownHeights.info': '#16a34a',
      'Jerusalem Post': '#0066cc'
    };
    return colors[source] || '#666';
  };

  return (
    <div>
      <Header user={user} onLogout={handleLogout} />
      <main className="main">
        <div className="page-header">
          <h1 className="page-title">Community News</h1>
          <p className="page-subtitle">Latest updates from Jewish news sources</p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1rem', padding: '0 1rem' }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => { setCategoryFilter(cat.id); setFilter('all'); }}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '25px',
                border: 'none',
                background: categoryFilter === cat.id ? '#1e3a5f' : '#f1f5f9',
                color: categoryFilter === cat.id ? 'white' : '#475569',
                fontWeight: categoryFilter === cat.id ? 'bold' : 'normal',
                cursor: 'pointer'
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem', padding: '0 1rem' }}>
          {sources.map(source => (
            <button
              key={source}
              onClick={() => setFilter(source)}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '15px',
                border: 'none',
                background: filter === source ? '#10b981' : '#e5e7eb',
                color: filter === source ? 'white' : '#475569',
                fontWeight: filter === source ? 'bold' : 'normal',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              {source === 'all' ? 'All Sources' : source}
            </button>
          ))}
        </div>

        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div className="spinner"></div>
            </div>
          ) : filteredNews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: '#f8fafc', borderRadius: '12px' }}>
              <h3 style={{ color: '#475569' }}>No news available</h3>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {filteredNews.map((item, index) => (
                <a
                  key={index}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block',
                    background: 'white',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    border: '1px solid #e2e8f0',
                    textDecoration: 'none'
                  }}
                >
                  {item.image && (
                    <div style={{ height: '160px', backgroundImage: 'url(' + item.image + ')', backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#f1f5f9' }} />
                  )}
                  <div style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ background: getSourceColor(item.source) + '20', color: getSourceColor(item.source), padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>{item.source}</span>
                      <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{formatDate(item.pubDate)}</span>
                    </div>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e3a5f', fontSize: '1rem', lineHeight: '1.4' }}>{item.title}</h3>
                    {item.description && <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>{item.description.replace(/<[^>]*>/g, '').slice(0, 120)}</p>}
                  </div>
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
