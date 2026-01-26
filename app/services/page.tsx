'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EmergencyBar from '@/components/EmergencyBar';

interface ServiceCategory { id: string; name: string; nameRu?: string; icon: string; slug: string; order?: number; }
interface Service { id: string; name: string; phone: string; secondPhone?: string; address?: string; website?: string; logo?: string; categoryId: string; description?: string; languages?: string[]; isPinned?: boolean; avgRating?: number; reviewCount?: number; }
interface Review { id: string; serviceId: string; userName: string; rating: number; comment: string; createdAt: string; }

export default function ServicesPage() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('session_token');
    if (!token) { window.location.href = '/auth/login'; return; }
    try {
      const res = await fetch('/api/auth/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) });
      const data = await res.json();
      if (data.valid) { setUser(data.user); }
      else { window.location.href = '/auth/login'; }
    } catch (e) { window.location.href = '/auth/login'; }
  };

  const fetchData = async () => {
    try {
      const [catRes, svcRes, revRes] = await Promise.all([
        fetch('/api/admin/service-categories'),
        fetch('/api/admin/services'),
        fetch('/api/reviews')
      ]);
      setCategories(Array.isArray(await catRes.json()) ? await catRes.clone().json() : []);
      setServices(Array.isArray(await svcRes.json()) ? await svcRes.clone().json() : []);
      setReviews(Array.isArray(await revRes.json()) ? await revRes.clone().json() : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleLogout = () => { localStorage.clear(); window.location.href = '/auth/login'; };

  const openReviewModal = (service: Service) => {
    setSelectedService(service);
    setReviewForm({ rating: 5, comment: '' });
    setShowReviewModal(true);
  };

  const submitReview = async () => {
    if (!selectedService || !user) return;
    setSubmitting(true);
    try {
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedService.id,
          userName: user.name,
          userEmail: user.email,
          rating: reviewForm.rating,
          comment: reviewForm.comment
        })
      });
      setShowReviewModal(false);
      fetchData();
    } catch (e) { alert('Error submitting review'); }
    finally { setSubmitting(false); }
  };

  const renderStars = (rating: number, interactive = false, onChange?: (r: number) => void) => {
    return (
      <div style={{ display: 'flex', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            onClick={() => interactive && onChange && onChange(star)}
            style={{ cursor: interactive ? 'pointer' : 'default', fontSize: '1.2rem', color: star <= rating ? '#f59e0b' : '#ddd' }}
          >★</span>
        ))}
      </div>
    );
  };

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
          <a href="/suggest-service" style={{ display: 'inline-block', marginTop: '1rem', padding: '0.75rem 1.5rem', background: '#10b981', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>+ Suggest a Service</a>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
          <button onClick={() => setSelectedCategory('')} style={{ padding: '0.5rem 1rem', borderRadius: '20px', border: 'none', background: !selectedCategory ? '#2563eb' : '#e5e7eb', color: !selectedCategory ? 'white' : '#333', cursor: 'pointer', fontWeight: !selectedCategory ? 'bold' : 'normal' }}>All</button>
          {categories.sort((a, b) => (a.order || 0) - (b.order || 0)).map(cat => (
            <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} style={{ padding: '0.5rem 1rem', borderRadius: '20px', border: 'none', background: selectedCategory === cat.id ? '#2563eb' : '#e5e7eb', color: selectedCategory === cat.id ? 'white' : '#333', cursor: 'pointer', fontWeight: selectedCategory === cat.id ? 'bold' : 'normal' }}>{cat.icon} {cat.name}</button>
          ))}
        </div>

        {/* Services Grid */}
        {sortedServices.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
            {sortedServices.map(service => {
              const cat = categories.find(c => c.id === service.categoryId);
              const serviceReviews = reviews.filter(r => r.serviceId === service.id);
              return (
                <div key={service.id} style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: service.isPinned ? '2px solid #f59e0b' : '1px solid #eee' }}>
                  {service.isPinned && <div style={{ color: '#f59e0b', fontSize: '0.8rem', marginBottom: '0.5rem' }}>⭐ Featured</div>}
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    {service.logo ? <img src={service.logo} alt="" style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} /> : <div style={{ width: '50px', height: '50px', borderRadius: '8px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>{cat?.icon || '🔧'}</div>}
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{service.name}</h3>
                      <p style={{ margin: 0, color: '#666', fontSize: '0.85rem' }}>{cat?.name}</p>
                      {service.avgRating && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                          {renderStars(Math.round(service.avgRating))}
                          <span style={{ fontSize: '0.8rem', color: '#666' }}>({service.reviewCount})</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {service.description && <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>{service.description}</p>}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                    <a href={`tel:${service.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2563eb', textDecoration: 'none', fontWeight: 'bold' }}>📞 {service.phone}</a>
                    {service.secondPhone && <a href={`tel:${service.secondPhone}`} style={{ color: '#2563eb', textDecoration: 'none' }}>📞 {service.secondPhone}</a>}
                    {service.address && <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>📍 {service.address}</p>}
                    {service.website && <a href={service.website.startsWith('http') ? service.website : `https://${service.website}`} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'none', fontSize: '0.9rem' }}>🌐 Website</a>}
                  </div>

                  {service.languages && service.languages.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                      {service.languages.map(lang => <span key={lang} style={{ padding: '2px 8px', background: '#f3f4f6', borderRadius: '4px', fontSize: '0.75rem' }}>{lang}</span>)}
                    </div>
                  )}

                  <button onClick={() => openReviewModal(service)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #2563eb', borderRadius: '8px', background: 'white', color: '#2563eb', cursor: 'pointer' }}>
                    ✍️ Write a Review
                  </button>

                  {/* Show recent reviews */}
                  {serviceReviews.length > 0 && (
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Recent Reviews:</div>
                      {serviceReviews.slice(0, 2).map(review => (
                        <div key={review.id} style={{ marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <strong>{review.userName}</strong>
                            {renderStars(review.rating)}
                          </div>
                          {review.comment && <p style={{ margin: '0.25rem 0 0 0', color: '#666' }}>{review.comment}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}><p>No services found</p></div>
        )}
      </main>
      <Footer />

      {/* Review Modal */}
      {showReviewModal && selectedService && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', width: '90%', maxWidth: '400px' }}>
            <h2 style={{ marginTop: 0 }}>Review {selectedService.name}</h2>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Rating</label>
              {renderStars(reviewForm.rating, true, (r) => setReviewForm({ ...reviewForm, rating: r }))}
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Comment (optional)</label>
              <textarea value={reviewForm.comment} onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })} placeholder="Share your experience..." rows={3} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }} />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setShowReviewModal(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>Cancel</button>
              <button onClick={submitReview} disabled={submitting} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', background: submitting ? '#ccc' : '#2563eb', color: 'white', cursor: submitting ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>{submitting ? 'Submitting...' : 'Submit'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
