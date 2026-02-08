'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EmergencyBar from '@/components/EmergencyBar';

interface UserInfo { name: string; email: string; role: 'user' | 'admin' | 'superadmin'; }
interface Category { id: string; name: string; icon: string; slug: string; order?: number; }

const partners = [
  { name: 'ShabbatHub', url: 'https://shabbathub.com', logo: '🕯️', desc: 'Shabbat hospitality' },
  { name: 'Ed On The Go', url: 'https://edonthego.org', logo: '📚', desc: 'Jewish education' },
  { name: 'Custom Glass Brooklyn', url: 'https://customglassbrooklyn.com', logo: '🪟', desc: 'Glass services' },
];

const quickAccessItems = [
  { title: 'WhatsApp Groups', icon: '👥', color: '#25D366', href: '/groups', desc: 'All community groups', isStatic: true },
  { title: 'Services', icon: '🔧', color: '#2563eb', href: '/services', desc: 'Local professionals', isStatic: true },
  { title: 'Jobs', icon: '💼', color: '#7c3aed', keywords: ['job', 'business', 'career', 'work'], desc: 'Job listings & career' },
  { title: 'Housing', icon: '🏠', color: '#ea580c', keywords: ['real estate', 'housing', 'apartment', 'rent'], desc: 'Apartments & rooms' },
  { title: 'Buy & Sell', icon: '🛒', color: '#16a34a', keywords: ['buy', 'sell', 'marketplace', 'sale'], desc: 'Marketplace' },
  { title: 'Events', icon: '📅', color: '#dc2626', href: '/events', desc: 'Community events', isStatic: true },
  { title: 'Free / Gemach', icon: '🆓', color: '#0891b2', keywords: ['free', 'gemach', 'chesed', 'volunteer'], desc: 'Free stuff & gemach' },
  { title: 'Rides', icon: '🚗', color: '#4f46e5', keywords: ['ride', 'carpool', 'travel'], desc: 'Carpool & rides' },
  { title: 'News', icon: '📰', color: '#b91c1c', href: '/news', desc: 'Community news', isStatic: true },
];

const addItems = [
  { title: 'Add Group', icon: '👥', color: '#25D366', href: '/add/group', desc: 'WhatsApp, Telegram, FB' },
  { title: 'Add Charity', icon: '💝', color: '#e11d48', href: '/add/charity', desc: 'Fundraising campaign' },
  { title: 'Add Event', icon: '🎉', color: '#f59e0b', href: '/add/event', desc: 'Simcha, Shiur, Farbrengen' },
  { title: 'Add Business', icon: '🏪', color: '#8b5cf6', href: '/add/business', desc: 'Local business listing' },
  { title: 'Host Shabbos', icon: '🕯️', color: '#c9a227', href: '/add/shabbos', desc: 'Invite guests for Shabbat' },
  { title: 'Post News', icon: '📰', color: '#dc2626', href: '/add/news', desc: 'Community announcement' },
];

const categoryGroups = [
  { label: '🏘️ Community & Living', color: '#1e3a5f', keywords: ['jewish community', 'torah', 'chesed', 'volunteering', 'singles', 'shidduch', 'women', 'men', 'minyan', 'shuls', 'mitzvah'] },
  { label: '💰 Business & Jobs', color: '#16a34a', keywords: ['jobs', 'business', 'service'] },
  { label: '🏠 Housing & Real Estate', color: '#ea580c', keywords: ['real estate', 'long-term', 'short-term', 'parking'] },
  { label: '🛒 Buy, Sell & Free', color: '#7c3aed', keywords: ['buy', 'sell', 'free', 'giveaway', 'shmira', 'free food'] },
  { label: '🎉 Events & Entertainment', color: '#dc2626', keywords: ['events', 'humor', 'fun', 'music', 'entertainment', 'sports'] },
  { label: '📚 Education & Family', color: '#0891b2', keywords: ['kids', 'education', 'babysitting'] },
  { label: '🚗 Transport & Travel', color: '#4f46e5', keywords: ['car', 'rides', 'carpool', 'travel'] },
  { label: '📰 News & Tech', color: '#b91c1c', keywords: ['news', 'tech', 'gadgets'] },
  { label: '🏡 Lifestyle', color: '#059669', keywords: ['health', 'wellness', 'food', 'recipes', 'home', 'garden', 'fashion', 'beauty', 'pets'] },
  { label: '📋 Other', color: '#6b7280', keywords: ['other'] },
];

