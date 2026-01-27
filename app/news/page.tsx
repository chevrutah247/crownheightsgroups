'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EmergencyBar from '@/components/EmergencyBar';

interface UserInfo { name: string; email: string; role: 'user' | 'admin'; }
interface NewsItem { id: string; title: string; link: string; pubDate: string; source: string; sourceColor: string; image?: string; description?: string; }

const newsSources = [
  { id: 'collive', name: 'COLlive', url: 'https://collive.com/', logo: '🔵', description: 'Crown Heights News & Breaking Stories', color: '#1a365d' },
  { id: 'chabadinfo', name: 'Chabad.info', url: 'https://chabadinfo.com/', logo: '🟡', description: 'Chabad Lubavitch Worldwide News', color: '#b45309' },
  { id: 'crownheightsinfo', name: 'CrownHeights.info', url: 'https://crownheights.info/', logo: '🟢', description: 'Crown Heights Community News', color: '#047857' },
  { id: 'lubavitch', name: 'Lubavitch.com', url: 'https://www.lubavitch.com/', logo: '🟣', description: 'Official Chabad-Lubavitch News', color: '#7c3aed' },
];

export default function NewsPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [loading, setLoading] = useState(true);
  const [selectedSource, setSelectedSource] = useState<string>('all');

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('session_token');
      if (!token) { window.location.href = '/auth/login'; return; }
      try {
        const response = await fetch('/api/auth/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) });
        const data = await response.json();
        if (data.valid) setUser({ name: data.user.name, email: data.user.email, role: data.user.role });
        else { localStorage.clear(); window.location.href = '/auth/login'; }
      } catch { window.location.href = '/auth/login'; }
      finally { setLoading(false); }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch('/api/news');
        const data = await res.json();
        if (data.news) setNews(data.news);
      } catch (error) {
        console.error('Failed to fetch news:', error);
      } finally {
        setLoadingNews(false);
      }
    };
    fetchNews();
    const interval = setInterval(fetchNews, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => { localStorage.clear(); window.location.href = '/auth/login'; };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 60) return diffMins + 'm ago';
    if (diffHours < 24) return diffHours + 'h ago';
    if (diffDays < 7) return diffDays + 'd ago';
    return date.toLocaleDateString();
  };

  const filteredNews = selectedSource === 'all' ? news : news.filter(n => n.source === selectedSource);

  if (loading) return (<div className="auth-container"><div className="loading"><div className="spinner"></div></div></div>);

  return (
    <div>
      <style>{`
        @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
      
      <EmergencyBar />
      <Header user={user} onLogout={handleLogout} />
      
      {/* Breaking News Ticker */}
      {news.length > 0 && (
        <div style={{ background: '#1a1a2e', color: 'white', padding: '0.5rem 0', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ background: '#ef4444', padding: '0.25rem 0.75rem', fontWeight: 'bold', fontSize: '0.85rem', whiteSpace: 'nowrap', marginRight: '1rem' }}>
              🔴 LATEST
            </span>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ display: 'flex', gap: '3rem', animation: 'scroll 60s linear infinite', whiteSpace: 'nowrap' }}>
                {[...news.slice(0, 15), ...news.slice(0, 15)].map((item, i) => (
                  <a key={item.id + '-' + i} href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: item.sourceColor, fontWeight: 'bold', fontSize: '0.8rem' }}>{item.source}</span>
                    <span style={{ fontSize: '0.9rem' }}>{item.title}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="main">
        <div className="page-header">
          <h1 className="page-title">📰 Community News</h1>
          <p className="page-subtitle">Stay updated with the latest news</p>
        </div>

        {/* Source Filter */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <button onClick={() => setSelectedSource('all')} style={{ padding: '0.5rem 1rem', borderRadius: '20px', border: 'none', background: selectedSource === 'all' ? '#2563eb' : '#e5e7eb', color: selectedSource === 'all' ? 'white' : '#333', cursor: 'pointer', fontWeight: selectedSource === 'all' ? 'bold' : 'normal' }}>All Sources</button>
            {newsSources.map(s => (
              <button key={s.id} onClick={() => setSelectedSource(s.name)} style={{ padding: '0.5rem 1rem', borderRadius: '20px', border: 'none', background: selectedSource === s.name ? s.color : '#e5e7eb', color: selectedSource === s.name ? 'white' : '#333', cursor: 'pointer', fontWeight: selectedSource === s.name ? 'bold' : 'normal' }}>{s.logo} {s.name}</button>
            ))}
          </div>
        </div>

        {/* Live News Feed */}
        <section style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ display: 'inline-block', width: '10px', height: '10px', background: '#ef4444', borderRadius: '50%', animation: 'pulse 2s infinite' }}></span>
              Live News Feed ({filteredNews.length})
            </h2>
            {loadingNews && <span style={{ fontSize: '0.85rem', color: '#666' }}>Loading...</span>}
          </div>

          {filteredNews.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
              {filteredNews.slice(0, 24).map(item => (
                <a key={item.id} href={item.link} target="_blank" rel="noopener noreferrer" style={{ display: 'block', background: 'white', borderRadius: '12px', overflow: 'hidden', textDecoration: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', transition: 'transform 0.2s, box-shadow 0.2s' }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)'; }} onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'; }}>
                  {/* Image */}
                  {item.image ? (
                    <div style={{ width: '100%', height: '180px', overflow: 'hidden', background: '#f3f4f6' }}>
                      <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                  ) : (
                    <div style={{ width: '100%', height: '60px', background: 'linear-gradient(135deg, ' + item.sourceColor + ' 0%, ' + item.sourceColor + 'aa 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.25rem' }}>{item.source}</span>
                    </div>
                  )}
                  
                  {/* Content */}
                  <div style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span style={{ background: item.sourceColor, color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>{item.source}</span>
                      <span style={{ color: '#999', fontSize: '0.8rem' }}>{formatTime(item.pubDate)}</span>
                    </div>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#333', lineHeight: 1.4 }}>{item.title}</h3>
                    {item.description && (
                      <p style={{ margin: 0, color: '#666', fontSize: '0.85rem', lineHeight: 1.4 }}>{item.description}...</p>
                    )}
                  </div>
                </a>
              ))}
            </div>
          ) : !loadingNews ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#666', background: 'white', borderRadius: '12px' }}>
              <p>Unable to load news. Visit sources below.</p>
            </div>
          ) : null}
        </section>

        {/* News Sources */}
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>⭐ Visit News Sites</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            {newsSources.map(source => (
              <a key={source.id} href={source.url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', background: 'linear-gradient(135deg, ' + source.color + ' 0%, ' + source.color + 'dd 100%)', borderRadius: '12px', padding: '1.25rem', textDecoration: 'none', color: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{source.logo}</span>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{source.name}</h3>
                </div>
                <p style={{ margin: 0, opacity: 0.9, fontSize: '0.85rem' }}>{source.description}</p>
              </a>
            ))}
          </div>
        </section>

        {/* Info Cards */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', borderRadius: '12px', padding: '1.5rem', color: 'white' }}>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>🌤️ Weather</h3>
            <a href="https://weather.com/weather/today/l/40.6694,-73.9422" target="_blank" rel="noopener noreferrer" style={{ color: 'white', opacity: 0.9 }}>Crown Heights Weather →</a>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', borderRadius: '12px', padding: '1.5rem', color: 'white' }}>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>📅 Zmanim</h3>
            <a href="https://chabad.org/calendar/zmanim.htm" target="_blank" rel="noopener noreferrer" style={{ color: 'white', opacity: 0.9 }}>Todays Times →</a>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', borderRadius: '12px', padding: '1.5rem', color: 'white' }}>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>🔔 News Tip?</h3>
            <a href="mailto:news@collive.com" style={{ color: 'white', opacity: 0.9 }}>Submit to COLlive →</a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
