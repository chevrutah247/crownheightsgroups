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
  email?: string;
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

        {/* Filters Section - Same style as Groups page */}
        <section className="filters-section">
          <div className="filters-row">
            {/* Search */}
            <div className="filter-group search-group">
              <label className="filter-label">Search</label>
              <input
                type="text"
                className="filter-input search-input"
                placeholder="Search services by name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Category Dropdown */}
            <div className="filter-group">
              <label className="filter-label">Category</label>
              <select
                className="filter-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.sort((a, b) => (a.order || 0) - (b.order || 0)).map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

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
                    border: service.isPinned ? '2px solid #f59e0b' : '1px solid #eee',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  {service.isPinned && (
                    <div style={{ color: '#f59e0b', fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>⭐ Featured</div>
                  )}
                  
                  {/* Image / Business Card */}
                  {(service.imageUrl || service.logoUrl) && (
                    <div style={{ marginBottom: '1rem' }}>
                      <img 
                        src={service.imageUrl || service.logoUrl} 
                        alt={service.name} 
                        style={{ 
                          width: '100%', 
                          height: '160px', 
                          objectFit: 'cover', 
                          borderRadius: '8px',
                          border: '1px solid #eee'
                        }} 
                      />
                    </div>
                  )}
                  
                  {/* Category Badge */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ 
                      padding: '4px 10px', 
                      background: '#eff6ff', 
                      borderRadius: '6px', 
                      fontSize: '0.8rem',
                      color: '#1e40af',
                      fontWeight: '500'
                    }}>
                      {cat?.icon} {cat?.name || 'Service'}
                    </span>
                  </div>
                  
                  {/* Name */}
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.15rem', fontWeight: '600' }}>{service.name}</h3>
                  
                  {/* Description */}
                  {service.description && (
                    <p style={{ color: '#666', fontSize: '0.9rem', margin: '0 0 1rem 0', lineHeight: '1.5', flex: '1' }}>
                      {service.description}
                    </p>
                  )}
                  
                  {/* Contact Info */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: 'auto' }}>
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
                        fontSize: '0.95rem',
                        transition: 'background 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#059669'}
                      onMouseOut={(e) => e.currentTarget.style.background = '#10b981'}
                    >
                      📞 {service.phone}
                    </a>
                    
                    {/* Address */}
                    {service.address && (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem', 
                        padding: '0.5rem 0.75rem', 
                        background: '#f3f4f6', 
                        borderRadius: '8px', 
                        fontSize: '0.85rem', 
                        color: '#4b5563' 
                      }}>
                        📍 {service.address}
                      </div>
                    )}
                    
                    {/* Email */}
                    {service.email && (
                      <a 
                        href={'mailto:' + service.email}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          gap: '0.5rem', 
                          padding: '0.5rem', 
                          background: '#f3f4f6', 
                          color: '#4b5563', 
                          borderRadius: '8px', 
                          textDecoration: 'none',
                          fontSize: '0.85rem',
                          transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#e5e7eb'}
                        onMouseOut={(e) => e.currentTarget.style.background = '#f3f4f6'}
                      >
                        ✉️ {service.email}
                      </a>
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
                          fontSize: '0.9rem',
                          transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#4f46e5'}
                        onMouseOut={(e) => e.currentTarget.style.background = '#6366f1'}
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
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <h3 style={{ marginBottom: '0.5rem' }}>No services found</h3>
            <p>Try adjusting your search or category filter</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
