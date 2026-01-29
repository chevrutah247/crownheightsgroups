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

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
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
    const fetchNews = async () => {
      try {
        const res = await fetch('/api/rss');
        const data = await res.json();
        setNews(data.items || []);
      } catch (error) {
        console.error('Failed to fetch news:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

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

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      
      if (hours < 1) return 'Just now';
      if (hours < 24) return `${hours}h ago`;
      if (hours < 48) return 'Yesterday';
      
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      });
    } catch {
      return '';
    }
  };

  const sources = ['all', ...Array.from(new Set(news.map(n => n.source)))];
  const filteredNews = filter === 'all' ? news : news.filter(n => n.source === filter);

  const getSourceColor = (source: string) => {
    const colors: Record<string, string> = {
      'Anash.org': '#1e3a5f',
      'Chabad.org': '#c9a227',
      'COLlive': '#dc2626',
      'JPost': '#0066cc',
    };
    return colors[source] || '#666';
  };

  return (
    <>
      <Header user={user} onLogout={handleLogout} />
      
      <main className="main">
        <div className="page-header">
          <h1 className="page-title">📰 Community News</h1>
          <p className="page-subtitle">
            Latest updates from Jewish news sources
          </p>
        </div>

        {/* Source Filter */}
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '2rem',
          padding: '0 1rem'
        }}>
          {sources.map(source => (
            <button
              key={source}
              onClick={() => setFilter(source)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                border: 'none',
                background: filter === source ? '#1e3a5f' : '#f1f5f9',
                color: filter === source ? 'white' : '#475569',
                fontWeight: filter === source ? 'bold' : 'normal',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: '0.9rem',
                textTransform: source === 'all' ? 'capitalize' : 'none'
              }}
            >
              {source === 'all' ? '🌐 All Sources' : source}
            </button>
          ))}
        </div>

        {/* News Grid */}
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div className="spinner"></div>
              <p style={{ marginTop: '1rem', color: '#666' }}>Loading news...</p>
            </div>
          ) : filteredNews.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem',
              background: '#f8fafc',
              borderRadius: '12px'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
              <h3 style={{ color: '#475569', marginBottom: '0.5rem' }}>No news available</h3>
              <p style={{ color: '#94a3b8' }}>
                Check back later for the latest updates
              </p>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1.5rem'
            }}>
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
                    textDecoration: 'none',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                >
                  {/* Image */}
                  {item.image && (
                    <div style={{
                      height: '160px',
                      background: `url(${item.image}) center/cover no-repeat`,
                      backgroundColor: '#f1f5f9'
                    }} />
                  )}
                  
                  {/* Content */}
                  <div style={{ padding: '1rem' }}>
                    {/* Source & Date */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{
                        background: getSourceColor(item.source) + '15',
                        color: getSourceColor(item.source),
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold'
                      }}>
                        {item.source}
                      </span>
                      <span style={{ 
                        color: '#94a3b8', 
                        fontSize: '0.8rem' 
                      }}>
                        {formatDate(item.pubDate)}
                      </span>
                    </div>
                    
                    {/* Title */}
                    <h3 style={{ 
                      margin: '0 0 0.5rem 0', 
                      color: '#1e3a5f',
                      fontSize: '1rem',
                      lineHeight: '1.4',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {item.title}
                    </h3>
                    
                    {/* Description */}
                    {item.description && (
                      <p style={{ 
                        margin: 0, 
                        color: '#64748b',
                        fontSize: '0.85rem',
                        lineHeight: '1.5',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {item.description}
                      </p>
                    )}
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* External Links */}
        <div style={{ 
          maxWidth: '800px', 
          margin: '3rem auto',
          padding: '0 1rem'
        }}>
          <h3 style={{ textAlign: 'center', marginBottom: '1rem', color: '#475569' }}>
            📌 More News Sources
          </h3>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '0.75rem',
            justifyContent: 'center'
          }}>
            {[
              { name: 'Anash.org', url: 'https://anash.org', color: '#1e3a5f' },
              { name: 'COLlive', url: 'https://collive.com', color: '#dc2626' },
              { name: 'Chabad.org News', url: 'https://www.chabad.org/news', color: '#c9a227' },
              { name: 'CrownHeights.info', url: 'https://crownheights.info', color: '#16a34a' },
              { name: 'Shmais', url: 'https://shmais.com', color: '#7c3aed' },
            ].map(site => (
              <a
                key={site.name}
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '0.5rem 1rem',
                  background: site.color,
                  color: 'white',
                  borderRadius: '20px',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  transition: 'opacity 0.2s'
                }}
              >
                {site.name} →
              </a>
            ))}
          </div>
        </div>

        {/* New Groups CTA */}
        <div style={{ 
          maxWidth: '600px', 
          margin: '2rem auto',
          padding: '1.5rem',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          borderRadius: '16px',
          textAlign: 'center',
          color: 'white'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>
            🆕 Check Out New Groups
          </h3>
          <p style={{ margin: '0 0 1rem 0', opacity: 0.9 }}>
            See what WhatsApp groups were added recently
          </p>
          <Link 
            href="/new"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              background: 'white',
              color: '#059669',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}
          >
            View New Groups →
          </Link>
        </div>
      </main>
      
      <Footer />
    </>
  );
}
