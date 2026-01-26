'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EmergencyBar from '@/components/EmergencyBar';
import { categories, locations, bannerConfig, getLocationById, getCategoryById } from '@/lib/data';
import { Group } from '@/lib/types';

interface UserInfo { name: string; email: string; role: 'user' | 'admin'; }

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('1');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'popular' | 'alpha'>('popular');
  const [reportingGroup, setReportingGroup] = useState<string | null>(null);

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
    const fetchGroups = async () => {
      try {
        const res = await fetch('/api/admin/groups');
        const data = await res.json();
        if (Array.isArray(data)) { setAllGroups(data.filter((g: Group) => g.status === 'approved')); }
      } catch (error) { console.error('Error:', error); }
      finally { setLoading(false); }
    };
    fetchGroups();
  }, []);

  useEffect(() => {
    let result = [...allGroups];
    if (selectedLocation) result = result.filter(g => g.locationId === selectedLocation);
    if (selectedCategory) result = result.filter(g => g.categoryId === selectedCategory);
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(g => g.title.toLowerCase().includes(query) || g.description.toLowerCase().includes(query) || g.tags?.some(t => t.toLowerCase().includes(query)));
    }
    const pinnedGroups = result.filter(g => g.isPinned).sort((a, b) => (a.pinnedOrder || 999) - (b.pinnedOrder || 999));
    const regularGroups = result.filter(g => !g.isPinned);
    switch (sortBy) {
      case 'popular': regularGroups.sort((a, b) => b.clicksCount - a.clicksCount); break;
      case 'date': regularGroups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
      case 'alpha': regularGroups.sort((a, b) => a.title.localeCompare(b.title)); break;
    }
    setFilteredGroups([...pinnedGroups, ...regularGroups]);
  }, [allGroups, selectedLocation, selectedCategory, searchQuery, sortBy]);

  const handleLogout = async () => {
    const token = localStorage.getItem('session_token');
    try { await fetch('/api/auth/logout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) }); } catch (e) {}
    localStorage.clear();
    window.location.href = '/auth/login';
  };

  const handleReportGroup = async (groupId: string) => {
    if (!user) return;
    setReportingGroup(groupId);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId, userEmail: user.email, reason: 'Link not working' })
      });
      const data = await res.json();
      if (res.ok) { alert('Thank you for reporting. Our team will review this group.'); }
      else { alert(data.error || 'Error reporting'); }
    } catch (e) { alert('Error reporting'); }
    finally { setReportingGroup(null); }
  };

  if (isAuthenticated === null || loading) return <div className="auth-container"><div className="loading"><div className="spinner"></div></div></div>;

  return (
    <>
      <EmergencyBar />
      <Header user={user} onLogout={handleLogout} />
      {bannerConfig.enabled && <div className="banner active"><strong>{bannerConfig.title}</strong> {bannerConfig.text}</div>}
      
      <main className="main">
        <div className="page-header">
          <h1 className="page-title">WhatsApp Groups Directory</h1>
          <p className="page-subtitle">Find and join community groups in Crown Heights and beyond</p>
        </div>

        {/* Search */}
        <div style={{ marginBottom: '1.5rem' }}>
          <input type="text" placeholder="🔍 Search groups..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #ddd', fontSize: '1rem', boxSizing: 'border-box' }} />
        </div>

        {/* Location Pills */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#666' }}>📍 Location</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {locations.filter(l => l.status === 'approved').map(loc => (
              <button key={loc.id} onClick={() => setSelectedLocation(loc.id === selectedLocation ? '' : loc.id)} style={{ padding: '0.5rem 1rem', borderRadius: '20px', border: 'none', background: selectedLocation === loc.id ? '#2563eb' : '#e5e7eb', color: selectedLocation === loc.id ? 'white' : '#333', cursor: 'pointer', fontWeight: selectedLocation === loc.id ? 'bold' : 'normal' }}>{loc.neighborhood}</button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#666' }}>📁 Category</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <button onClick={() => setSelectedCategory('')} style={{ padding: '0.5rem 1rem', borderRadius: '20px', border: 'none', background: !selectedCategory ? '#2563eb' : '#e5e7eb', color: !selectedCategory ? 'white' : '#333', cursor: 'pointer', fontWeight: !selectedCategory ? 'bold' : 'normal' }}>All</button>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setSelectedCategory(cat.id === selectedCategory ? '' : cat.id)} style={{ padding: '0.5rem 1rem', borderRadius: '20px', border: 'none', background: selectedCategory === cat.id ? '#2563eb' : '#e5e7eb', color: selectedCategory === cat.id ? 'white' : '#333', cursor: 'pointer', fontWeight: selectedCategory === cat.id ? 'bold' : 'normal' }}>{cat.icon} {cat.name}</button>
            ))}
          </div>
        </div>

        {/* Sort & Count */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span style={{ color: '#666' }}>{filteredGroups.length} group{filteredGroups.length !== 1 ? 's' : ''}</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['popular', 'date', 'alpha'].map(s => (
              <button key={s} onClick={() => setSortBy(s as any)} style={{ padding: '0.25rem 0.75rem', borderRadius: '4px', border: 'none', background: sortBy === s ? '#2563eb' : '#e5e7eb', color: sortBy === s ? 'white' : '#333', cursor: 'pointer', fontSize: '0.85rem' }}>
                {s === 'popular' ? '🔥 Popular' : s === 'date' ? '🕐 Recent' : '🔤 A-Z'}
              </button>
            ))}
          </div>
        </div>

        {/* Groups */}
        {filteredGroups.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {filteredGroups.map(group => {
              const category = getCategoryById(group.categoryId);
              const location = getLocationById(group.locationId);
              const links = (group as any).whatsappLinks || [(group as any).whatsappLink].filter(Boolean);
              return (
                <div key={group.id} style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: group.isPinned ? '2px solid #f59e0b' : '1px solid #eee' }}>
                  {group.isPinned && <div style={{ color: '#f59e0b', fontSize: '0.8rem', marginBottom: '0.5rem' }}>⭐ Featured</div>}
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ padding: '2px 8px', background: '#eff6ff', borderRadius: '4px', fontSize: '0.8rem' }}>{category?.icon} {category?.name}</span>
                    {group.language && group.language !== 'English' && <span style={{ padding: '2px 8px', background: '#fef3c7', borderRadius: '4px', fontSize: '0.8rem' }}>{group.language}</span>}
                  </div>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{group.title}</h3>
                  <p style={{ color: '#666', fontSize: '0.9rem', margin: '0 0 1rem 0' }}>{group.description}</p>
                  
                  {/* WhatsApp Links */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                    {links.map((link: string, i: number) => (
                      <a key={i} href={link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', background: '#25D366', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        {links.length > 1 ? `Join Group ${i + 1}` : 'Join Group'}
                      </a>
                    ))}
                  </div>

                  {/* Report Button */}
                  <button onClick={() => handleReportGroup(group.id)} disabled={reportingGroup === group.id} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ef4444', borderRadius: '8px', background: 'white', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem' }}>
                    {reportingGroup === group.id ? 'Reporting...' : '⚠️ Report - Link Not Working'}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
            <h3>No groups found</h3>
            <p>Try adjusting your filters</p>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
