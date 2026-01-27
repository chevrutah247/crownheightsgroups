'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EmergencyBar from '@/components/EmergencyBar';

interface UserInfo { name: string; email: string; role: 'user' | 'admin'; }
interface Category { id: string; name: string; icon: string; slug: string; order?: number; }

const partners = [
  { name: 'ShabbatHub', url: 'https://shabbathub.com', logo: '🕯️', desc: 'Shabbat hospitality' },
  { name: 'Ed On The Go', url: 'https://edonthego.org', logo: '📚', desc: 'Jewish education' },
  { name: 'Custom Glass Brooklyn', url: 'https://customglassbrooklyn.com', logo: '🪟', desc: 'Glass services' },
];

// Map display names to category slugs - will be updated dynamically
const quickAccessItems = [
  { title: 'WhatsApp Groups', icon: '👥', color: '#25D366', href: '/groups', desc: 'All community groups', isStatic: true },
  { title: 'Services', icon: '🔧', color: '#2563eb', href: '/services', desc: 'Local professionals', isStatic: true },
  { title: 'Jobs', icon: '💼', color: '#7c3aed', keywords: ['job', 'business', 'career', 'work'], desc: 'Job listings & career' },
  { title: 'Housing', icon: '🏠', color: '#ea580c', keywords: ['real estate', 'housing', 'apartment', 'rent'], desc: 'Apartments & rooms' },
  { title: 'Buy & Sell', icon: '🛒', color: '#16a34a', keywords: ['buy', 'sell', 'marketplace', 'sale'], desc: 'Marketplace' },
  { title: 'Events', icon: '📅', color: '#dc2626', keywords: ['event', 'shiur', 'class'], desc: 'Community events' },
  { title: 'Free / Gemach', icon: '🆓', color: '#0891b2', keywords: ['free', 'gemach', 'chesed', 'volunteer'], desc: 'Free stuff & gemach' },
  { title: 'Rides', icon: '🚗', color: '#4f46e5', keywords: ['ride', 'carpool', 'travel'], desc: 'Carpool & rides' },
  { title: 'News', icon: '📰', color: '#b91c1c', href: '/news', desc: 'Community news', isStatic: true },
];

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [stats, setStats] = useState({ groups: 0, services: 0, users: 0 });
  const [categories, setCategories] = useState<Category[]>([]);
  const [jewishDate, setJewishDate] = useState<string>('');
  const [parsha, setParsha] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('session_token');
      if (!token) { window.location.href = '/auth/login'; return; }
      try {
        const response = await fetch('/api/auth/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) });
        const data = await response.json();
        if (data.valid) { setIsAuthenticated(true); setUser({ name: data.user.name, email: data.user.email, role: data.user.role }); }
        else { localStorage.clear(); window.location.href = '/auth/login'; }
      } catch (error) { window.location.href = '/auth/login'; }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [groupsRes, servicesRes, usersRes, catsRes] = await Promise.all([
          fetch('/api/admin/groups'),
          fetch('/api/admin/services'),
          fetch('/api/admin/users'),
          fetch('/api/admin/group-categories')
        ]);
        const groups = await groupsRes.json();
        const services = await servicesRes.json();
        const users = await usersRes.json();
        const cats = await catsRes.json();
        
        const approvedGroups = Array.isArray(groups) ? groups.filter((g: any) => g.status === 'approved') : [];
        setStats({
          groups: approvedGroups.length,
          services: Array.isArray(services) ? services.length : 0,
          users: Array.isArray(users) ? users.length : 0
        });
        
        if (Array.isArray(cats)) setCategories(cats);
      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  // Fetch Jewish date and Parsha
  useEffect(() => {
    const fetchJewishInfo = async () => {
      try {
        const today = new Date();
        const dateRes = await fetch('https://www.hebcal.com/converter?cfg=json&gy=' + today.getFullYear() + '&gm=' + (today.getMonth() + 1) + '&gd=' + today.getDate() + '&g2h=1');
        const dateData = await dateRes.json();
        if (dateData.hebrew) setJewishDate(dateData.hebrew);
        
        const parshaRes = await fetch('https://www.hebcal.com/shabbat?cfg=json&geonameid=5110302&M=on');
        const parshaData = await parshaRes.json();
        const parshaItem = parshaData.items?.find((item: any) => item.category === 'parashat');
        if (parshaItem) setParsha(parshaItem.title);
      } catch (error) { console.error('Failed to fetch Jewish info:', error); }
    };
    fetchJewishInfo();
  }, []);

  const handleLogout = () => { localStorage.clear(); window.location.href = '/auth/login'; };

  // Find matching category slug for quick access items
  const getCategoryLink = (item: typeof quickAccessItems[0]): string => {
    if (item.isStatic && item.href) return item.href;
    if (!item.keywords) return '/groups';
    
    // Find category that matches any keyword
    for (const keyword of item.keywords) {
      const match = categories.find(c => 
        c.name.toLowerCase().includes(keyword.toLowerCase()) ||
        c.slug.toLowerCase().includes(keyword.toLowerCase())
      );
      if (match) return '/groups?category=' + match.slug;
    }
    return '/groups';
  };

  if (isAuthenticated === null || loading) return <div className="auth-container"><div className="loading"><div className="spinner"></div></div></div>;

  const today = new Date();
  const gregorianDate = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div>
      <EmergencyBar />
      <Header user={user} onLogout={handleLogout} />
      
      {/* Hero Section */}
      <section style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)', color: 'white', padding: '2rem 1rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            🏠 Crown Heights Community Hub
          </h1>
          <p style={{ fontSize: '1rem', opacity: 0.9, marginBottom: '1.5rem' }}>
            Your one-stop resource for everything in the community
          </p>
          
          {/* Jewish Date & Parsha Widget */}
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', display: 'inline-block' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.5rem', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>📅 Today</div>
                <div style={{ fontWeight: 'bold' }}>{gregorianDate}</div>
              </div>
              {jewishDate && (
                <div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>✡️ Hebrew Date</div>
                  <div style={{ fontWeight: 'bold' }}>{jewishDate}</div>
                </div>
              )}
              {parsha && (
                <div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>📖 This Week</div>
                  <div style={{ fontWeight: 'bold' }}>{parsha}</div>
                </div>
              )}
            </div>
            <a href="https://www.chabad.org/calendar" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '0.75rem', fontSize: '0.85rem', color: '#c9a227' }}>
              View Full Calendar on Chabad.org →
            </a>
          </div>
          
          {/* Stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.75rem 1.5rem', borderRadius: '12px' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.groups}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Groups</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.75rem 1.5rem', borderRadius: '12px' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.services}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Services</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.75rem 1.5rem', borderRadius: '12px' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.users}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Members</div>
            </div>
          </div>
        </div>
      </section>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        
        {/* Quick Access Grid */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', textAlign: 'center' }}>Explore Our Community</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
            {quickAccessItems.map(item => (
              <Link 
                key={item.title} 
                href={getCategoryLink(item)}
                style={{ 
                  textDecoration: 'none',
                  display: 'block',
                  background: 'white',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  border: '2px solid ' + item.color + '20',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{item.icon}</div>
                <h3 style={{ color: item.color, margin: '0 0 0.25rem 0', fontSize: '1rem' }}>{item.title}</h3>
                <p style={{ color: '#666', margin: 0, fontSize: '0.8rem' }}>{item.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* All Categories */}
        {categories.length > 0 && (
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>📁 All Group Categories</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {categories.sort((a, b) => (a.order || 0) - (b.order || 0)).map(cat => (
                <Link 
                  key={cat.id}
                  href={'/groups?category=' + cat.slug}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'white',
                    borderRadius: '20px',
                    textDecoration: 'none',
                    color: '#333',
                    fontSize: '0.9rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Quick Actions */}
        <section style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <Link href="/groups" style={{ textDecoration: 'none' }}>
              <div style={{ background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)', borderRadius: '12px', padding: '1.5rem', color: 'white' }}>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>👥 Browse All Groups</h3>
                <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>Find WhatsApp, Telegram & more</p>
              </div>
            </Link>
            <Link href="/services" style={{ textDecoration: 'none' }}>
              <div style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', borderRadius: '12px', padding: '1.5rem', color: 'white' }}>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>🔧 Find Services</h3>
                <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>Local professionals & businesses</p>
              </div>
            </Link>
            <Link href="/suggest" style={{ textDecoration: 'none' }}>
              <div style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', borderRadius: '12px', padding: '1.5rem', color: 'white' }}>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>➕ Add a Listing</h3>
                <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>Submit group or service</p>
              </div>
            </Link>
          </div>
        </section>

        {/* Partners Section */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>🤝 Community Partners</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            {partners.map(partner => (
              <a 
                key={partner.name}
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  background: 'white',
                  borderRadius: '12px',
                  padding: '1rem',
                  textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  transition: 'transform 0.2s',
                }}
              >
                <span style={{ fontSize: '2rem' }}>{partner.logo}</span>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#333' }}>{partner.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>{partner.desc}</div>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Resources Row */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <a href="https://www.chabad.org/parshah" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <div style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', borderRadius: '12px', padding: '1.25rem', color: 'white', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📖</div>
              <div style={{ fontWeight: 'bold' }}>Weekly Parsha</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>on Chabad.org</div>
            </div>
          </a>
          <a href="https://www.chabad.org/calendar/zmanim.htm" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <div style={{ background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)', borderRadius: '12px', padding: '1.25rem', color: 'white', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🕐</div>
              <div style={{ fontWeight: 'bold' }}>Zmanim</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>Daily times</div>
            </div>
          </a>
          <a href="https://www.chabad.org/dailystudy" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <div style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', borderRadius: '12px', padding: '1.25rem', color: 'white', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📚</div>
              <div style={{ fontWeight: 'bold' }}>Daily Study</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>Chitas, Rambam</div>
            </div>
          </a>
          <Link href="/news" style={{ textDecoration: 'none' }}>
            <div style={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', borderRadius: '12px', padding: '1.25rem', color: 'white', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📰</div>
              <div style={{ fontWeight: 'bold' }}>News</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>Community updates</div>
            </div>
          </Link>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
