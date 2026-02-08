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

        {/* Torah Learning Banner */}
        <div style={{ background: 'linear-gradient(135deg, #1e3a5f, #3b82f6)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', color: 'white', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>📚 Want to Learn Torah?</h3>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.95rem' }}>Free one-on-one learning with a partner. Any level, any topic.</p>
          </div>
          <a href="https://www.torahmates.org/" target="_blank" rel="noopener noreferrer" style={{ background: 'linear-gradient(135deg, #ffd700, #f59e0b)', color: '#1e3a5f', padding: '0.75rem 1.5rem', borderRadius: '25px', fontWeight: 'bold', textDecoration: 'none', whiteSpace: 'nowrap' }}>Sign Up Free →</a>
        </div>

        {/* Filters Section - Clean inline styles */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '1rem', 
          marginBottom: '1.5rem',
          padding: '1.25rem',
          background: '#f8fafc',
          borderRadius: '12px',
          alignItems: 'flex-end'
        }}>
          {/* Search */}
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontSize: '0.85rem', 
              fontWeight: '600', 
              color: '#374151' 
            }}>
              🔍 Search
            </label>
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '2px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          {/* Category Dropdown */}
          <div style={{ minWidth: '220px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontSize: '0.85rem', 
              fontWeight: '600', 
              color: '#374151' 
            }}>
              📁 Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '2px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '1rem',
                background: 'white',
                cursor: 'pointer',
                outline: 'none',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23666' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                paddingRight: '2.5rem',
                boxSizing: 'border-box'
              }}
            >
              <option value="">All Categories</option>
              {categories.sort((a, b) => (a.order || 0) - (b.order || 0)).map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Clear button */}
          {(searchQuery || selectedCategory) && (
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory(''); }}
              style={{
                padding: '0.75rem 1.25rem',
                background: '#fee2e2',
                color: '#dc2626',
                border: 'none',
                borderRadius: '10px',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
            >
              ✕ Clear
            </button>
          )}
        </div>

        {/* Results count */}
        <div style={{ marginBottom: '1rem', color: '#666', fontSize: '0.95rem' }}>
          <strong>{filteredServices.length}</strong> service{filteredServices.length !== 1 ? 's' : ''} found
          {selectedCategory && categories.find(c => c.id === selectedCategory) && (
            <span> in <strong>{categories.find(c => c.id === selectedCategory)?.icon} {categories.find(c => c.id === selectedCategory)?.name}</strong></span>
          )}
        </div>

        {/* Services Grid */}
        {filteredServices.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {filteredServices.map(service => {
              const cat = getCat(service.categoryId);
              return (
                <div 
                  key={service.id} 
                  style={{ 
                    background: 'white', 
                    borderRadius: '16px', 
                    padding: '1.5rem', 
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                    border: service.isPinned ? '2px solid #f59e0b' : '1px solid #e5e7eb',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'box-shadow 0.2s, transform 0.2s'
                  }}
                >
                  {service.isPinned && (
                    <div style={{ color: '#f59e0b', fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>⭐ Featured</div>
                  )}
                  
                  {/* Image / Business Card */}
                  {(service.imageUrl || service.logoUrl) && (
                    <div style={{ marginBottom: '1rem', marginLeft: '-1.5rem', marginRight: '-1.5rem', marginTop: service.isPinned ? '0' : '-1.5rem' }}>
                      <img 
                        src={service.imageUrl || service.logoUrl} 
                        alt={service.name} 
                        style={{ 
                          width: '100%', 
                          height: '180px', 
                          objectFit: 'cover', 
                          borderRadius: service.isPinned ? '0' : '16px 16px 0 0'
                        }} 
                      />
                    </div>
                  )}
                  
                  {/* Category Badge */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ 
                      padding: '4px 12px', 
                      background: '#eff6ff', 
                      borderRadius: '20px', 
                      fontSize: '0.8rem',
                      color: '#1e40af',
                      fontWeight: '500'
                    }}>
                      {cat?.icon} {cat?.name || 'Service'}
                    </span>
                  </div>
                  
                  {/* Name */}
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: '700', color: '#1f2937' }}>{service.name}</h3>
                  
                  {/* Description */}
                  {service.description && (
                    <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '0 0 1rem 0', lineHeight: '1.6', flex: '1' }}>
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
                        padding: '0.875rem', 
                        background: '#10b981', 
                        color: 'white', 
                        borderRadius: '10px', 
                        textDecoration: 'none', 
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        transition: 'background 0.2s'
                      }}
                    >
                      📞 {service.phone}
                    </a>
                    
                    {/* Address */}
                    {service.address && (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem', 
                        padding: '0.625rem 0.875rem', 
                        background: '#f3f4f6', 
                        borderRadius: '10px', 
                        fontSize: '0.9rem', 
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
                          padding: '0.625rem', 
                          background: '#f3f4f6', 
                          color: '#4b5563', 
                          borderRadius: '10px', 
                          textDecoration: 'none',
                          fontSize: '0.9rem',
                          transition: 'background 0.2s'
                        }}
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
                          padding: '0.625rem', 
                          background: '#6366f1', 
                          color: 'white', 
                          borderRadius: '10px', 
                          textDecoration: 'none',
                          fontSize: '0.9rem',
                          transition: 'background 0.2s'
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
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666', background: '#f9fafb', borderRadius: '16px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <h3 style={{ marginBottom: '0.5rem', color: '#374151' }}>No services found</h3>
            <p style={{ color: '#6b7280' }}>Try adjusting your search or category filter</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
