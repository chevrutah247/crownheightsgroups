'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EmergencyBar from '@/components/EmergencyBar';
import type { PlaceInfo, Shul, ShulReview } from '@/lib/shuls-data';
import {
  crownHeightsMikvahs,
} from '@/lib/shuls-data';

interface UserInfo {
  name: string;
  email: string;
  role: 'user' | 'admin' | 'superadmin';
}

interface ReviewForm {
  authorName: string;
  authorEmail: string;
  rating: number;
  comment: string;
}

type TabId = 'ch-shuls' | 'mikvahs' | 'beit-midrash' | 'ohel';

const tabs: { id: TabId; label: string }[] = [
  { id: 'ch-shuls', label: 'Синагоги Crown Heights' },
  { id: 'mikvahs', label: 'Миквы Crown Heights' },
  { id: 'beit-midrash', label: 'Бейт Мидраш' },
  { id: 'ohel', label: 'Ohel' },
];

const blankForm: ReviewForm = {
  authorName: '',
  authorEmail: '',
  rating: 5,
  comment: '',
};

export default function ShulsPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [shuls, setShuls] = useState<Shul[]>([]);
  const [reviews, setReviews] = useState<ShulReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [formByShul, setFormByShul] = useState<Record<string, ReviewForm>>({});
  const [submittingFor, setSubmittingFor] = useState<string | null>(null);
  const [messageByShul, setMessageByShul] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<TabId>('ch-shuls');
  const [activeOhelIndex, setActiveOhelIndex] = useState<number | null>(null);

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
          setUser({
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
          });
        }
      } catch {
        // no-op
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [shulsRes, reviewsRes] = await Promise.all([
          fetch('/api/shuls'),
          fetch('/api/shul-reviews'),
        ]);
        const [shulsData, reviewsData] = await Promise.all([shulsRes.json(), reviewsRes.json()]);
        if (Array.isArray(shulsData)) setShuls(shulsData);
        if (Array.isArray(reviewsData)) setReviews(reviewsData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filteredShuls = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return shuls;

    return shuls.filter((shul) => {
      return [shul.name, shul.address, shul.phone || '', shul.crossStreets || '']
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [search, shuls]);

  const beitMidrashList = useMemo(() => {
    return shuls.filter((shul) => {
      const n = shul.name.toLowerCase();
      return n.includes('bais ') || n.includes('beis ') || n.includes('beit ') || n.includes('bais') || n.includes('beis');
    });
  }, [shuls]);

  const ohelPhotos = useMemo(() => {
    const fileNames = ['01.jpg', '02.jpg', '03.jpg', '04.jpg', '10.jpg', '11.jpg', '12.jpg', '13.jpg', '14.jpg', '15.jpg', '16.jpg', '17.jpg', '18.jpg', '19.jpg', '20.jpg'];
    return fileNames.map((fileName, i) => ({
      id: `ohel-${fileName.replace('.jpg', '')}`,
      src: `/images/ohel/${fileName}`,
      title: `Ohel - фото ${i + 1}`,
    }));
  }, []);

  const reviewsByShul = useMemo(() => {
    const grouped: Record<string, ShulReview[]> = {};
    for (const review of reviews) {
      if (!grouped[review.shulId]) grouped[review.shulId] = [];
      grouped[review.shulId].push(review);
    }
    return grouped;
  }, [reviews]);

  const getForm = (shulId: string): ReviewForm => {
    if (!formByShul[shulId]) {
      return {
        ...blankForm,
        authorName: user?.name || '',
        authorEmail: user?.email || '',
      };
    }
    return formByShul[shulId];
  };

  const updateForm = (shulId: string, patch: Partial<ReviewForm>) => {
    const current = getForm(shulId);
    setFormByShul((prev) => ({
      ...prev,
      [shulId]: { ...current, ...patch },
    }));
  };

  const submitReview = async (shulId: string) => {
    const form = getForm(shulId);

    if (!form.authorName.trim() || !form.comment.trim()) {
      setMessageByShul((prev) => ({
        ...prev,
        [shulId]: 'Name and review text are required.',
      }));
      return;
    }

    setSubmittingFor(shulId);
    setMessageByShul((prev) => ({ ...prev, [shulId]: '' }));

    try {
      const response = await fetch('/api/shul-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shulId,
          authorName: form.authorName,
          authorEmail: form.authorEmail,
          rating: form.rating,
          comment: form.comment,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'Failed to submit review');
      }

      setFormByShul((prev) => ({ ...prev, [shulId]: { ...blankForm, authorName: user?.name || '', authorEmail: user?.email || '' } }));
      setMessageByShul((prev) => ({
        ...prev,
        [shulId]: 'Thank you. Your review was submitted and is waiting for admin moderation.',
      }));
    } catch (error: any) {
      setMessageByShul((prev) => ({
        ...prev,
        [shulId]: error?.message || 'Failed to submit review',
      }));
    } finally {
      setSubmittingFor(null);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/auth/login';
  };

  const closeOhelLightbox = () => setActiveOhelIndex(null);
  const openOhelLightbox = (idx: number) => setActiveOhelIndex(idx);
  const showPrevOhelPhoto = () => {
    setActiveOhelIndex((prev) => {
      if (prev === null) return prev;
      return prev === 0 ? ohelPhotos.length - 1 : prev - 1;
    });
  };
  const showNextOhelPhoto = () => {
    setActiveOhelIndex((prev) => {
      if (prev === null) return prev;
      return prev === ohelPhotos.length - 1 ? 0 : prev + 1;
    });
  };

  useEffect(() => {
    if (activeOhelIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeOhelLightbox();
      if (event.key === 'ArrowLeft') showPrevOhelPhoto();
      if (event.key === 'ArrowRight') showNextOhelPhoto();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeOhelIndex, ohelPhotos.length]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <div className="loading"><div className="spinner" /></div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f8fafc 0%, #edf2f7 100%)' }}>
      <EmergencyBar />
      <Header user={user} onLogout={handleLogout} />

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem' }}>
        <section style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)', borderRadius: '20px', padding: '2rem', color: 'white', marginBottom: '1.5rem' }}>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>Еврейские места Краун Хайтс</h1>
          <p style={{ marginTop: '0.75rem', marginBottom: 0, opacity: 0.9 }}>
            Синагоги, миквы, Бейт Мидраш и архив Ohel.
          </p>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Badge text={`${shuls.length} синагог`} />
            <Badge text={`${crownHeightsMikvahs.length} миквы`} />
            <Badge text={`${ohelPhotos.length} фото Ohel`} />
          </div>
        </section>

        <section style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '1rem' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                border: '1px solid #cbd5e1',
                background: activeTab === tab.id ? '#1d4ed8' : 'white',
                color: activeTab === tab.id ? 'white' : '#334155',
                borderRadius: '999px',
                padding: '0.45rem 0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </section>

        {activeTab === 'ch-shuls' && (
          <>
            <div style={{ marginBottom: '1.25rem' }}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск по названию, адресу, телефону"
                style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
              />
            </div>

            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
              {filteredShuls.map((shul) => {
                const shulReviews = (reviewsByShul[shul.id] || []).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
                const average = shulReviews.length
                  ? (shulReviews.reduce((sum, current) => sum + current.rating, 0) / shulReviews.length).toFixed(1)
                  : null;
                const expanded = expandedId === shul.id;
                const form = getForm(shul.id);

                return (
                  <article key={shul.id} style={cardStyle}>
                    {(shul.entranceImageUrl || shul.interiorImageUrl) && (
                      <div style={{ display: 'grid', gridTemplateColumns: shul.entranceImageUrl && shul.interiorImageUrl ? '1fr 1fr' : '1fr', gap: '2px', background: '#f1f5f9' }}>
                        {shul.entranceImageUrl && <img src={shul.entranceImageUrl} alt={`${shul.name} entrance`} style={imageStyle} loading="lazy" />}
                        {shul.interiorImageUrl && <img src={shul.interiorImageUrl} alt={`${shul.name} interior`} style={imageStyle} loading="lazy" />}
                      </div>
                    )}

                    <div style={{ padding: '1rem' }}>
                      <h2 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1.15rem' }}>{shul.name}</h2>
                      <p style={{ margin: '0 0 0.4rem', color: '#334155' }}>📍 {shul.address}</p>
                      {shul.crossStreets && <p style={{ margin: '0 0 0.4rem', color: '#475569', fontSize: '0.95rem' }}>Cross streets: {shul.crossStreets}</p>}
                      {shul.phone && (
                        <p style={{ margin: '0 0 0.4rem' }}>
                          ☎️ <a href={`tel:${shul.phone.replace(/[^0-9+]/g, '')}`} style={{ color: '#0f766e', textDecoration: 'none' }}>{shul.phone}</a>
                        </p>
                      )}
                      {shul.contactName && <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem' }}>Контакт: {shul.contactName}</p>}

                      <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={pillTeal}>{shulReviews.length} reviews</span>
                        {average && <span style={pillAmber}>{average}/5 avg</span>}
                      </div>

                      <button
                        onClick={() => setExpandedId(expanded ? null : shul.id)}
                        style={{ marginTop: '0.9rem', width: '100%', border: '1px solid #cbd5e1', background: expanded ? '#f8fafc' : 'white', borderRadius: '10px', padding: '0.55rem 0.75rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        {expanded ? 'Скрыть отзывы' : 'Открыть отзывы и оставить отзыв'}
                      </button>

                      {expanded && (
                        <div style={{ marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.9rem' }}>
                          <h3 style={{ marginTop: 0, marginBottom: '0.6rem', fontSize: '1rem' }}>Approved reviews</h3>
                          {shulReviews.length === 0 ? (
                            <p style={{ marginTop: 0, color: '#64748b' }}>No approved reviews yet.</p>
                          ) : (
                            <div style={{ display: 'grid', gap: '0.6rem', marginBottom: '1rem' }}>
                              {shulReviews.slice(0, 4).map((review) => (
                                <div key={review.id} style={{ background: '#f8fafc', borderRadius: '10px', padding: '0.7rem', border: '1px solid #e2e8f0' }}>
                                  <p style={{ margin: 0, fontWeight: 600 }}>{review.authorName} · {'⭐'.repeat(review.rating)}</p>
                                  <p style={{ margin: '0.35rem 0 0', color: '#334155' }}>{review.comment}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          <h3 style={{ marginTop: 0, marginBottom: '0.6rem', fontSize: '1rem' }}>Оставить отзыв (после модерации админом)</h3>
                          <div style={{ display: 'grid', gap: '0.55rem' }}>
                            <input placeholder="Имя" value={form.authorName} onChange={(e) => updateForm(shul.id, { authorName: e.target.value })} style={inputStyle} />
                            <input placeholder="Email (необязательно)" value={form.authorEmail} onChange={(e) => updateForm(shul.id, { authorEmail: e.target.value })} style={inputStyle} />
                            <select value={String(form.rating)} onChange={(e) => updateForm(shul.id, { rating: Number(e.target.value) })} style={inputStyle}>
                              {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} stars</option>)}
                            </select>
                            <textarea placeholder="Ваш отзыв" value={form.comment} onChange={(e) => updateForm(shul.id, { comment: e.target.value })} rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
                            <button onClick={() => submitReview(shul.id)} disabled={submittingFor === shul.id} style={{ border: 'none', background: submittingFor === shul.id ? '#94a3b8' : '#1d4ed8', color: 'white', borderRadius: '10px', padding: '0.65rem 0.9rem', fontWeight: 700, cursor: submittingFor === shul.id ? 'wait' : 'pointer' }}>
                              {submittingFor === shul.id ? 'Submitting...' : 'Отправить отзыв'}
                            </button>
                            {messageByShul[shul.id] && <p style={{ margin: 0, color: '#0f766e', fontSize: '0.9rem' }}>{messageByShul[shul.id]}</p>}
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </section>
          </>
        )}

        {activeTab === 'mikvahs' && (
          <section style={gridStyle}>
            {crownHeightsMikvahs.map((m) => (
              <PlaceCard key={m.id} place={m} />
            ))}
          </section>
        )}

        {activeTab === 'beit-midrash' && (
          <section style={gridStyle}>
            {beitMidrashList.map((shul) => (
              <article key={shul.id} style={cardStyle}>
                <div style={{ padding: '1rem' }}>
                  <h2 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1.1rem' }}>{shul.name}</h2>
                  <p style={{ margin: '0 0 0.4rem', color: '#334155' }}>📍 {shul.address}</p>
                  {shul.phone && <p style={{ margin: 0 }}>☎️ {shul.phone}</p>}
                </div>
              </article>
            ))}
          </section>
        )}

        {activeTab === 'ohel' && (
          <section className="ohel-section">
            <div className="ohel-header">
              <div>
                <h2 className="ohel-title">Фотоархив Ohel</h2>
                <p className="ohel-subtitle">Современная галерея с полноэкранным просмотром. Нажмите на фото.</p>
              </div>
              <div className="ohel-counter">{ohelPhotos.length} фото</div>
            </div>

            <div className="ohel-grid">
              {ohelPhotos.map((photo, idx) => (
                <button
                  key={photo.id}
                  type="button"
                  className="ohel-card"
                  onClick={() => openOhelLightbox(idx)}
                >
                  <img src={photo.src} alt={photo.title} className="ohel-image" loading="lazy" />
                  <div className="ohel-overlay">
                    <span className="ohel-chip">{photo.title}</span>
                    <span className="ohel-chip subtle">Открыть</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}
      </main>

      {activeOhelIndex !== null && (
        <div className="ohel-lightbox" onClick={closeOhelLightbox}>
          <button type="button" className="ohel-close" onClick={closeOhelLightbox} aria-label="Close preview">×</button>
          <button type="button" className="ohel-nav prev" onClick={(e) => { e.stopPropagation(); showPrevOhelPhoto(); }} aria-label="Previous photo">‹</button>
          <div className="ohel-stage" onClick={(e) => e.stopPropagation()}>
            <img src={ohelPhotos[activeOhelIndex].src} alt={ohelPhotos[activeOhelIndex].title} className="ohel-stage-image" />
            <div className="ohel-stage-caption">
              <span>{ohelPhotos[activeOhelIndex].title}</span>
              <span>{activeOhelIndex + 1} / {ohelPhotos.length}</span>
            </div>
          </div>
          <button type="button" className="ohel-nav next" onClick={(e) => { e.stopPropagation(); showNextOhelPhoto(); }} aria-label="Next photo">›</button>
        </div>
      )}

      <style jsx>{`
        .ohel-section {
          border-radius: 20px;
          padding: 1rem;
          background:
            radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.16), transparent 40%),
            radial-gradient(circle at 90% 80%, rgba(16, 185, 129, 0.14), transparent 45%),
            #ffffff;
          border: 1px solid #dbeafe;
        }
        .ohel-header {
          display: flex;
          gap: 1rem;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }
        .ohel-title {
          margin: 0;
          font-size: 1.5rem;
          color: #0f172a;
          letter-spacing: 0.01em;
        }
        .ohel-subtitle {
          margin: 0.45rem 0 0;
          color: #334155;
        }
        .ohel-counter {
          background: linear-gradient(135deg, #1d4ed8, #0ea5e9);
          color: white;
          border-radius: 999px;
          padding: 0.45rem 0.8rem;
          font-weight: 700;
          font-size: 0.9rem;
        }
        .ohel-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 0.9rem;
        }
        .ohel-card {
          position: relative;
          border: none;
          padding: 0;
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          background: #0f172a;
          text-align: left;
          box-shadow: 0 10px 28px rgba(15, 23, 42, 0.2);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .ohel-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 36px rgba(15, 23, 42, 0.3);
        }
        .ohel-image {
          width: 100%;
          height: 240px;
          object-fit: cover;
          display: block;
          transition: transform 0.35s ease;
        }
        .ohel-card:hover .ohel-image {
          transform: scale(1.04);
        }
        .ohel-overlay {
          position: absolute;
          inset: auto 0 0 0;
          padding: 0.7rem;
          display: flex;
          justify-content: space-between;
          gap: 0.4rem;
          align-items: center;
          background: linear-gradient(to top, rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.08));
        }
        .ohel-chip {
          background: rgba(255, 255, 255, 0.92);
          color: #0f172a;
          border-radius: 999px;
          padding: 0.24rem 0.62rem;
          font-size: 0.8rem;
          font-weight: 600;
          white-space: nowrap;
        }
        .ohel-chip.subtle {
          background: rgba(14, 165, 233, 0.9);
          color: white;
        }
        .ohel-lightbox {
          position: fixed;
          inset: 0;
          z-index: 1000;
          background: rgba(2, 6, 23, 0.86);
          backdrop-filter: blur(4px);
          display: grid;
          grid-template-columns: 64px minmax(0, 1fr) 64px;
          align-items: center;
          padding: 1rem;
          gap: 0.75rem;
        }
        .ohel-stage {
          max-width: 1100px;
          width: 100%;
          margin: 0 auto;
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid rgba(148, 163, 184, 0.4);
          background: #020617;
          box-shadow: 0 28px 60px rgba(0, 0, 0, 0.45);
        }
        .ohel-stage-image {
          width: 100%;
          max-height: calc(100vh - 160px);
          object-fit: contain;
          display: block;
          background: #020617;
        }
        .ohel-stage-caption {
          color: #e2e8f0;
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.7rem 0.9rem;
          background: rgba(15, 23, 42, 0.85);
          font-size: 0.9rem;
        }
        .ohel-nav, .ohel-close {
          border: 1px solid rgba(148, 163, 184, 0.45);
          background: rgba(15, 23, 42, 0.7);
          color: #f8fafc;
          border-radius: 12px;
          cursor: pointer;
        }
        .ohel-nav {
          width: 52px;
          height: 52px;
          font-size: 2rem;
          line-height: 1;
          display: grid;
          place-items: center;
        }
        .ohel-close {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 44px;
          height: 44px;
          font-size: 1.8rem;
          line-height: 1;
          z-index: 1001;
        }
        @media (max-width: 900px) {
          .ohel-lightbox {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }
          .ohel-nav {
            position: fixed;
            bottom: 14px;
            width: 46px;
            height: 46px;
            border-radius: 999px;
          }
          .ohel-nav.prev { left: 14px; }
          .ohel-nav.next { right: 14px; }
          .ohel-stage-image {
            max-height: calc(100vh - 220px);
          }
        }
      `}</style>

      <Footer />
    </div>
  );
}

function Badge({ text }: { text: string }) {
  return <div style={{ background: 'rgba(255,255,255,0.14)', borderRadius: '12px', padding: '0.7rem 1rem' }}>{text}</div>;
}

function PlaceCard({ place }: { place: PlaceInfo }) {
  return (
    <article style={cardStyle}>
      <div style={{ padding: '1rem' }}>
        <h2 style={{ marginTop: 0, marginBottom: '0.55rem', fontSize: '1.15rem' }}>{place.name}</h2>
        <p style={{ margin: '0 0 0.4rem', color: '#334155' }}>📍 {place.address}</p>
        {place.phone && <p style={{ margin: '0 0 0.35rem' }}>☎️ {place.phone}</p>}
        {place.email && <p style={{ margin: '0 0 0.35rem' }}>✉️ {place.email}</p>}
        {place.website && (
          <p style={{ margin: '0 0 0.35rem' }}>
            🌐 <a href={place.website} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'none' }}>{place.website}</a>
          </p>
        )}
        {place.notes && <p style={{ margin: '0 0 0.35rem', color: '#475569' }}>{place.notes}</p>}
        {place.sourceUrl && (
          <a href={place.sourceUrl} target="_blank" rel="noreferrer" style={{ color: '#0f766e', textDecoration: 'none', fontSize: '0.9rem' }}>
            source
          </a>
        )}
      </div>
    </article>
  );
}

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  gap: '1rem',
};

const cardStyle: CSSProperties = {
  background: 'white',
  borderRadius: '16px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 8px 22px rgba(15, 23, 42, 0.06)',
  overflow: 'hidden',
};

const imageStyle: CSSProperties = {
  width: '100%',
  height: '180px',
  objectFit: 'cover',
};

const pillTeal: CSSProperties = {
  background: '#ecfeff',
  color: '#0f766e',
  borderRadius: '999px',
  padding: '0.25rem 0.6rem',
  fontSize: '0.84rem',
};

const pillAmber: CSSProperties = {
  background: '#fffbeb',
  color: '#92400e',
  borderRadius: '999px',
  padding: '0.25rem 0.6rem',
  fontSize: '0.84rem',
};

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '0.6rem 0.75rem',
  borderRadius: '9px',
  border: '1px solid #cbd5e1',
  fontSize: '0.95rem',
};
