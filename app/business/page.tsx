'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface UserInfo { name: string; email: string; role: 'user' | 'admin'; }
interface Business {
  id: string;
  businessName: string;
  description: string;
  category: string;
  logoUrl?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  instagram?: string;
  whatsapp?: string;
  hours?: string;
  status: string;
  createdAt: string;
}

const categories = [
  { id: 'all', name: '📋 All', icon: '📋' },
  { id: 'retail', name: '🛍️ Retail', icon: '🛍️' },
  { id: 'food', name: '🍕 Food', icon: '🍕' },
  { id: 'services', name: '🔧 Services', icon: '🔧' },
  { id: 'health', name: '🏥 Health', icon: '🏥' },
  { id: 'education', name: '📚 Education', icon: '📚' },
  { id: 'beauty', name: '💇 Beauty', icon: '💇' },
  { id: 'auto', name: '🚗 Auto', icon: '🚗' },
  { id: 'home', name: '🏠 Home', icon: '🏠' },
  { id: 'tech', name: '💻 Tech', icon: '💻' },
  { id: 'finance', name: '💰 Finance', icon: '💰' },
  { id: 'real-estate', name: '🏢 Real Estate', icon: '🏢' },
];

export default function BusinessPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('session_token');
    if (!token) { router.push('/auth/login'); return; }
    
    fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    })
      .then(r => r.json())
      .then(data => { if (data.valid) setUser(data.user); else router.push('/auth/login'); })
      .catch(() => router.push('/auth/login'));
  }, [router]);

  useEffect(() => {
    fetch('/api/business')
      .then(r => r.json())
      .then(data => setBusinesses(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => { localStorage.clear(); router.push('/auth/login'); };

  const getCategoryIcon = (catId: string) => {
    const cat = categories.find(c => c.id === catId);
    return cat ? cat.icon : '📦';
  };

  const getCategoryName = (catId: string) => {
    const cat = categories.find(c => c.id === catId);
    return cat ? cat.name.replace(cat.icon + ' ', '') : catId;
  };

  const filteredBusinesses = businesses.filter(b => {
    const matchesCategory = filter === 'all' || b.category === filter;
    const matchesSearch = !search || 
      b.businessName.toLowerCase().includes(search.toLowerCase()) ||
      b.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      <Header user={user} onLogout={handleLogout} />
      <main className="main">
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', color: '#8b5cf6', marginBottom: '0.5rem' }}>🏪 Business Directory</h1>
            <p style={{ color: '#666' }}>Support local Jewish-owned businesses</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <Link 
              href="/add/business"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: '#8b5cf6',
                color: 'white',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 'bold'
              }}
            >
              ➕ Add Your Business
            </Link>
          </div>

          {/* Search */}
          <div style={{ marginBottom: '1.5rem' }}>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="🔍 Search businesses..."
              style={{
                width: '100%',
                maxWidth: '400px',
                display: 'block',
                margin: '0 auto',
                padding: '0.75rem 1rem',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            />
          </div>

          {/* Category Filter */}
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  border: 'none',
                  background: filter === cat.id ? '#8b5cf6' : '#f1f5f9',
                  color: filter === cat.id ? 'white' : '#475569',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: filter === cat.id ? 'bold' : 'normal'
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div className="spinner"></div>
            </div>
          ) : filteredBusinesses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: '#f5f3ff', borderRadius: '12px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏪</div>
              <h3 style={{ color: '#6d28d9' }}>No businesses found</h3>
              <p style={{ color: '#666', marginTop: '0.5rem' }}>
                {search ? 'Try a different search term' : 'Be the first to add your business!'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {filteredBusinesses.map(business => (
                <div
                  key={business.id}
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                    border: '1px solid #e9d5ff'
                  }}
                >
                  <div style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'start', gap: '1rem', marginBottom: '1rem' }}>
                      {business.logoUrl ? (
                        <img 
                          src={business.logoUrl} 
                          alt={business.businessName}
                          style={{ 
                            width: '60px', 
                            height: '60px', 
                            borderRadius: '12px',
                            objectFit: 'cover',
                            background: '#f1f5f9'
                          }}
                        />
                      ) : (
                        <div style={{ 
                          width: '60px', 
                          height: '60px', 
                          borderRadius: '12px',
                          background: '#f5f3ff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '2rem'
                        }}>
                          {getCategoryIcon(business.category)}
                        </div>
                      )}
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: '0 0 0.25rem 0', color: '#1e3a5f', fontSize: '1.1rem' }}>
                          {business.businessName}
                        </h3>
                        <span style={{
                          display: 'inline-block',
                          background: '#f5f3ff',
                          color: '#6d28d9',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem'
                        }}>
                          {getCategoryName(business.category)}
                        </span>
                      </div>
                    </div>

                    <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: '1.5' }}>
                      {business.description.length > 150 
                        ? business.description.slice(0, 150) + '...' 
                        : business.description}
                    </p>

                    {(business.address || business.hours) && (
                      <div style={{ 
                        background: '#f8fafc', 
                        padding: '0.75rem', 
                        borderRadius: '8px',
                        marginBottom: '1rem',
                        fontSize: '0.85rem',
                        color: '#475569'
                      }}>
                        {business.address && <div>📍 {business.address}</div>}
                        {business.hours && <div>🕐 {business.hours}</div>}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {business.phone && (
                        <a
                          href={`tel:${business.phone}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.5rem 0.75rem',
                            background: '#25D366',
                            color: 'white',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            fontSize: '0.85rem'
                          }}
                        >
                          📞 Call
                        </a>
                      )}
                      {business.website && (
                        <a
                          href={business.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.5rem 0.75rem',
                            background: '#2563eb',
                            color: 'white',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            fontSize: '0.85rem'
                          }}
                        >
                          🌐 Website
                        </a>
                      )}
                      {business.instagram && (
                        <a
                          href={`https://instagram.com/${business.instagram.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.5rem 0.75rem',
                            background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
                            color: 'white',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            fontSize: '0.85rem'
                          }}
                        >
                          📸 Instagram
                        </a>
                      )}
                      {business.whatsapp && (
                        <a
                          href={business.whatsapp}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.5rem 0.75rem',
                            background: '#25D366',
                            color: 'white',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            fontSize: '0.85rem'
                          }}
                        >
                          💬 WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
