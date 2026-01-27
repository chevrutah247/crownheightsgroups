'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EmergencyBar from '@/components/EmergencyBar';

interface UserInfo { name: string; email: string; role: 'user' | 'admin'; }
interface Stats { groups: number; services: number; users: number; }

const mainSections = [
  { id: 'groups', title: 'WhatsApp Groups', titleRu: 'WhatsApp группы', icon: '👥', color: '#25D366', href: '/groups', desc: 'Find and join community groups' },
  { id: 'services', title: 'Services', titleRu: 'Услуги', icon: '🔧', color: '#2563eb', href: '/services', desc: 'Find local professionals' },
  { id: 'jobs', title: 'Jobs', titleRu: 'Работа', icon: '💼', color: '#7c3aed', href: '/jobs', desc: 'Job listings & resumes', comingSoon: true },
  { id: 'housing', title: 'Housing', titleRu: 'Жильё', icon: '🏠', color: '#ea580c', href: '/housing', desc: 'Apartments & rooms for rent', comingSoon: true },
  { id: 'classifieds', title: 'Buy & Sell', titleRu: 'Купля-продажа', icon: '🛒', color: '#16a34a', href: '/classifieds', desc: 'Classifieds & marketplace', comingSoon: true },
  { id: 'events', title: 'Events', titleRu: 'События', icon: '📅', color: '#dc2626', href: '/events', desc: 'Community events & shiurim', comingSoon: true },
  { id: 'free', title: 'Free Items', titleRu: 'Бесплатно', icon: '🆓', color: '#0891b2', href: '/free', desc: 'Free stuff & gemach', comingSoon: true },
  { id: 'rides', title: 'Rides', titleRu: 'Поездки', icon: '🚗', color: '#4f46e5', href: '/rides', desc: 'Carpool & ride sharing', comingSoon: true },
];

const quickLinks = [
  { title: 'Lost & Found', icon: '🔍', href: '/lost-found', comingSoon: true },
  { title: 'Kosher Restaurants', icon: '🍽️', href: '/restaurants', comingSoon: true },
  { title: 'Minyan Times', icon: '🕐', href: '/minyanim', comingSoon: true },
  { title: 'Deals & Coupons', icon: '💰', href: '/deals', comingSoon: true },
];

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [stats, setStats] = useState<Stats>({ groups: 0, services: 0, users: 0 });
  const [recentGroups, setRecentGroups] = useState<any[]>([]);
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
        const [groupsRes, servicesRes, usersRes] = await Promise.all([
          fetch('/api/admin/groups'),
          fetch('/api/admin/services'),
          fetch('/api/admin/users')
        ]);
        const groups = await groupsRes.json();
        const services = await servicesRes.json();
        const users = await usersRes.json();
        
        const approvedGroups = Array.isArray(groups) ? groups.filter((g: any) => g.status === 'approved') : [];
        setStats({
          groups: approvedGroups.length,
          services: Array.isArray(services) ? services.length : 0,
          users: Array.isArray(users) ? users.length : 0
        });
        setRecentGroups(approvedGroups.slice(0, 4));
      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleLogout = () => { localStorage.clear(); window.location.href = '/auth/login'; };

  if (isAuthenticated === null || loading) return <div className="auth-container"><div className="loading"><div className="spinner"></div></div></div>;

  return (
    <>
      <EmergencyBar />
      <Header user={user} onLogout={handleLogout} />
      
      {/* Hero Section */}
      <section style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)', color: 'white', padding: '3rem 1rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: 'bold' }}>
            🏠 Crown Heights Community Hub
          </h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9, marginBottom: '2rem' }}>
            Your one-stop resource for everything in the community
          </p>
          
          {/* Stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem 2rem', borderRadius: '12px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.groups}</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>WhatsApp Groups</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem 2rem', borderRadius: '12px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.services}</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Services</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem 2rem', borderRadius: '12px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.users}</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Members</div>
            </div>
          </div>
        </div>
      </section>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        
        {/* Main Sections Grid */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>Explore Our Community</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
            {mainSections.map(section => (
              <Link 
                key={section.id} 
                href={section.comingSoon ? '#' : section.href}
                style={{ 
                  textDecoration: 'none',
                  position: 'relative',
                  display: 'block',
                  background: 'white',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  border: `3px solid ${section.color}20`,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: section.comingSoon ? 'default' : 'pointer',
                  opacity: section.comingSoon ? 0.7 : 1,
                }}
                onClick={e => section.comingSoon && e.preventDefault()}
                onMouseOver={e => !section.comingSoon && (e.currentTarget.style.transform = 'translateY(-4px)')}
                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {section.comingSoon && (
                  <span style={{ position: 'absolute', top: '10px', right: '10px', background: '#f59e0b', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>COMING SOON</span>
                )}
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{section.icon}</div>
                <h3 style={{ color: section.color, margin: '0 0 0.25rem 0', fontSize: '1.25rem' }}>{section.title}</h3>
                <p style={{ color: '#666', margin: 0, fontSize: '0.9rem' }}>{section.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Quick Links */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Quick Links</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {quickLinks.map(link => (
              <Link 
                key={link.title} 
                href={link.comingSoon ? '#' : link.href}
                onClick={e => link.comingSoon && e.preventDefault()}
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
                  opacity: link.comingSoon ? 0.6 : 1,
                }}
              >
                <span>{link.icon}</span>
                <span>{link.title}</span>
                {link.comingSoon && <span style={{ fontSize: '0.7rem', color: '#f59e0b' }}>Soon</span>}
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Groups Preview */}
        {recentGroups.length > 0 && (
          <section style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Recent WhatsApp Groups</h2>
              <Link href="/groups" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '500' }}>View All →</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {recentGroups.map(group => {
                const links = group.whatsappLinks || [group.whatsappLink].filter(Boolean);
                return (
                  <div key={group.id} style={{ background: 'white', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>{group.title}</h4>
                    <p style={{ color: '#666', fontSize: '0.85rem', margin: '0 0 1rem 0', lineHeight: 1.4 }}>{group.description?.slice(0, 100)}{group.description?.length > 100 ? '...' : ''}</p>
                    {links[0] && (
                      <a href={links[0]} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#25D366', color: 'white', borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 'bold' }}>
                        Join Group
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', borderRadius: '16px', padding: '2rem', textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 0.5rem 0' }}>Want to contribute?</h2>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>Help grow our community by adding groups, services, or businesses</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/suggest" style={{ padding: '0.75rem 1.5rem', background: '#2563eb', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
              ➕ Suggest a Service
            </Link>
            <Link href="/contact" style={{ padding: '0.75rem 1.5rem', background: 'white', color: '#2563eb', border: '2px solid #2563eb', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
              📧 Contact Us
            </Link>
          </div>
        </section>
      </main>
      
      <Footer />
    </>
  );
}
