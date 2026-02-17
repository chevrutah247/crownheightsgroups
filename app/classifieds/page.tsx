'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EmergencyBar from '@/components/EmergencyBar';

interface UserInfo { name: string; email: string; role: 'user' | 'admin'; }

interface Listing {
  id: string;
  title: string;
  category: string;
  description: string;
  price: string;
  imageUrls: string[];
  location: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  contactWhatsapp: string;
  submittedBy: string;
  status: string;
  expiresAt: string;
  createdAt: string;
  views: number;
}

const categories = [
  { id: 'all', name: 'All', icon: '📋' },
  { id: 'for-sale', name: 'For Sale', icon: '🏷️' },
  { id: 'free-stuff', name: 'Free Stuff', icon: '🆓' },
  { id: 'housing', name: 'Housing', icon: '🏠' },
  { id: 'jobs', name: 'Jobs & Gigs', icon: '💼' },
  { id: 'services', name: 'Services', icon: '🔧' },
  { id: 'wanted', name: 'Wanted', icon: '🔍' },
  { id: 'lost-found', name: 'Lost & Found', icon: '📦' },
];

const categoryColors: Record<string, string> = {
  'for-sale': '#16a34a',
  'free-stuff': '#0891b2',
  'housing': '#ea580c',
  'jobs': '#7c3aed',
  'services': '#2563eb',
  'wanted': '#dc2626',
  'lost-found': '#ca8a04',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return mins <= 1 ? 'Just now' : `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function ClassifiedsPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    const token = localStorage.getItem('session_token');
    if (!token) return;
    fetch('/api/auth/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) })
      .then(r => r.json())
      .then(data => { if (data.valid) setUser(data.user); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/api/classifieds')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setListings(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => { localStorage.clear(); window.location.href = '/auth/login'; };

  const filtered = listings.filter(l => {
    const matchesCat = filter === 'all' || l.category === filter;
    const matchesSearch = !search ||
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.description.toLowerCase().includes(search.toLowerCase()) ||
      l.location.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sort === 'price-low') {
      const pa = parseFloat(a.price.replace(/[^0-9.]/g, '')) || 0;
      const pb = parseFloat(b.price.replace(/[^0-9.]/g, '')) || 0;
      return pa - pb;
    }
    if (sort === 'price-high') {
      const pa = parseFloat(a.price.replace(/[^0-9.]/g, '')) || 0;
      const pb = parseFloat(b.price.replace(/[^0-9.]/g, '')) || 0;
      return pb - pa;
    }
    return 0;
  });

  const getCatInfo = (id: string) => categories.find(c => c.id === id) || categories[0];

  return (
    <div>
      <EmergencyBar />
      <Header user={user} onLogout={handleLogout} />

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', color: '#1e3a5f', marginBottom: '0.5rem' }}>
            📋 Community Classifieds
          </h1>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>
            Buy, sell, find housing, jobs, and more in Crown Heights
          </p>
          <Link href="/add/classified" style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #16a34a, #15803d)',
            color: 'white',
            padding: '0.75rem 2rem',
            borderRadius: '25px',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '1.05rem',
            boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
          }}>
            + Post Free Ad
          </Link>
        </div>

        {/* Category Filter */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1rem', WebkitOverflowScrolling: 'touch' }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                border: filter === cat.id ? '2px solid #1e3a5f' : '2px solid #e5e7eb',
                background: filter === cat.id ? '#1e3a5f' : 'white',
                color: filter === cat.id ? 'white' : '#333',
                cursor: 'pointer',
                fontWeight: filter === cat.id ? '700' : '500',
                fontSize: '0.9rem',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* Search + Sort */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search classifieds..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '0.75rem 1rem',
              border: '2px solid #e5e7eb',
              borderRadius: '10px',
              fontSize: '1rem',
            }}
          />
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            style={{
              padding: '0.75rem 1rem',
              border: '2px solid #e5e7eb',
              borderRadius: '10px',
              fontSize: '0.9rem',
              background: 'white',
            }}
          >
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

        {/* Results count */}
        <div style={{ marginBottom: '1rem', color: '#666', fontSize: '0.9rem' }}>
          {sorted.length} listing{sorted.length !== 1 ? 's' : ''}
          {filter !== 'all' && ` in ${getCatInfo(filter).name}`}
          {search && ` matching "${search}"`}
        </div>

        {/* Listings */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>Loading...</div>
        ) : sorted.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
            <h3 style={{ color: '#666', marginBottom: '0.5rem' }}>No listings yet</h3>
            <p style={{ color: '#999', marginBottom: '1.5rem' }}>Be the first to post!</p>
            <Link href="/add/classified" style={{
              display: 'inline-block',
              background: '#16a34a',
              color: 'white',
              padding: '0.75rem 2rem',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: 'bold',
            }}>
              + Post Free Ad
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {sorted.map(listing => {
              const catInfo = getCatInfo(listing.category);
              const catColor = categoryColors[listing.category] || '#666';

              return (
                <div key={listing.id} style={{
                  background: 'white',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                  border: '1px solid #e5e7eb',
                  display: 'flex',
                  flexDirection: 'column',
                }}>
                  {/* Image */}
                  {listing.imageUrls?.[0] && (
                    <div style={{ position: 'relative', paddingTop: '56%', background: '#f5f5f5' }}>
                      <img
                        src={listing.imageUrls[0]}
                        alt={listing.title}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      {listing.imageUrls.length > 1 && (
                        <span style={{
                          position: 'absolute', bottom: '8px', right: '8px',
                          background: 'rgba(0,0,0,0.7)', color: 'white', padding: '2px 8px',
                          borderRadius: '10px', fontSize: '0.75rem',
                        }}>
                          +{listing.imageUrls.length - 1} photos
                        </span>
                      )}
                    </div>
                  )}

                  <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Category + Time */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{
                        background: catColor + '15',
                        color: catColor,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                      }}>
                        {catInfo.icon} {catInfo.name}
                      </span>
                      <span style={{ color: '#999', fontSize: '0.8rem' }}>{timeAgo(listing.createdAt)}</span>
                    </div>

                    {/* Title */}
                    <h3 style={{ color: '#1e3a5f', margin: '0 0 0.5rem 0', fontSize: '1.1rem', lineHeight: 1.3 }}>
                      {listing.title}
                    </h3>

                    {/* Price */}
                    {listing.price && (
                      <div style={{
                        fontSize: '1.3rem',
                        fontWeight: 'bold',
                        color: listing.price.toLowerCase() === 'free' ? '#16a34a' : '#1e3a5f',
                        marginBottom: '0.5rem',
                      }}>
                        {listing.price.toLowerCase() === 'free' ? 'FREE' : listing.price.startsWith('$') ? listing.price : `$${listing.price}`}
                      </div>
                    )}

                    {/* Description */}
                    {listing.description && (
                      <p style={{ color: '#666', fontSize: '0.9rem', margin: '0 0 0.75rem 0', lineHeight: 1.5, flex: 1 }}>
                        {listing.description.length > 150 ? listing.description.slice(0, 150) + '...' : listing.description}
                      </p>
                    )}

                    {/* Location */}
                    {listing.location && (
                      <div style={{ color: '#888', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                        📍 {listing.location}
                      </div>
                    )}

                    {/* Contact Buttons */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: 'auto' }}>
                      {listing.contactPhone && (
                        <a href={`tel:${listing.contactPhone}`} style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                          padding: '0.5rem 0.75rem', background: '#059669', color: 'white',
                          borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600',
                        }}>
                          📞 Call
                        </a>
                      )}
                      {listing.contactWhatsapp && (
                        <a href={listing.contactWhatsapp.startsWith('http') ? listing.contactWhatsapp : `https://wa.me/${listing.contactWhatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                          padding: '0.5rem 0.75rem', background: '#25D366', color: 'white',
                          borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600',
                        }}>
                          💬 WhatsApp
                        </a>
                      )}
                      {listing.contactEmail && (
                        <a href={`mailto:${listing.contactEmail}`} style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                          padding: '0.5rem 0.75rem', background: '#3b82f6', color: 'white',
                          borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600',
                        }}>
                          ✉️ Email
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