const SUPERADMIN_EMAIL = 'chevrutah24x7@gmail.com';

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [stats, setStats] = useState({ groups: 0, services: 0, users: 0, businesses: 0 });
  const [categories, setCategories] = useState<Category[]>([]);
  const [jewishDate, setJewishDate] = useState<string>('');
  const [parsha, setParsha] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const isSuperAdmin = user?.email === SUPERADMIN_EMAIL;

  const toggleSection = (label: string) => {
    setExpandedSections(prev => 
      prev.includes(label) ? prev.filter(s => s !== label) : [...prev, label]
    );
  };

  const getCategoriesForSection = (section: typeof categoryGroups[0]) => {
    return categories.filter(cat => {
      const catName = cat.name.toLowerCase();
      const catSlug = cat.slug?.toLowerCase() || '';
      return section.keywords.some(keyword => 
        catName.includes(keyword.toLowerCase()) || catSlug.includes(keyword.toLowerCase())
      );
    }).sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  const getUncategorized = () => {
    const allGrouped = new Set<string>();
    categoryGroups.forEach(section => {
      getCategoriesForSection(section).forEach(cat => allGrouped.add(cat.id));
    });
    return categories.filter(cat => !allGrouped.has(cat.id));
  };

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
        const [groupsRes, servicesRes, usersRes, catsRes, bizRes] = await Promise.all([
          fetch('/api/admin/groups'),
          fetch('/api/admin/services'),
          fetch('/api/admin/users'),
          fetch('/api/admin/group-categories'),
          fetch('/api/business')
        ]);
        const groups = await groupsRes.json();
        const services = await servicesRes.json();
        const users = await usersRes.json();
        const cats = await catsRes.json();
        const businesses = await bizRes.json();
        
        const approvedGroups = Array.isArray(groups) ? groups.filter((g: any) => g.status === 'approved') : [];
        setStats({
          groups: approvedGroups.length,
          services: Array.isArray(services) ? services.length : 0,
          users: Array.isArray(users) ? users.length : 0,
          businesses: Array.isArray(businesses) ? businesses.length : 0
        });
        
        if (Array.isArray(cats)) setCategories(cats);
      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

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

  const getCategoryLink = (item: typeof quickAccessItems[0]): string => {
    if (item.isStatic && item.href) return item.href;
    if (!item.keywords) return '/groups';
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
                  <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>📖 This Shabbos</div>
                  <div style={{ fontWeight: 'bold' }}>{parsha}</div>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.75rem 1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.3)' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.groups}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>👥 Groups</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.75rem 1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.3)' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.services}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>🔧 Services</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.75rem 1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.3)' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.businesses}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>🏪 Businesses</div>
            </div>
            {isSuperAdmin && (
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.75rem 1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.3)' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.users}</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>👑 Members</div>
              </div>
            )}
          </div>
        </div>
      </section>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>

        {/* 🎰 LOTTERY POOL BANNER */}
        <section style={{ marginBottom: '2.5rem' }}>
          <Link href="/lottery" style={{ textDecoration: 'none', display: 'block' }}>
            <div style={{
              background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)',
              borderRadius: '20px',
              padding: '1.5rem 2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              border: '2px solid rgba(255, 215, 0, 0.3)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '2.5rem' }}>🎰</div>
                <div>
                  <h3 style={{ 
                    color: '#ffd700', 
                    margin: '0 0 0.25rem 0', 
                    fontSize: '1.25rem',
                    fontWeight: 'bold'
                  }}>
                    Community Lottery Pool
                  </h3>
                  <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>
                    Mega Millions + Powerball • Only $3/week • Win Together!
                  </p>
                </div>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #ffd700, #f59e0b)',
                color: '#1e3a5f',
                padding: '0.75rem 1.5rem',
                borderRadius: '25px',
                fontWeight: 'bold',
                fontSize: '1rem',
                whiteSpace: 'nowrap'
              }}>
                Join Now →
              </div>
            </div>
          </Link>
        </section>
        
        {/* ADD SECTION */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', textAlign: 'center', color: '#1e3a5f' }}>
            ➕ Share With The Community
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
            {addItems.map(item => (
              <Link 
                key={item.title} 
                href={item.href}
                style={{ 
                  textDecoration: 'none',
                  display: 'block',
                  background: item.color + '15',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  border: '2px solid ' + item.color + '40',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{item.icon}</div>
                <h3 style={{ color: item.color, margin: '0 0 0.25rem 0', fontSize: '0.95rem', fontWeight: 'bold' }}>{item.title}</h3>
                <p style={{ color: '#666', margin: 0, fontSize: '0.75rem' }}>{item.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Quick Access Grid */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', textAlign: 'center' }}>🔍 Explore Our Community</h2>
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

        {/* All Categories - Collapsible Dropdowns */}
        {categories.length > 0 && (
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>📁 All Group Categories</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {categoryGroups.map(section => {
                const sectionCats = getCategoriesForSection(section);
                if (sectionCats.length === 0) return null;
                const isExpanded = expandedSections.includes(section.label);
                
                return (
                  <div key={section.label} style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                    <button
                      onClick={() => toggleSection(section.label)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.875rem 1.25rem',
                        background: isExpanded ? section.color + '10' : 'white',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: section.color,
                        transition: 'background 0.2s',
                      }}
                    >
                      <span>{section.label}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ 
                          background: section.color + '20', 
                          color: section.color, 
                          padding: '2px 10px', 
                          borderRadius: '12px', 
                          fontSize: '0.8rem',
                          fontWeight: 'bold'
                        }}>
                          {sectionCats.length}
                        </span>
                        <span style={{ 
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', 
                          transition: 'transform 0.2s',
                          fontSize: '0.8rem'
                        }}>
                          ▼
                        </span>
                      </span>
                    </button>
                    
                    {isExpanded && (
                      <div style={{ 
                        padding: '0.75rem 1.25rem', 
                        background: '#fafafa',
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: '0.5rem',
                        borderTop: '1px solid #e5e7eb'
                      }}>
                        {sectionCats.map(cat => (
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
                              gap: '0.5rem',
                              transition: 'box-shadow 0.2s, transform 0.2s',
                            }}
                          >
                            <span>{cat.icon}</span>
                            <span>{cat.name}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              
              {/* Uncategorized items */}
              {getUncategorized().length > 0 && (() => {
                const uncats = getUncategorized();
                const isExpanded = expandedSections.includes('__uncategorized__');
                return (
                  <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                    <button
                      onClick={() => toggleSection('__uncategorized__')}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.875rem 1.25rem',
                        background: isExpanded ? '#6b728010' : 'white',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: '#6b7280',
                        transition: 'background 0.2s',
                      }}
                    >
                      <span>📋 More Categories</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ background: '#6b728020', color: '#6b7280', padding: '2px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>{uncats.length}</span>
                        <span style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', fontSize: '0.8rem' }}>▼</span>
                      </span>
                    </button>
                    {isExpanded && (
                      <div style={{ padding: '0.75rem 1.25rem', background: '#fafafa', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', borderTop: '1px solid #e5e7eb' }}>
                        {uncats.map(cat => (
                          <Link key={cat.id} href={'/groups?category=' + cat.slug} style={{ padding: '0.5rem 1rem', background: 'white', borderRadius: '20px', textDecoration: 'none', color: '#333', fontSize: '0.9rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>{cat.icon}</span>
                            <span>{cat.name}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </section>
        )}

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
            </div>
          </a>
          <a href="https://www.chabad.org/calendar/zmanim.htm" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <div style={{ background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)', borderRadius: '12px', padding: '1.25rem', color: 'white', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🕐</div>
              <div style={{ fontWeight: 'bold' }}>Zmanim</div>
            </div>
          </a>
          <a href="https://www.chabad.org/dailystudy" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <div style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', borderRadius: '12px', padding: '1.25rem', color: 'white', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📚</div>
              <div style={{ fontWeight: 'bold' }}>Daily Study</div>
            </div>
          </a>
          <Link href="/news" style={{ textDecoration: 'none' }}>
            <div style={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', borderRadius: '12px', padding: '1.25rem', color: 'white', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📰</div>
              <div style={{ fontWeight: 'bold' }}>News</div>
            </div>
          </Link>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
