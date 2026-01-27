'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EmergencyBar from '@/components/EmergencyBar';

interface UserInfo { name: string; email: string; role: 'user' | 'admin'; }
interface Category { id: string; name: string; icon: string; slug: string; }
interface Location { id: string; neighborhood: string; }
interface Group { 
  id: string; title: string; description: string; categoryId: string; locationId: string; 
  language: string; status: string; clicksCount: number; isPinned?: boolean;
  whatsappLinks?: string[]; whatsappLink?: string;
  telegramLink?: string; facebookLink?: string; twitterLink?: string; websiteLink?: string;
}

export default function GroupDetailClient({ groupId }: { groupId: string }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('session_token');
      if (!token) { window.location.href = '/auth/login'; return; }
      try {
        const response = await fetch('/api/auth/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) });
        const data = await response.json();
        if (data.valid) setUser({ name: data.user.name, email: data.user.email, role: data.user.role });
        else { localStorage.clear(); window.location.href = '/auth/login'; }
      } catch (error) { window.location.href = '/auth/login'; }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [groupsRes, catsRes, locsRes] = await Promise.all([
          fetch('/api/admin/groups'),
          fetch('/api/admin/group-categories'),
          fetch('/api/admin/locations')
        ]);
        const [groupsData, catsData, locsData] = await Promise.all([groupsRes.json(), catsRes.json(), locsRes.json()]);
        
        if (Array.isArray(groupsData)) {
          const found = groupsData.find((g: Group) => g.id === groupId);
          if (found) setGroup(found);
        }
        if (Array.isArray(catsData)) setCategories(catsData);
        if (Array.isArray(locsData)) setLocations(locsData);
      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [groupId]);

  const handleLogout = () => { localStorage.clear(); window.location.href = '/auth/login'; };

  const getWhatsAppLinks = (g: Group): string[] => {
    const links: string[] = [];
    if (g.whatsappLinks && Array.isArray(g.whatsappLinks)) {
      g.whatsappLinks.forEach(l => { if (l && typeof l === 'string') links.push(l); });
    } else if (g.whatsappLink && typeof g.whatsappLink === 'string') {
      links.push(g.whatsappLink);
    }
    return links;
  };

  // Share - only website link
  const handleShare = async () => {
    const url = window.location.href;
    const text = group?.title + ' - Crown Heights Groups';
    
    if (navigator.share) {
      try {
        await navigator.share({ title: text, url: url });
      } catch (e) {
        await navigator.clipboard.writeText(url);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
    } else {
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  // Copy - full info with all links
  const handleCopy = async () => {
    if (!group) return;
    const cat = categories.find(c => c.id === group.categoryId);
    const loc = locations.find(l => l.id === group.locationId);
    const waLinks = getWhatsAppLinks(group);
    
    let text = '📢 ' + group.title + '\n';
    text += cat ? cat.icon + ' ' + cat.name : '';
    text += loc ? ' | 📍 ' + loc.neighborhood : '';
    text += '\n\n';
    if (group.description) text += group.description + '\n\n';
    
    if (waLinks.length) text += '💬 WhatsApp:\n' + waLinks.join('\n') + '\n\n';
    if (group.telegramLink) text += '✈️ Telegram: ' + group.telegramLink + '\n';
    if (group.facebookLink) text += '📘 Facebook: ' + group.facebookLink + '\n';
    if (group.twitterLink) text += '𝕏 Twitter: ' + group.twitterLink + '\n';
    if (group.websiteLink) text += '🌐 Website: ' + group.websiteLink + '\n';
    
    text += '\n🔗 View on Crown Heights Groups:\n' + window.location.href;
    
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCat = (id: string) => categories.find(c => c.id === id);
  const getLoc = (id: string) => locations.find(l => l.id === id);

  if (loading) return <div className="auth-container"><div className="loading"><div className="spinner"></div></div></div>;

  if (!group) {
    return (
      <div>
        <EmergencyBar />
        <Header user={user} onLogout={handleLogout} />
        <main className="main" style={{ textAlign: 'center', padding: '3rem' }}>
          <h1>Group not found</h1>
          <Link href="/groups" style={{ color: '#2563eb' }}>← Back to all groups</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const cat = getCat(group.categoryId);
  const loc = getLoc(group.locationId);
  const waLinks = getWhatsAppLinks(group);

  return (
    <div>
      <EmergencyBar />
      <Header user={user} onLogout={handleLogout} />
      
      <main className="main">
        <Link href="/groups" style={{ color: '#2563eb', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          ← Back to groups
        </Link>

        <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', maxWidth: '600px' }}>
          {group.isPinned && <div style={{ color: '#f59e0b', fontSize: '0.9rem', marginBottom: '0.75rem' }}>⭐ Featured Group</div>}
          
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span style={{ padding: '4px 12px', background: '#eff6ff', borderRadius: '20px', fontSize: '0.9rem' }}>{cat?.icon} {cat?.name}</span>
            {loc && <span style={{ padding: '4px 12px', background: '#f0fdf4', borderRadius: '20px', fontSize: '0.9rem' }}>📍 {loc.neighborhood}</span>}
            {group.language && group.language !== 'English' && <span style={{ padding: '4px 12px', background: '#fef3c7', borderRadius: '20px', fontSize: '0.9rem' }}>{group.language}</span>}
          </div>

          <h1 style={{ margin: '0 0 0.75rem 0', fontSize: '1.75rem', color: '#1e3a5f' }}>{group.title}</h1>
          
          {group.description && (
            <p style={{ color: '#666', fontSize: '1rem', lineHeight: '1.6', margin: '0 0 1.5rem 0' }}>{group.description}</p>
          )}

          {/* Join Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {waLinks.map((link, i) => (
              <a key={i} href={link} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '1rem', background: '#25D366', color: 'white', borderRadius: '12px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem' }}>
                💬 Join WhatsApp {waLinks.length > 1 ? (i + 1) : ''}
              </a>
            ))}
            {group.telegramLink && (
              <a href={group.telegramLink} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '1rem', background: '#0088cc', color: 'white', borderRadius: '12px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem' }}>
                ✈️ Join Telegram
              </a>
            )}
            {group.facebookLink && (
              <a href={group.facebookLink} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '1rem', background: '#1877f2', color: 'white', borderRadius: '12px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem' }}>
                📘 Join Facebook
              </a>
            )}
            {group.twitterLink && (
              <a href={group.twitterLink} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '1rem', background: '#000000', color: 'white', borderRadius: '12px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem' }}>
                𝕏 Follow on X
              </a>
            )}
            {group.websiteLink && (
              <a href={group.websiteLink} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '1rem', background: '#6366f1', color: 'white', borderRadius: '12px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem' }}>
                🌐 Visit Website
              </a>
            )}
          </div>

          {/* Share & Copy Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              onClick={handleShare} 
              style={{ 
                flex: 1, 
                padding: '0.75rem', 
                border: '2px solid #2563eb', 
                borderRadius: '12px', 
                background: shared ? '#2563eb' : 'white', 
                color: shared ? 'white' : '#2563eb', 
                cursor: 'pointer', 
                fontWeight: 'bold',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {shared ? '✓ Link Copied!' : '🔗 Share Link'}
            </button>
            <button 
              onClick={handleCopy} 
              style={{ 
                flex: 1, 
                padding: '0.75rem', 
                border: '2px solid #10b981', 
                borderRadius: '12px', 
                background: copied ? '#10b981' : 'white', 
                color: copied ? 'white' : '#10b981', 
                cursor: 'pointer', 
                fontWeight: 'bold',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {copied ? '✓ Copied!' : '📋 Copy All Info'}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
