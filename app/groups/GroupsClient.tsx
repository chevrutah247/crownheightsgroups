'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EmergencyBar from '@/components/EmergencyBar';

interface UserInfo { name: string; email: string; role: 'user' | 'admin'; }
interface Category { id: string; name: string; icon: string; slug: string; order?: number; }
interface Location { id: string; neighborhood: string; status: string; order?: number; }
interface Group { 
  id: string; title: string; description: string; categoryId: string; locationId: string; 
  language: string; status: string; clicksCount: number; isPinned?: boolean;
  whatsappLinks?: string[]; whatsappLink?: string;
  telegramLink?: string; facebookLink?: string; twitterLink?: string; websiteLink?: string;
}

export default function GroupsClient() {
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get('category');
  
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
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
        if (Array.isArray(catsData)) {
          setCategories(catsData);
          if (categorySlug) {
            const cat = catsData.find((c: Category) => c.slug === categorySlug);
            if (cat) setSelectedCategory(cat.id);
          }
        }
        if (Array.isArray(locsData)) setLocations(locsData.filter((l: Location) => l.status === 'approved'));
      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [categorySlug]);

  useEffect(() => {
    let result = [...allGroups];
    
    // Filter by location
    if (selectedLocation) {
      result = result.filter(g => g.locationId === selectedLocation);
    }
    
    // Filter by category
    if (selectedCategory) {
      result = result.filter(g => g.categoryId === selectedCategory);
    }
    
    // Improved search - search in title first, then check category name
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const words = q.split(/\s+/);
      
      result = result.filter(g => {
        const title = g.title.toLowerCase();
        const cat = categories.find(c => c.id === g.categoryId);
        const catName = cat?.name?.toLowerCase() || '';
        
        // Check if ALL search words match in title OR category name
        return words.every(word => 
          title.includes(word) || catName.includes(word)
        );
      });
    }
    
    // Sort: pinned first, then by selected sort
    const pinned = result.filter(g => g.isPinned).sort((a, b) => ((a as any).pinnedOrder || 0) - ((b as any).pinnedOrder || 0));
    const regular = result.filter(g => !g.isPinned);
    
    if (sortBy === 'popular') regular.sort((a, b) => b.clicksCount - a.clicksCount);
    else if (sortBy === 'date') regular.sort((a, b) => new Date((b as any).createdAt || 0).getTime() - new Date((a as any).createdAt || 0).getTime());
    else regular.sort((a, b) => a.title.localeCompare(b.title));
    
    setFilteredGroups([...pinned, ...regular]);
  }, [allGroups, categories, selectedLocation, selectedCategory, searchQuery, sortBy]);

  const handleLogout = () => { localStorage.clear(); window.location.href = '/auth/login'; };
  
  const getWhatsAppLinks = (group: Group): string[] => {
    const links: string[] = [];
    if (group.whatsappLinks && Array.isArray(group.whatsappLinks)) {
      group.whatsappLinks.forEach(l => { if (l && typeof l === 'string') links.push(l); });
    } else if (group.whatsappLink && typeof group.whatsappLink === 'string') {
      links.push(group.whatsappLink);
    }
    return links;
  };
  
  const handleCopy = async (group: Group) => {
    const links = getWhatsAppLinks(group);
    const cat = categories.find(c => c.id === group.categoryId);
    let text = group.title + '\n' + (cat?.icon || '') + ' ' + (cat?.name || '') + '\n' + group.description + '\n\n';
    if (links.length) text += 'WhatsApp: ' + links.join(', ') + '\n';
    if (group.telegramLink) text += 'Telegram: ' + group.telegramLink + '\n';
    if (group.facebookLink) text += 'Facebook: ' + group.facebookLink + '\n';
    if (group.websiteLink) text += 'Website: ' + group.websiteLink + '\n';
    text += '\nMore at: https://crownheightsgroups.com';
    await navigator.clipboard.writeText(text);
    setCopiedId(group.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCat = (id: string) => categories.find(c => c.id === id);
  const getLoc = (id: string) => locations.find(l => l.id === id);
  const getSelectedCategoryName = () => {
    if (!selectedCategory) return null;
    const cat = categories.find(c => c.id === selectedCategory);
    return cat ? cat.icon + ' ' + cat.name : null;
  };

  if (loading) return <div className="auth-container"><div className="loading"><div className="spinner"></div></div></div>;

  return (
    <div>
      <EmergencyBar />
      <Header user={user} onLogout={handleLogout} />
      
      <main className="main">
        <div className="page-header">
          <h1 className="page-title">{getSelectedCategoryName() || '👥 All Groups'}</h1>
          <p className="page-subtitle">Find and join community groups</p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <input 
            type="text" 
            placeholder="🔍 Search by group name or category..." 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #ddd', fontSize: '1rem', boxSizing: 'border-box' }} 
          />
          {searchQuery && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#666' }}>
              Searching for "{searchQuery}" in group names and categories
            </div>
          )}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#666' }}>📍 Location</div>
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
              const waLinks = getWhatsAppLinks(group);
              
              return (
                <div key={group.id} style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: group.isPinned ? '2px solid #f59e0b' : '1px solid #eee' }}>
                  {group.isPinned && <div style={{ color: '#f59e0b', fontSize: '0.8rem', marginBottom: '0.5rem' }}>⭐ Featured</div>}
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ padding: '2px 8px', background: '#eff6ff', borderRadius: '4px', fontSize: '0.8rem' }}>{cat?.icon} {cat?.name}</span>
                    {loc && <span style={{ padding: '2px 8px', background: '#f0fdf4', borderRadius: '4px', fontSize: '0.8rem' }}>📍 {loc.neighborhood}</span>}
                    {group.language && group.language !== 'English' && <span style={{ padding: '2px 8px', background: '#fef3c7', borderRadius: '4px', fontSize: '0.8rem' }}>{group.language}</span>}
                  </div>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{group.title}</h3>
                  <p style={{ color: '#666', fontSize: '0.9rem', margin: '0 0 1rem 0' }}>{group.description && group.description.length > 150 ? group.description.slice(0, 150) + '...' : group.description}</p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                    {waLinks.map((link, i) => (
                      <a key={i} href={link} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', background: '#25D366', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
                        <span>💬</span> WhatsApp{waLinks.length > 1 ? ` ${i + 1}` : ''}
                      </a>
                    ))}
                    {group.telegramLink && (
                      <a href={group.telegramLink} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', background: '#0088cc', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
                        <span>✈️</span> Telegram
                      </a>
                    )}
                    {group.facebookLink && (
                      <a href={group.facebookLink} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', background: '#1877F2', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
                        <span>📘</span> Facebook
                      </a>
                    )}
                    {group.websiteLink && (
                      <a href={group.websiteLink} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', background: '#6366f1', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
                        <span>🌐</span> Website
                      </a>
                    )}
                  </div>
                  
                  <button onClick={() => handleCopy(group)} style={{ width: '100%', padding: '0.5rem', background: copiedId === group.id ? '#10b981' : '#f3f4f6', color: copiedId === group.id ? 'white' : '#666', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                    {copiedId === group.id ? '✓ Copied!' : '📋 Copy & Share'}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', background: '#f9fafb', borderRadius: '12px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <h3 style={{ color: '#6b7280' }}>No groups found</h3>
            <p style={{ color: '#9ca3af' }}>Try adjusting your search or filters</p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
