'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EmergencyBar from '@/components/EmergencyBar';

interface ServiceCategory {
  id: string;
  name: string;
  nameRu?: string;
  icon: string;
  slug: string;
  order?: number;
}

interface Service {
  id: string;
  name: string;
  phone: string;
  secondPhone?: string;
  address?: string;
  website?: string;
  logo?: string;
  categoryId: string;
  description?: string;
  languages?: string[];
  isPinned?: boolean;
}

export default function ServicesPage() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('session_token');
      if (!token) { window.location.href = '/auth/login'; return; }
      try {
        const res = await fetch('/api/auth/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) });
        const data = await res.json();
        if (data.valid) { setUser({ name: data.user.name, email: data.user.email, role: data.user.role }); }
        else { window.location.href = '/auth/login'; }
      } catch (e) { window.location.href = '/auth/login'; }
    };
    checkAuth();
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [catRes, svcRes] = await Promise.all([fetch('/api/admin/service-categories'), fetch('/api/admin/services')]);
      const catData = await catRes.json();
      const svcData = await svcRes.json();
      setCategories(Array.isArray(catData) ? catData : []);
      setServices(Array.isArray(svcData) ? svcData : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleLogout = () => { localStorage.clear(); window.location.href = '/auth/login'; };

  const filteredServices = selectedCategory ? services.filter(s => s.categoryId === selectedCategory) : services;
  const sortedServices = [...filteredServices].sort((a, b) => (a.isPinned && !b.isPinned) ? -1 : (!a.isPinned && b.isPinned) ? 1 : 0);

  if (loading) return <div className="auth-container"><div className="loading"><div className="spinner"></div></div></div>;

  return (
    <>
      <EmergencyBar />
      <Header user={user} onLogout={handleLogout} />
      <main className="main">
        <div className="page-header">
          <h1 className="page-title">📞 Service Directory</h1>
          <p className="page-subtitle">Find trusted local service providers</p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
          <button onClick={() => setSelectedCategory('')} style={{ padding: '0.5rem 1rem', borderRadius: '20px', border: 'none', background: !selectedCategory ? '#2563eb' : '#e5e7eb', color: !selectedCategory ? 'white' : '#333', cursor: 'pointer', fontWeight: !selectedCategory ? 'bold' : 'normal' }}>All</button>
          {categories.sort((a,b) => (a.order || 0) - (b.order || 0)).map(cat => (
            <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} style={{ padding: '0.5rem 1rem', borderRadius: '20px', border: 'none', background: selectedCategory === cat.id ? '#2563eb' : '#e5e7eb', color: selectedCategory === cat.id ? 'white' : '#333', cursor: 'pointer', fontWeight: selectedCategory === cat.id ? 'bold' : 'normal' }}>{cat.icon} {cat.name}</button>
          ))}
        </div>

        {sortedServices.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {sortedServices.map(service => {
              const cat = categories.find(c => c.id === service.categoryId);
              return (
                <div key={service.id} style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: service.isPinned ? '2px solid #f59e0b' : '1px solid #eee' }}>
                  {service.isPinned && <div style={{ color: '#f59e0b', fontSize: '0.8rem', marginBottom: '0.5rem' }}>⭐ Featured</div>}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    {service.logo ? <img src={service.logo} alt={service.name} style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} /> : <div style={{ width: '50px', height: '50px', borderRadius: '8px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>{cat?.icon || '🔧'}</div>}
                    <div><h3 style={{ margin: 0, fontSize: '1.1rem' }}>{service.name}</h3><p style={{ margin: 0, color: '#666', fontSize: '0.85rem' }}>{cat?.name}</p></div>
                  </div>
                  {service.description && <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>{service.description}</p>}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <a href={`tel:${service.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2563eb', textDecoration: 'none', fontWeight: 'bold' }}>📞 {service.phone}</a>
                    {service.secondPhone && <a href={`tel:${service.secondPhone}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2563eb', textDecoration: 'none' }}>📞 {service.secondPhone}</a>}
                    {service.address && <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, color: '#666', fontSize: '0.9rem' }}>📍 {service.address}</p>}
                    {service.website && <a href={service.website.startsWith('http') ? service.website : `https://${service.website}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2563eb', textDecoration: 'none', fontSize: '0.9rem' }}>🌐 Website</a>}
                  </div>
                  {service.languages && service.languages.length > 0 && <div style={{ marginTop: '1rem', display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>{service.languages.map(lang => <span key={lang} style={{ padding: '2px 8px', background: '#f3f4f6', borderRadius: '4px', fontSize: '0.75rem' }}>{lang}</span>)}</div>}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}><p>No services found</p></div>
        )}
      </main>
      <Footer />
    </>
  );
}
