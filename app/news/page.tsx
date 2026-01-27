'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EmergencyBar from '@/components/EmergencyBar';

interface UserInfo { name: string; email: string; role: 'user' | 'admin'; }

const newsSources = [
  { 
    id: 'collive', 
    name: 'COLlive', 
    url: 'https://collive.com/', 
    logo: '🔵',
    description: 'Crown Heights News, Community Updates & Breaking Stories',
    color: '#1a365d',
    featured: true
  },
  { 
    id: 'chabadinfo', 
    name: 'Chabad.info', 
    url: 'https://chabadinfo.com/', 
    logo: '🟡',
    description: 'Chabad Lubavitch Worldwide News & Information',
    color: '#b45309',
    featured: true
  },
  { 
    id: 'crownheightsinfo', 
    name: 'CrownHeights.info', 
    url: 'https://crownheights.info/', 
    logo: '🟢',
    description: 'Crown Heights Community News & Updates',
    color: '#047857'
  },
  { 
    id: 'shmais', 
    name: 'Shmais.com', 
    url: 'https://shmais.com/', 
    logo: '🔴',
    description: 'Jewish News Network - Breaking News',
    color: '#b91c1c'
  },
  { 
    id: 'lubavitch', 
    name: 'Lubavitch.com', 
    url: 'https://lubavitch.com/news', 
    logo: '🟣',
    description: 'Official Chabad-Lubavitch News Site',
    color: '#7c3aed'
  },
  { 
    id: 'chabad', 
    name: 'Chabad.org News', 
    url: 'https://chabad.org/news', 
    logo: '⚪',
    description: 'Jewish News, Torah & Encyclopedic Content',
    color: '#374151'
  },
];

const quickLinks = [
  { name: 'Tzivos Hashem', url: 'https://tzivoshashem.org', icon: '👦' },
  { name: 'JEM Media', url: 'https://jemedia.org', icon: '🎬' },
  { name: 'Sichos in English', url: 'https://sie.org', icon: '📚' },
  { name: 'Chabad Library', url: 'https://chabadlibrary.org', icon: '📖' },
];

export default function NewsPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

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

  const handleLogout = () => { localStorage.clear(); window.location.href = '/auth/login'; };

  if (loading) return <div className="auth-container"><div className="loading"><div className="spinner"></div></div></div>;

  const featuredSources = newsSources.filter(s => s.featured);
  const otherSources = newsSources.filter(s => !s.featured);

  return (
    <>
      <EmergencyBar />
      <Header user={user} onLogout={handleLogout} />
      
      <main className="main">
        <div className="page-header">
          <h1 className="page-title">📰 Community News</h1>
          <p className="page-subtitle">Stay updated with the latest news from our community</p>
        </div>

        {/* Featured News Sources */}
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>⭐ Featured News Sources</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
            {featuredSources.map(source => (
              <a 
                key={source.id}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  background: `linear-gradient(135deg, ${source.color} 0%, ${source.color}dd 100%)`,
                  borderRadius: '16px',
                  padding: '2rem',
                  textDecoration: 'none',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '2.5rem' }}>{source.logo}</span>
                  <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{source.name}</h3>
                </div>
                <p style={{ margin: 0, opacity: 0.9, fontSize: '1rem' }}>{source.description}</p>
                <div style={{ marginTop: '1.5rem', fontSize: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  Visit Site <span>→</span>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Other News Sources */}
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>📰 More News Sources</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {otherSources.map(source => (
              <a 
                key={source.id}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  background: 'white',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  borderLeft: `4px solid ${source.color}`,
                  transition: 'transform 0.2s',
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{source.logo}</span>
                  <h3 style={{ margin: 0, color: source.color, fontSize: '1.1rem' }}>{source.name}</h3>
                </div>
                <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>{source.description}</p>
              </a>
            ))}
          </div>
        </section>

        {/* Quick Links */}
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>🔗 Quick Links</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {quickLinks.map(link => (
              <a 
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'white',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '25px',
                  textDecoration: 'none',
                  color: '#333',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  fontSize: '0.95rem',
                }}
              >
                <span>{link.icon}</span>
                <span>{link.name}</span>
              </a>
            ))}
          </div>
        </section>

        {/* News Tip Section */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div style={{ background: '#fef3c7', borderRadius: '12px', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 0.75rem 0', color: '#92400e' }}>🔔 Have a News Tip?</h3>
            <p style={{ margin: '0 0 1rem 0', color: '#92400e', fontSize: '0.9rem' }}>
              Did something happen in the community? Share your news with local outlets:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              <a href="mailto:news@collive.com" style={{ padding: '0.5rem 1rem', background: '#92400e', color: 'white', borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem' }}>📧 COLlive</a>
              <a href="mailto:news@chabadinfo.com" style={{ padding: '0.5rem 1rem', background: '#92400e', color: 'white', borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem' }}>📧 Chabad.info</a>
            </div>
          </div>

          <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', borderRadius: '12px', padding: '1.5rem', color: 'white' }}>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>🌤️ Crown Heights Weather</h3>
            <p style={{ margin: '0 0 1rem 0', opacity: 0.9, fontSize: '0.9rem' }}>
              Check the current weather in Crown Heights
            </p>
            <a href="https://weather.com/weather/today/l/40.6694,-73.9422" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.2)', color: 'white', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem' }}>
              View Weather →
            </a>
          </div>

          <div style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', borderRadius: '12px', padding: '1.5rem', color: 'white' }}>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>📅 Zmanim</h3>
            <p style={{ margin: '0 0 1rem 0', opacity: 0.9, fontSize: '0.9rem' }}>
              Daily halachic times for Crown Heights
            </p>
            <a href="https://chabad.org/calendar/zmanim.htm" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.2)', color: 'white', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem' }}>
              View Zmanim →
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
