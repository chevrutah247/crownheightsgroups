'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ShareButtons from '@/components/ShareButtons';

interface UserInfo { name: string; email: string; role: 'user' | 'admin'; }
interface Hosting {
  id: string;
  hostName: string;
  shabbosDate: string;
  meals: string[];
  guestCount: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  dietary?: string;
  status: string;
  createdAt: string;
}

export default function ShabbosPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [hostings, setHostings] = useState<Hosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [hebrewDates, setHebrewDates] = useState<Record<string, string>>({});

  useEffect(() => {
    const token = localStorage.getItem('session_token');
    if (!token) return;
    fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    })
      .then(r => r.json())
      .then(data => { if (data.valid) setUser(data.user); else localStorage.clear(); })
      .catch(() => {});
  }, [router]);

  useEffect(() => {
    fetch('/api/shabbos-hosting')
      .then(r => r.json())
      .then(data => {
        const active = Array.isArray(data) ? data.filter((h: Hosting) => h.status === 'active') : [];
        setHostings(active);
        
        active.forEach((h: Hosting) => {
          if (h.shabbosDate) {
            const date = new Date(h.shabbosDate);
            fetch(`https://www.hebcal.com/converter?cfg=json&gy=${date.getFullYear()}&gm=${date.getMonth() + 1}&gd=${date.getDate()}&g2h=1`)
              .then(r => r.json())
              .then(data => {
                if (data.hebrew) {
                  setHebrewDates(prev => ({ ...prev, [h.id]: data.hebrew }));
                }
              })
              .catch(() => {});
          }
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => { localStorage.clear(); router.push('/auth/login'); };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  const getMealLabel = (mealId: string) => {
    const labels: Record<string, string> = {
      'friday-dinner': '🕯️ Friday Night',
      'saturday-lunch': '☀️ Shabbos Lunch',
      'seudah-shlishis': '🌅 Seudah Shlishis'
    };
    return labels[mealId] || mealId;
  };

  return (
    <div>
      <Header user={user} onLogout={handleLogout} />
      <main className="main">
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', color: '#c9a227', marginBottom: '0.5rem' }}>🕯️ Shabbos Hospitality</h1>
            <p style={{ color: '#666' }}>Find hosts or invite guests for Shabbos meals</p>
            <p style={{ color: '#c9a227', fontSize: '1.25rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
              {hostings.length} Host{hostings.length !== 1 ? 's' : ''} Available
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <Link 
              href="/add/shabbos"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: '#c9a227',
                color: 'white',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 'bold'
              }}
            >
              🏠 Host Guests
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div className="spinner"></div>
            </div>
          ) : hostings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: '#fffbeb', borderRadius: '12px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🕯️</div>
              <h3 style={{ color: '#92400e' }}>No Shabbos hosts available yet</h3>
              <p style={{ color: '#666', marginTop: '0.5rem' }}>Be the first to open your home!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {hostings.map(hosting => (
                <div
                  key={hosting.id}
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                    border: '2px solid #fef3c7'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                    <div>
                      <h2 style={{ margin: '0 0 0.25rem 0', color: '#1e3a5f', fontSize: '1.25rem' }}>
                        {hosting.hostName}
                      </h2>
                      {hosting.address && (
                        <div style={{ color: '#666', fontSize: '0.9rem' }}>📍 {hosting.address}</div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        background: '#fef3c7', 
                        color: '#92400e', 
                        padding: '0.5rem 1rem', 
                        borderRadius: '8px',
                        fontWeight: 'bold'
                      }}>
                        {formatDate(hosting.shabbosDate)}
                      </div>
                      {hebrewDates[hosting.id] && (
                        <div style={{ fontSize: '0.85rem', color: '#c9a227', marginTop: '0.25rem' }}>
                          ✡️ {hebrewDates[hosting.id]}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontWeight: 'bold', color: '#475569', marginBottom: '0.5rem' }}>Meals offered:</div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {hosting.meals.map(meal => (
                        <span 
                          key={meal}
                          style={{
                            background: '#f0fdf4',
                            color: '#166534',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.85rem'
                          }}
                        >
                          {getMealLabel(meal)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    gap: '1rem', 
                    flexWrap: 'wrap',
                    padding: '1rem',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    marginBottom: '1rem'
                  }}>
                    <div>
                      <span style={{ color: '#666', fontSize: '0.85rem' }}>Guests: </span>
                      <strong>{hosting.guestCount}</strong>
                    </div>
                    {hosting.dietary && (
                      <div>
                        <span style={{ color: '#666', fontSize: '0.85rem' }}>Dietary: </span>
                        <strong>{hosting.dietary}</strong>
                      </div>
                    )}
                  </div>

                  {hosting.description && (
                    <p style={{ color: '#666', marginBottom: '1rem' }}>{hosting.description}</p>
                  )}

                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    {hosting.phone && (
                      <a
                        href={`tel:${hosting.phone}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.75rem 1.5rem',
                          background: '#25D366',
                          color: 'white',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          fontWeight: 'bold'
                        }}
                      >
                        📞 {hosting.phone}
                      </a>
                    )}
                    {hosting.email && (
                      <a
                        href={`mailto:${hosting.email}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.75rem 1.5rem',
                          background: '#2563eb',
                          color: 'white',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          fontWeight: 'bold'
                        }}
                      >
                        ✉️ Email
                      </a>
                    )}
                  </div>

                  <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                    <ShareButtons 
                      title={`Shabbos Hosting by ${hosting.hostName}`} 
                      description={`${formatDate(hosting.shabbosDate)} - ${hosting.meals.map(m => getMealLabel(m)).join(', ')}. ${hosting.description || ''}`} 
                      url={`https://crownheightsgroups.com/shabbos`}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ 
            marginTop: '3rem', 
            padding: '1.5rem', 
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', 
            borderRadius: '16px',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#92400e' }}>🕯️ Good Shabbos!</h3>
            <p style={{ margin: 0, color: '#78350f', fontSize: '0.9rem' }}>
              Opening your home for Shabbos guests is a beautiful mitzvah
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
