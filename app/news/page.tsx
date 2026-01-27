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
    logo: '📰',
    description: 'Crown Heights News, Community Updates & Events',
    color: '#1a365d'
  },
  { 
    id: 'chabadinfo', 
    name: 'Chabad.info', 
    url: 'https://chabadinfo.com/', 
    logo: '📰',
    description: 'Chabad Lubavitch News & Information',
    color: '#2d3748'
  },
  { 
    id: 'crownheightsinfo', 
    name: 'CrownHeights.info', 
    url: 'https://crownheights.info/', 
    logo: '📰',
    description: 'Crown Heights Community News',
    color: '#744210'
  },
  { 
    id: 'shmais', 
    name: 'Shmais.com', 
    url: 'https://shmais.com/', 
    logo: '📰',
    description: 'Jewish News Network',
    color: '#22543d'
  },
  { 
    id: 'lubavitch', 
    name: 'Lubavitch.com', 
    url: 'https://lubavitch.com/', 
    logo: '📰',
    description: 'Official Chabad-Lubavitch News',
    color: '#553c9a'
  },
  { 
    id: 'chabad', 
    name: 'Chabad.org', 
    url: 'https://chabad.org/news', 
    logo: '📰',
    description: 'Jewish News & Torah Classes',
    color: '#2b6cb0'
  },
];

const socialMedia = [
  { name: 'COLlive Instagram', url: 'https://instagram.com/collaborativelive', icon: '📷' },
  { name: 'Chabad.info Telegram', url: 'https://t.me/chabadinfo', icon: '✈️' },
  { name: 'Crown Heights WhatsApp', url: 'https://crownheightsgroups.com/groups', icon: '💬' },
];

export default function NewsPage() {
  const [user, setUser] = useState<UserInfo | null>(null);

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
    };
    checkAuth();
  }, []);

  const handleLogout = () => { localStorage.clear(); window.location.href = '/auth/login'; };

  return (
    <>
      <EmergencyBar />
      <Header user={user} onLogout={handleLogout} />
      
      <main className="main">
        <div className="page-header">
          <h1 className="page-title">📰 Community News</h1>
          <p className="page-subtitle">Stay updated with the latest news from our community</p>
        </div>

        {/* Main News Sources */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>News Sources</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {newsSources.map(source => (
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
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '2rem' }}>{source.logo}</span>
                  <h3 style={{ margin: 0, color: source.color, fontSize: '1.25rem' }}>{source.name}</h3>
                </div>
                <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>{source.description}</p>
                <div style={{ marginTop: '1rem', color: source.color, fontSize: '0.9rem', fontWeight: 'bold' }}>
                  Visit Site →
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Social Media */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Follow on Social Media</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {socialMedia.map(social => (
              <a 
                key={social.name}
                href={social.url}
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
                }}
              >
                <span>{social.icon}</span>
                <span>{social.name}</span>
              </a>
            ))}
          </div>
        </section>

        {/* Breaking News Tip */}
        <section style={{ background: '#fef3c7', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#92400e' }}>🔔 Have a News Tip?</h3>
          <p style={{ margin: '0 0 1rem 0', color: '#92400e' }}>
            Did something happen in the community? Share your news tip with local outlets:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <a href="mailto:news@collive.com" style={{ padding: '0.5rem 1rem', background: '#92400e', color: 'white', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem' }}>📧 COLlive</a>
            <a href="mailto:news@chabadinfo.com" style={{ padding: '0.5rem 1rem', background: '#92400e', color: 'white', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem' }}>📧 Chabad.info</a>
          </div>
        </section>

        {/* Weather Widget Placeholder */}
        <section style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', padding: '1.5rem', color: 'white', marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>🌤️ Crown Heights Weather</h3>
          <p style={{ margin: 0, opacity: 0.9 }}>
            <a href="https://weather.com/weather/today/l/40.6694,-73.9422" target="_blank" rel="noopener noreferrer" style={{ color: 'white' }}>
              Check current weather →
            </a>
          </p>
        </section>
      </main>

      <Footer />
    </>
  );
}
