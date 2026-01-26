'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EmergencyBar from '@/components/EmergencyBar';
import { Group } from '@/lib/types';

interface UserInfo { name: string; email: string; role: 'user' | 'admin'; }
interface Category { id: string; name: string; icon: string; order?: number; }
interface Location { id: string; neighborhood: string; status: string; order?: number; }

export default function GroupsPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'popular' | 'alpha'>('popular');
  const [reportingGroup, setReportingGroup] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [newLocation, setNewLocation] = useState({ neighborhood: '', city: '', state: '', country: 'USA' });
  const [submittingLocation, setSubmittingLocation] = useState(false);

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
        if (Array.isArray(groupsData)) setAllGroups(groupsData.filter((g: Group) => g.status === 'approved'));
        if (Array.isArray(catsData)) setCategories(catsData);
        if (Array.isArray(locsData)) setLocations(locsData.filter((l: Location) => l.status === 'approved'));
      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let result = [...allGroups];
    if (selectedLocation) result = result.filter(g => g.locationId === selectedLocation);
    if (selectedCategory) result = result.filter(g => g.categoryId === selectedCategory);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(g => g.title.toLowerCase().includes(q) || g.description.toLowerCase().includes(q));
    }
    const pinned = result.filter(g => g.isPinned).sort((a, b) => (a.pinnedOrder || 999) - (b.pinnedOrder || 999));
    const regular = result.filter(g => !g.isPinned);
    if (sortBy === 'popular') regular.sort((a, b) => b.clicksCount - a.clicksCount);
    else if (sortBy === 'date') regular.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    else regular.sort((a, b) => a.title.localeCompare(b.title));
    setFilteredGroups([...pinned, ...regular]);
  }, [allGroups, selectedLocation, selectedCategory, searchQuery, sortBy]);

  const handleLogout = () => { localStorage.clear(); window.location.href = '/auth/login'; };
  const handleReport = async (groupId: string) => {
    if (!user) return;
    setReportingGroup(groupId);
    try {
      const res = await fetch('/api/reports', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ groupId, userEmail: user.email, reason: 'Link not working' }) });
      if (res.ok) alert('Thank you!'); else alert('Error');
    } catch { alert('Error'); }
    finally { setReportingGroup(null); }
  };
  const handleShare = async (group: Group) => {
    const links = (group as any).whatsappLinks || [(group as any).whatsappLink].filter(Boolean);
    const text = `${group.title}\n\n${group.description}\n\nJoin: ${links[0]}\n\nMore at: https://crownheightsgroups.com/groups`;
    if (navigator.share) { try { await navigator.share({ title: group.title, text }); } catch {} }
    else { await navigator.clipboard.writeText(text); setCopiedId(group.id + '-share'); setTimeout(() => setCopiedId(null), 2000); }
  };
  const handleCopy = async (group: Group) => {
    const links = (group as any).whatsappLinks || [(group as any).whatsappLink].filter(Boolean);
    const cat = categories.find(c => c.id === group.categoryId);
    const text = `${group.title}\n${cat?.icon} ${cat?.name}\n${group.description}\n\n${links.join('\n')}\n\nMore at: https://crownheightsgroups.com`;
    await navigator.clipboard.writeText(text);
    setCopiedId(group.id + '-copy'); setTimeout(() => setCopiedId(null), 2000);
  };
  const handleSuggestLocation = async () => {
    if (!newLocation.neighborhood) return alert('Required');
    setSubmittingLocation(true);
    try {
      const res = await fetch('/api/location-suggestions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...newLocation, suggestedBy: user?.email }) });
      if (res.ok) { alert('Thanks!'); setShowLocationModal(false); setNewLocation({ neighborhood: '', city: '', state: '', country: 'USA' }); }
    } catch { alert('Error'); }
    finally { setSubmittingLocation(false); }
  };

  const getCat = (id: string) => categories.find(c => c.id === id);
  const getLoc = (id: string) => locations.find(l => l.id === id);

  if (loading) return <div className="auth-container"><div className="loading"><div className="spinner"></div></div></div>;

  return (
    <>
      <EmergencyBar />
      <Header user={user} onLogout={handleLogout} />
      
      <main className="main">
        <div className="page-header">
          <h1 className="page-title">👥 WhatsApp Groups Directory</h1>
          <p className="page-subtitle">Find and join community groups</p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <input type="text" placeholder="🔍 Search groups..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #ddd', fontSize: '1rem', boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#666' }}>📍 Location</span>
            <button onClick={() => setShowLocationModal(true)} style={{ fontSize: '0.8rem', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer' }}>+ Suggest</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <button onClick={() => setSelectedLocation('')} style={{ padding: '0.5rem 1rem', borderRadius: '20px', border: 'none', background: !selectedLocation ? '#2563eb' : '#e5e7eb', color: !selectedLocation ? 'white' : '#333', cursor: 'pointer', fontWeight: !selectedLocation ? 'bold' : 'normal' }}>All</button>
            {locations.sort((a, b) => (a.order || 0) - (b.order || 0)).map(loc => (
              <button key={loc.id} onClick={() => setSelectedLocation(loc.id === selectedLocation ? '' : loc.id)} style={{ padding: '0.5rem 1rem', borderRadius: '20px', border: 'none', background: selectedLocation === loc.id ? '#2563eb' : '#e5e7eb', color: selectedLocation === loc.id ? 'white' : '#333', cursor: 'pointer', fontWeight: selectedLocation === loc.id ? 'bold' : 'normal' }}>{loc.neighborhood}</button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#666' }}>📁 Category</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <button onClick={() => setSelectedCategory('')} style={{ padding: '0.5rem 1rem', borderRadius: '20px', border: 'none', background: !selectedCategory ? '#2563eb' : '#e5e7eb', color: !selectedCategory ? 'white' : '#333', cursor: 'pointer', fontWeight: !selectedCategory ? 'bold' : 'normal' }}>All</button>
            {categories.sort((a, b) => (a.order || 0) - (b.order || 0)).map(cat => (
              <button key={cat.id} onClick={() => setSelectedCategory(cat.id === selectedCategory ? '' : cat.id)} style={{ padding: '0.5rem 1rem', borderRadius: '20px', border: 'none', background: selectedCategory === cat.id ? '#2563eb' : '#e5e7eb', color: selectedCategory === cat.id ? 'white' : '#333', cursor: 'pointer', fontWeight: selectedCategory === cat.id ? 'bold' : 'normal' }}>{cat.icon} {cat.name}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span style={{ color: '#666' }}>{filteredGroups.length} groups</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[{k: 'popular', l: '🔥 Popular'}, {k: 'date', l: '🕐 Recent'}, {k: 'alpha', l: '🔤 A-Z'}].map(s => (
              <button key={s.k} onClick={() => setSortBy(s.k as any)} style={{ padding: '0.25rem 0.75rem', borderRadius: '4px', border: 'none', background: sortBy === s.k ? '#2563eb' : '#e5e7eb', color: sortBy === s.k ? 'white' : '#333', cursor: 'pointer', fontSize: '0.85rem' }}>{s.l}</button>
            ))}
          </div>
        </div>

        {filteredGroups.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
            {filteredGroups.map(group => {
              const cat = getCat(group.categoryId);
              const loc = getLoc(group.locationId);
              const links = (group as any).whatsappLinks || [(group as any).whatsappLink].filter(Boolean);
              return (
                <div key={group.id} style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: group.isPinned ? '2px solid #f59e0b' : '1px solid #eee' }}>
                  {group.isPinned && <div style={{ color: '#f59e0b', fontSize: '0.8rem', marginBottom: '0.5rem' }}>⭐ Featured</div>}
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ padding: '2px 8px', background: '#eff6ff', borderRadius: '4px', fontSize: '0.8rem' }}>{cat?.icon} {cat?.name}</span>
                    {loc && <span style={{ padding: '2px 8px', background: '#f0fdf4', borderRadius: '4px', fontSize: '0.8rem' }}>📍 {loc.neighborhood}</span>}
                    {group.language && group.language !== 'English' && <span style={{ padding: '2px 8px', background: '#fef3c7', borderRadius: '4px', fontSize: '0.8rem' }}>{group.language}</span>}
                  </div>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{group.title}</h3>
                  <p style={{ color: '#666', fontSize: '0.9rem', margin: '0 0 1rem 0' }}>{group.description}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                    {links.map((link: string, i: number) => (
                      <a key={i} href={link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.75rem', background: '#25D366', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
                        {links.length > 1 ? `Join Group ${i + 1}` : 'Join WhatsApp Group'}
                      </a>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <button onClick={() => handleShare(group)} style={{ flex: 1, padding: '0.5rem', border: '1px solid #2563eb', borderRadius: '8px', background: copiedId === group.id + '-share' ? '#2563eb' : 'white', color: copiedId === group.id + '-share' ? 'white' : '#2563eb', cursor: 'pointer', fontSize: '0.85rem' }}>{copiedId === group.id + '-share' ? '✓ Copied!' : '📤 Share'}</button>
                    <button onClick={() => handleCopy(group)} style={{ flex: 1, padding: '0.5rem', border: '1px solid #10b981', borderRadius: '8px', background: copiedId === group.id + '-copy' ? '#10b981' : 'white', color: copiedId === group.id + '-copy' ? 'white' : '#10b981', cursor: 'pointer', fontSize: '0.85rem' }}>{copiedId === group.id + '-copy' ? '✓ Copied!' : '📋 Copy'}</button>
                  </div>
                  <button onClick={() => handleReport(group.id)} disabled={reportingGroup === group.id} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ef4444', borderRadius: '8px', background: 'white', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem' }}>{reportingGroup === group.id ? 'Reporting...' : '⚠️ Report'}</button>
                </div>
              );
            })}
          </div>
        ) : <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}><h3>No groups found</h3></div>}
      </main>

      <Footer />

      {showLocationModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', width: '90%', maxWidth: '400px' }}>
            <h2 style={{ marginTop: 0 }}>Suggest Location</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input value={newLocation.neighborhood} onChange={e => setNewLocation({ ...newLocation, neighborhood: e.target.value })} placeholder="Neighborhood *" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
              <input value={newLocation.city} onChange={e => setNewLocation({ ...newLocation, city: e.target.value })} placeholder="City" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
              <input value={newLocation.state} onChange={e => setNewLocation({ ...newLocation, state: e.target.value })} placeholder="State" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
              <input value={newLocation.country} onChange={e => setNewLocation({ ...newLocation, country: e.target.value })} placeholder="Country" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button onClick={() => setShowLocationModal(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSuggestLocation} disabled={submittingLocation} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', background: '#2563eb', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>{submittingLocation ? '...' : 'Submit'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
