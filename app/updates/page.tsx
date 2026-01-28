'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { categories } from '@/lib/data';

interface Group {
  id: string;
  title: string;
  description: string;
  whatsappLink?: string;
  whatsappLinks?: string[];
  telegramLink?: string;
  websiteLink?: string;
  categoryId: string;
  locationId: string;
  locationName?: string;
  language?: string;
  createdAt: string;
  clicksCount: number;
}

interface UserInfo {
  name: string;
  email: string;
  role: 'user' | 'admin';
}

type Period = 'today' | 'yesterday' | 'week' | 'month';

export default function UpdatesPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('week');
  const [language, setLanguage] = useState<string>('all');
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(function() {
    var token = localStorage.getItem('session_token');
    if (token) {
      fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token })
      })
      .then(function(r) { return r.json(); })
      .then(function(data) { if (data.valid) setUser(data.user); })
      .catch(function() {});
    }
  }, []);

  useEffect(function() {
    setLoading(true);
    fetch('/api/groups/new?period=' + period)
      .then(function(r) { return r.json(); })
      .then(function(data) { setGroups(data.groups || []); })
      .catch(function() { setGroups([]); })
      .finally(function() { setLoading(false); });
  }, [period]);

  function handleLogout() {
    localStorage.removeItem('session_token');
    setUser(null);
    window.location.href = '/auth/login';
  }

  function getCategoryById(id: string) {
    return categories.find(function(c) { return c.id === id; });
  }

  function formatDate(dateStr: string) {
    var date = new Date(dateStr);
    var now = new Date();
    var diff = now.getTime() - date.getTime();
    var days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return days + ' days ago';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function getMainLink(group: Group) {
    if (group.whatsappLinks && group.whatsappLinks.length > 0) return { url: group.whatsappLinks[0], type: 'whatsapp' };
    if (group.whatsappLink) return { url: group.whatsappLink, type: 'whatsapp' };
    if (group.telegramLink) return { url: group.telegramLink, type: 'telegram' };
    if (group.websiteLink) return { url: group.websiteLink, type: 'website' };
    return null;
  }

  function getLinkStyle(type: string) {
    if (type === 'whatsapp') return { bg: '#25D366', icon: '💬', label: 'WhatsApp' };
    if (type === 'telegram') return { bg: '#0088cc', icon: '✈️', label: 'Telegram' };
    if (type === 'website') return { bg: '#6366f1', icon: '🌐', label: 'Website' };
    return { bg: '#64748b', icon: '🔗', label: 'Link' };
  }

  var periodLabels = { today: '📅 Today', yesterday: '📅 Yesterday', week: '📅 This Week', month: '📅 This Month' };
  var languages = [
    { code: 'all', name: '🌐 All' },
    { code: 'English', name: '🇺🇸 English' },
    { code: 'Russian', name: '🇷🇺 Русский' },
    { code: 'Hebrew', name: '🇮🇱 עברית' },
    { code: 'Yiddish', name: '✡️ אידיש' }
  ];

  var filteredGroups = language === 'all' ? groups : groups.filter(function(g) { 
    return g.language === language || (!g.language && language === 'English'); 
  });

  return (
    <div>
      <Header user={user} onLogout={handleLogout} />
      <main className="main">
        <div className="page-header">
          <h1 className="page-title">📢 Recent Updates</h1>
          <p className="page-subtitle">Recently added groups and resources</p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1rem', padding: '0 1rem' }}>
          {(['today', 'yesterday', 'week', 'month'] as Period[]).map(function(p) {
            return (
              <button key={p} onClick={function() { setPeriod(p); }} style={{ padding: '0.75rem 1.25rem', borderRadius: '25px', border: 'none', background: period === p ? '#2563eb' : '#f1f5f9', color: period === p ? 'white' : '#475569', fontWeight: period === p ? 'bold' : 'normal', cursor: 'pointer' }}>
                {periodLabels[p]}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem', padding: '0 1rem' }}>
          {languages.map(function(lang) {
            return (
              <button key={lang.code} onClick={function() { setLanguage(lang.code); }} style={{ padding: '0.5rem 1rem', borderRadius: '20px', border: 'none', background: language === lang.code ? '#10b981' : '#e5e7eb', color: language === lang.code ? 'white' : '#475569', fontWeight: language === lang.code ? 'bold' : 'normal', cursor: 'pointer', fontSize: '0.85rem' }}>
                {lang.name}
              </button>
            );
          })}
        </div>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#666' }}>
          {loading ? 'Loading...' : 'Found ' + filteredGroups.length + ' groups'}
        </div>

        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner"></div></div>
          ) : filteredGroups.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: '#f8fafc', borderRadius: '12px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
              <h3 style={{ color: '#475569' }}>No groups found</h3>
              <Link href="/suggest" style={{ display: 'inline-block', marginTop: '1rem', padding: '0.75rem 1.5rem', background: '#10b981', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>➕ Suggest a Group</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredGroups.map(function(group) {
                var category = getCategoryById(group.categoryId);
                var link = getMainLink(group);
                var linkStyle = link ? getLinkStyle(link.type) : null;
                return (
                  <div key={group.id} style={{ background: 'white', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>{category?.icon || '📱'}</span>
                        <h3 style={{ margin: 0, color: '#1e3a5f', fontSize: '1.1rem' }}>{group.title}</h3>
                      </div>
                      <span style={{ background: '#dbeafe', color: '#1e40af', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem' }}>{formatDate(group.createdAt)}</span>
                    </div>
                    {group.description && <p style={{ color: '#64748b', margin: '0 0 1rem 0', fontSize: '0.95rem' }}>{group.description.slice(0, 150)}{group.description.length > 150 ? '...' : ''}</p>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ background: '#f1f5f9', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', color: '#475569' }}>📍 {group.locationName || 'Unknown'}</span>
                        <span style={{ background: '#f1f5f9', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', color: '#475569' }}>{category?.name || 'General'}</span>
                        {group.language && group.language !== 'English' && <span style={{ background: '#fef3c7', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', color: '#92400e' }}>{group.language}</span>}
                      </div>
                      {link && linkStyle && <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: linkStyle.bg, color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>{linkStyle.icon} {linkStyle.label}</a>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ maxWidth: '600px', margin: '3rem auto', padding: '2rem', background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)', borderRadius: '16px', textAlign: 'center', color: 'white' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.3rem' }}>📬 Get Weekly Updates</h3>
          <p style={{ margin: '0 0 1.5rem 0', opacity: 0.9 }}>Subscribe to receive new groups in your inbox</p>
          <Link href="/subscribe" style={{ display: 'inline-block', padding: '0.875rem 2rem', background: 'white', color: '#1e3a5f', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>Subscribe Now →</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
