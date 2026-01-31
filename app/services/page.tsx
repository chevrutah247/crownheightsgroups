'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EmergencyBar from '@/components/EmergencyBar';

interface UserInfo { name: string; email: string; role: 'user' | 'admin'; }
interface Category { id: string; name: string; icon: string; slug: string; order?: number; }
interface Service { 
  id: string; name: string; phone: string; categoryId: string; 
  description?: string; address?: string; website?: string;
  isPinned?: boolean; status?: string; imageUrl?: string; logoUrl?: string;
}

export default function ServicesPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

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
        const [servicesRes, catsRes] = await Promise.all([
          fetch('/api/admin/services'),
          fetch('/api/admin/service-categories')
        ]);
        const [servicesData, catsData] = await Promise.all([servicesRes.json(), catsRes.json()]);
        
        // Show all services (no status filter) or only approved
        if (Array.isArray(servicesData)) {
          const approved = servicesData.filter((s: Service) => !s.status || s.status === 'approved');
          setAllServices(approved);
        }
        if (Array.isArray(catsData)) setCategories(catsData);
      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let result = [...allServices];
    if (selectedCategory) result = result.filter(s => s.categoryId === selectedCategory);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(q) || 
        (s.description || '').toLowerCase().includes(q) ||
        (s.phone || '').includes(q)
      );
    }
    // Sort: pinned first, then alphabetically
    const pinned = result.filter(s => s.isPinned);
    const regular = result.filter(s => !s.isPinned).sort((a, b) => a.name.localeCompare(b.name));
    setFilteredServices([...pinned, ...regular]);
  }, [allServices, selectedCategory, searchQuery]);

  const handleLogout = () => { localStorage.clear(); window.location.href = '/auth/login'; };
  
  const getCat = (id: string) => categories.find(c => c.id === id);

  if (loading) return <div className="auth-container"><div className="loading"><div className="spinner"></div></div></div>;

  return (
    <div>
      <EmergencyBar />
      <Header user={user} onLogout={handleLogout} />
      
      <main className="main">
        <div className="page-header">
          <h1 className="page-title">🔧 Local Services</h1>
          <p className="page-subtitle">Find trusted professionals in our community</p>
        </div>

        {/* Search */}
        <div style={{ marginBottom: '1.5rem' }}>
          <input 
            type="text" 
            placeholder="🔍 Search services by name or phone..." 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #ddd', fontSize: '1rem', boxSizing: 'border-box' }} 
          />
        </div>

        {/* Category Filter */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#666' }}>🏷️ Category</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <button 
              onClick={() => setSelectedCategory('')} 
              style={{ 
                padding: '0.5rem 1rem', 
                borderRadius: '20px', 
                border: 'none', 
                background: !selectedCategory ? '#2563eb' : '#e5e7eb', 
                color: !selectedCategory ? 'white' : '#333', 
                cursor: 'pointer', 
                fontWeight: !selectedCategory ? 'bold' : 'normal' 
              }}
            >
              All
            </button>
            {categories.sort((a, b) => (a.order || 0) - (b.order || 0)).map(cat => (
              <button 
                key={cat.id} 
                onClick={() => setSelectedCategory(cat.id === selectedCategory ? '' : cat.id)} 
                style={{ 
                  padding: '0.5rem 1rem', 
                  borderRadius: '20px', 
                  border: 'none', 
                  background: selectedCategory === cat.id ? '#2563eb' : '#e5e7eb', 
                  color: selectedCategory === cat.id ? 'white' : '#333', 
                  cursor: 'pointer', 
                  fontWeight: selectedCategory === cat.id ? 'bold' : 'normal' 
                }}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div style={{ marginBottom: '1rem', color: '#666' }}>
          {filteredServices.length} services found
        </div>

        {/* Services Grid */}
        {filteredServices.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {filteredServices.map(service => {
              const cat = getCat(service.categoryId);
              return (
                <div 
                  key={service.id} 
                  style={{ 
                    background: 'white', 
                    borderRadius: '12px', 
                    padding: '1.5rem', 
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    border: service.isPinned ? '2px solid #f59e0b' : '1px solid #eee'
                  }}
                >
                  {service.isPinned && (
                    <div style={{ color: '#f59e0b', fontSize: '0.8rem', marginBottom: '0.5rem' }}>⭐ Featured</div>
                  )}
                  
                  {(service.imageUrl || service.logoUrl) && (
                    <img src={service.imageUrl || service.logoUrl} alt={service.name} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '0.75rem' }} />
                  )}
                  
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ padding: '2px 8px', background: '#eff6ff', borderRadius: '4px', fontSize: '0.8rem' }}>
                      {cat?.icon} {cat?.name || 'Service'}
                    </span>
                  </div>
                  
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{service.name}</h3>
                  
                  {service.description && (
                    <p style={{ color: '#666', fontSize: '0.9rem', margin: '0 0 1rem 0' }}>{service.description}</p>
                  )}
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {/* Phone */}
                    <a 
                      href={'tel:' + service.phone.replace(/[^0-9+]/g, '')} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '0.5rem', 
                        padding: '0.75rem', 
                        background: '#10b981', 
                        color: 'white', 
                        borderRadius: '8px', 
                        textDecoration: 'none', 
                        fontWeight: 'bold',
                        fontSize: '0.95rem'
                      }}
                    >
                      📞 {service.phone}
                    </a>
                    
                    {/* Address */}
                    {service.address && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', background: '#f3f4f6', borderRadius: '8px', fontSize: '0.85rem', color: '#666' }}>
                        📍 {service.address}
                      </div>
                    )}
                    
                    {/* Website */}
                    {service.website && (
                      <a 
                        href={service.website.startsWith('http') ? service.website : 'https://' + service.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          gap: '0.5rem', 
                          padding: '0.5rem', 
                          background: '#6366f1', 
                          color: 'white', 
                          borderRadius: '8px', 
                          textDecoration: 'none',
                          fontSize: '0.9rem'
                        }}
                      >
                        🌐 Website
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
            <h3>No services found</h3>
            <p>Try adjusting your search or category filter</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
