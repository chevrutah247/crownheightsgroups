'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EmergencyBar from '@/components/EmergencyBar';

interface UserInfo {
  name: string;
  email: string;
  role: 'user' | 'admin' | 'superadmin';
}

interface PhotoItem {
  id: string;
  src: string;
  title: string;
}

type CollectionId = 'ohel' | 'rebbe-library' | 'broadcast-booth';

const collections: { id: CollectionId; label: string; subtitle: string; api: string }[] = [
  { id: 'ohel', label: 'Ohel', subtitle: 'Ohel archive gallery', api: '/api/ohel-photos' },
  { id: 'rebbe-library', label: 'Rebbe Library', subtitle: 'Archive from Rebbe Library', api: '/api/rebbe-library-photos' },
  { id: 'broadcast-booth', label: 'Broadcast Booth', subtitle: 'Room used for Rebbe speech broadcasts', api: '/api/broadcast-booth-photos' },
];

export default function PhotoArchivePage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [activeCollection, setActiveCollection] = useState<CollectionId>('ohel');
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('session_token');
      if (!token) return;
      try {
        const response = await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const data = await response.json();
        if (data.valid) {
          setUser({ name: data.user.name, email: data.user.email, role: data.user.role });
        }
      } catch {
        // no-op
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const current = collections.find((c) => c.id === activeCollection);
        const res = await fetch(current?.api || '/api/ohel-photos');
        const data = await res.json();
        if (Array.isArray(data?.photos)) setPhotos(data.photos);
      } catch (error) {
        console.error('Failed to load archive photos', error);
      }
    };
    load();
  }, [activeCollection]);

  useEffect(() => {
    if (activeIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveIndex(null);
      if (event.key === 'ArrowLeft') setActiveIndex((prev) => (prev === null ? null : prev === 0 ? photos.length - 1 : prev - 1));
      if (event.key === 'ArrowRight') setActiveIndex((prev) => (prev === null ? null : prev === photos.length - 1 ? 0 : prev + 1));
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeIndex, photos.length]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/auth/login';
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f8fafc 0%, #edf2f7 100%)' }}>
      <EmergencyBar />
      <Header user={user} onLogout={handleLogout} />

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem' }}>
        <section style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)', borderRadius: '20px', padding: '1.5rem', color: 'white', marginBottom: '1rem' }}>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>Photo Archive</h1>
          <p style={{ marginTop: '0.65rem', marginBottom: 0, opacity: 0.9 }}>
            {collections.find((c) => c.id === activeCollection)?.subtitle}
          </p>
          <div style={{ marginTop: '0.75rem', display: 'inline-block', background: 'rgba(255,255,255,0.14)', borderRadius: '12px', padding: '0.55rem 0.85rem', fontWeight: 700 }}>
            {photos.length} photos
          </div>
        </section>

        <section style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '1rem' }}>
          {collections.map((collection) => (
            <button
              key={collection.id}
              type="button"
              onClick={() => { setActiveCollection(collection.id); setActiveIndex(null); }}
              style={{
                border: '1px solid #cbd5e1',
                background: activeCollection === collection.id ? '#1d4ed8' : 'white',
                color: activeCollection === collection.id ? 'white' : '#334155',
                borderRadius: '999px',
                padding: '0.45rem 0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {collection.label}
            </button>
          ))}
        </section>

        <section style={{
          borderRadius: '20px',
          padding: '1rem',
          background:
            'radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.16), transparent 40%), radial-gradient(circle at 90% 80%, rgba(16, 185, 129, 0.14), transparent 45%), #ffffff',
          border: '1px solid #dbeafe',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.9rem' }}>
            {photos.map((photo, idx) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                style={{
                  position: 'relative',
                  border: 'none',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  background: '#0f172a',
                  textAlign: 'left',
                  boxShadow: '0 10px 28px rgba(15, 23, 42, 0.2)',
                  padding: 0,
                }}
              >
                <img src={photo.src} alt={photo.title} loading="lazy" style={{ width: '100%', height: '240px', objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', inset: 'auto 0 0 0', padding: '0.7rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(to top, rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.08))' }}>
                  <span style={{ background: 'rgba(255,255,255,0.92)', color: '#0f172a', borderRadius: '999px', padding: '0.24rem 0.62rem', fontSize: '0.8rem', fontWeight: 600 }}>{photo.title}</span>
                  <span style={{ background: 'rgba(14,165,233,0.9)', color: 'white', borderRadius: '999px', padding: '0.24rem 0.62rem', fontSize: '0.8rem', fontWeight: 600 }}>View</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      </main>

      {activeIndex !== null && photos[activeIndex] && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(2, 6, 23, 0.86)', backdropFilter: 'blur(4px)', display: 'grid', gridTemplateColumns: '64px minmax(0, 1fr) 64px', alignItems: 'center', padding: '1rem', gap: '0.75rem' }}
          onClick={() => setActiveIndex(null)}
        >
          <button
            type="button"
            aria-label="Previous photo"
            onClick={(e) => { e.stopPropagation(); setActiveIndex((prev) => (prev === null ? null : prev === 0 ? photos.length - 1 : prev - 1)); }}
            style={{ width: '52px', height: '52px', fontSize: '2rem', borderRadius: '12px', border: '1px solid rgba(148, 163, 184, 0.45)', background: 'rgba(15, 23, 42, 0.7)', color: '#f8fafc', cursor: 'pointer' }}
          >
            ‹
          </button>
          <div style={{ maxWidth: '1100px', width: '100%', margin: '0 auto', borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(148, 163, 184, 0.4)', background: '#020617', boxShadow: '0 28px 60px rgba(0,0,0,0.45)' }} onClick={(e) => e.stopPropagation()}>
            <img src={photos[activeIndex].src} alt={photos[activeIndex].title} style={{ width: '100%', maxHeight: 'calc(100vh - 160px)', objectFit: 'contain', display: 'block' }} />
            <div style={{ color: '#e2e8f0', display: 'flex', justifyContent: 'space-between', gap: '1rem', padding: '0.7rem 0.9rem', background: 'rgba(15, 23, 42, 0.85)', fontSize: '0.9rem' }}>
              <span>{photos[activeIndex].title}</span>
              <span>{activeIndex + 1} / {photos.length}</span>
            </div>
          </div>
          <button
            type="button"
            aria-label="Next photo"
            onClick={(e) => { e.stopPropagation(); setActiveIndex((prev) => (prev === null ? null : prev === photos.length - 1 ? 0 : prev + 1)); }}
            style={{ width: '52px', height: '52px', fontSize: '2rem', borderRadius: '12px', border: '1px solid rgba(148, 163, 184, 0.45)', background: 'rgba(15, 23, 42, 0.7)', color: '#f8fafc', cursor: 'pointer' }}
          >
            ›
          </button>
          <button
            type="button"
            aria-label="Close preview"
            onClick={() => setActiveIndex(null)}
            style={{ position: 'absolute', top: '16px', right: '16px', width: '44px', height: '44px', fontSize: '1.8rem', borderRadius: '12px', border: '1px solid rgba(148, 163, 184, 0.45)', background: 'rgba(15, 23, 42, 0.7)', color: '#f8fafc', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
      )}

      <Footer />
    </div>
  );
}
