'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EmergencyBar from '@/components/EmergencyBar';

interface UserInfo { name: string; email: string; role: 'user' | 'admin'; }
interface Category { id: string; name: string; nameRu?: string; icon: string; slug: string; order?: number; }
interface Service { 
  id: string; name: string; phone: string; categoryId: string; 
  description?: string; address?: string; website?: string;
  isPinned?: boolean; status?: string; imageUrl?: string; logoUrl?: string;
  email?: string; languages?: string[];
}

// Featured services data (pinned at top)
const featuredServices = [
  {
    id: 'featured-nyscreens',
    name: 'NY Screens',
    description: 'Digital advertising on screens in Crown Heights, Boro Park, Williamsburg',
    descriptionRu: 'Реклама на мониторах в Кроун Хайтс, Боро Парк, Вильямсбург',
    website: 'https://www.nyscreens.com/',
    logoUrl: '/images/nyscreens-logo.png',
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    cta: 'Contact for Advertising',
    ctaRu: 'Связаться по рекламе',
    languages: ['en', 'he', 'yi'],
  },
  {
    id: 'featured-retaildigitals',
    name: 'Retail Digitals',
    description: 'ESL - Electronic Shelf Label System for retail stores',
    descriptionRu: 'ESL - система электронных ценников для магазинов',
    website: 'https://retaildigitals.com/',
    logoUrl: '/images/retaildigitals-logo.png',
    gradient: 'linear-gradient(135deg, #0f4c75 0%, #3282b8 100%)',
    cta: 'Learn More',
    ctaRu: 'Подробнее',
    languages: ['en'],
  },
  {
    id: 'featured-bustoohel',
    name: 'Bus to Ohel',
    description: 'Bus service to the Ohel. Check schedule online!',
    descriptionRu: 'Автобус к Оэлу. Проверьте расписание онлайн!',
    website: 'https://bustoohel.com/',
    logoUrl: '/images/bustoohel-logo.png',
    gradient: 'linear-gradient(135deg, #2d3436 0%, #636e72 100%)',
    cta: 'Check Schedule',
    ctaRu: 'Проверить расписание',
    languages: ['en', 'he'],
  },
  {
    id: 'featured-merkazstam',
    name: 'Merkaz Stam',
    description: 'Books (Russian, English, Hebrew), Tzitzit, Mezuzot, Tallitot. Tallit inspection available.',
    descriptionRu: 'Книги (рус, англ, иврит), цицит, мезузы, талиты. Проверка талита.',
    website: 'https://merkazstam.com/',
    logoUrl: '/images/merkazstam-logo.png',
    gradient: 'linear-gradient(135deg, #5f0a87 0%, #a4508b 100%)',
    cta: 'Visit Store',
    ctaRu: 'Посетить магазин',
    languages: ['en', 'ru', 'he'],
  },
  {
    id: 'featured-friendsofrefugees',
    name: 'Friends of Refugees Publishing',
    description: 'Religious literature in Russian: Siddurim, Machzorim, and more',
    descriptionRu: 'Религиозная литература на русском: сидуры, махзоры и другое',
    website: 'https://www.friendsofrefugees.org/programs/publishing/',
    logoUrl: '/images/friendsofrefugees-logo.png',
    gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    cta: 'Browse Books',
    ctaRu: 'Смотреть книги',
    languages: ['ru'],
  },
];

const languageFlags: Record<string, string> = {
  en: '🇺🇸',
  ru: '🇷🇺',
  he: '🇮🇱',
  yi: '🕎',
};

export default function ServicesPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showRussian, setShowRussian] = useState(false);

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
    const pinned = result.filter(s => s.isPinned);
    const regular = result.filter(s => !s.isPinned).sort((a, b) => a.name.localeCompare(b.name));
    setFilteredServices([...pinned, ...regular]);
  }, [allServices, selectedCategory, searchQuery]);

  const handleLogout = () => { localStorage.clear(); window.location.href = '/auth/login'; };
  const getCat = (id: string) => categories.find(c => c.id === id);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '50px', height: '50px', border: '4px solid #e5e7eb', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ color: '#6b7280' }}>Loading services...</p>
      </div>
      <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <EmergencyBar />
      <Header user={user} onLogout={handleLogout} />
      
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '0.5rem' }}>
            🔧 Local Services
          </h1>
          <p style={{ color: '#6b7280', fontSize: '1.1rem', marginBottom: '1rem' }}>
            Find trusted professionals in Crown Heights
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/suggest-service" style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', 
              color: 'white', padding: '0.75rem 1.5rem', borderRadius: '50px', 
              textDecoration: 'none', fontWeight: '600', fontSize: '0.95rem',
              boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}>
              ➕ Suggest a Service
            </a>
            <button 
              onClick={() => setShowRussian(!showRussian)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: showRussian ? '#1e3a5f' : 'white',
                color: showRussian ? 'white' : '#1e3a5f',
                padding: '0.75rem 1.5rem', borderRadius: '50px',
                border: '2px solid #1e3a5f', fontWeight: '600', fontSize: '0.95rem',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              {showRussian ? '🇷🇺 Русский' : '🇺🇸 English'}
            </button>
          </div>
        </div>

        {/* Featured Services Banner */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ⭐ Featured Services
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {featuredServices.map((service) => (
              <a
                key={service.id}
                href={service.website}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  background: service.gradient,
                  borderRadius: '16px',
                  padding: '1.5rem',
                  color: 'white',
                  textDecoration: 'none',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
                }}
              >
                {/* Language badges */}
                <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.75rem' }}>
                  {service.languages.map(lang => (
                    <span key={lang} style={{ fontSize: '0.9rem' }}>{languageFlags[lang]}</span>
                  ))}
                </div>
                
                {/* Logo placeholder - will show if image exists */}
                <div style={{ 
                  width: '60px', height: '60px', 
                  background: 'rgba(255,255,255,0.2)', 
                  borderRadius: '12px', 
                  marginBottom: '1rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', fontWeight: 'bold'
                }}>
                  {service.name.charAt(0)}
                </div>
                
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  {service.name}
                </h3>
                <p style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '1rem', lineHeight: '1.5' }}>
                  {showRussian && service.descriptionRu ? service.descriptionRu : service.description}
                </p>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  background: 'rgba(255,255,255,0.2)',
                  padding: '0.5rem 1rem',
                  borderRadius: '25px',
                  fontSize: '0.85rem',
                  fontWeight: '600'
                }}>
                  {showRussian && service.ctaRu ? service.ctaRu : service.cta} →
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* TorahMates Banner */}
        <a 
          href="https://torahmates.org" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
            borderRadius: '16px',
            padding: '1.25rem 2rem',
            marginBottom: '2rem',
            color: 'white',
            textDecoration: 'none',
            boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '2.5rem' }}>📚</div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                {showRussian ? 'Хотите изучать Тору?' : 'Want to Learn Torah?'}
              </h3>
              <p style={{ opacity: 0.9, fontSize: '0.95rem' }}>
                {showRussian ? 'Бесплатное обучение один-на-один с партнёром' : 'Free one-on-one learning with a partner. Any level, any topic.'}
              </p>
            </div>
          </div>
          <span style={{
            background: '#fbbf24',
            color: '#1e3a5f',
            padding: '0.75rem 1.5rem',
            borderRadius: '50px',
            fontWeight: 'bold',
            fontSize: '0.95rem',
            whiteSpace: 'nowrap'
          }}>
            {showRussian ? 'Записаться бесплатно →' : 'Sign Up Free →'}
          </span>
        </a>

        {/* Search & Filter */}
        <div style={{ 
          background: 'white', 
          borderRadius: '16px', 
          padding: '1.5rem', 
          marginBottom: '2rem',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {/* Search */}
            <div style={{ flex: '1', minWidth: '250px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                🔍 {showRussian ? 'Поиск' : 'Search'}
              </label>
              <input
                type="text"
                placeholder={showRussian ? 'Имя, телефон...' : 'Search by name or phone...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
            
            {/* Category */}
            <div style={{ minWidth: '200px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                📁 {showRussian ? 'Категория' : 'Category'}
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  background: 'white',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="">{showRussian ? 'Все категории' : 'All Categories'}</option>
                {categories.sort((a, b) => (a.order || 0) - (b.order || 0)).map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {showRussian && cat.nameRu ? cat.nameRu : cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Services Count */}
        <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '0.95rem' }}>
          {filteredServices.length} {showRussian ? 'сервисов найдено' : 'services found'}
        </p>

        {/* Services Grid */}
        {filteredServices.length > 0 ? (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
            gap: '1.25rem' 
          }}>
            {filteredServices.map((service) => {
              const cat = getCat(service.categoryId);
              return (
                <div
                  key={service.id}
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    border: service.isPinned ? '2px solid #fbbf24' : '1px solid #f3f4f6',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.06)';
                  }}
                >
                  {/* Image */}
                  {service.imageUrl && (
                    <div style={{ 
                      height: '160px', 
                      background: `url(${service.imageUrl}) center/cover`,
                      borderBottom: '1px solid #f3f4f6'
                    }} />
                  )}
                  
                  {/* Content */}
                  <div style={{ padding: '1.25rem' }}>
                    {/* Top row: Featured badge + Category */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                      {service.isPinned && (
                        <span style={{
                          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                          color: '#78350f',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '50px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          ⭐ Featured
                        </span>
                      )}
                      {cat && (
                        <span style={{
                          background: '#f3f4f6',
                          color: '#4b5563',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '50px',
                          fontSize: '0.8rem',
                          fontWeight: '500'
                        }}>
                          {cat.icon} {showRussian && cat.nameRu ? cat.nameRu : cat.name}
                        </span>
                      )}
                    </div>

                    {/* Logo + Name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      {service.logoUrl && (
                        <img 
                          src={service.logoUrl} 
                          alt={service.name}
                          style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover' }}
                        />
                      )}
                      <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>
                        {service.name}
                      </h3>
                    </div>

                    {/* Description */}
                    {service.description && (
                      <p style={{ 
                        color: '#6b7280', 
                        fontSize: '0.9rem', 
                        lineHeight: '1.5',
                        marginBottom: '1rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {service.description}
                      </p>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {/* Phone - Primary CTA */}
                      <a
                        href={`tel:${service.phone.replace(/[^0-9+]/g, '')}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          padding: '0.875rem',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: 'white',
                          borderRadius: '12px',
                          textDecoration: 'none',
                          fontWeight: '600',
                          fontSize: '1rem',
                          transition: 'transform 0.2s'
                        }}
                      >
                        📞 {service.phone}
                      </a>

                      {/* Secondary actions row */}
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {service.email && (
                          <a
                            href={`mailto:${service.email}`}
                            style={{
                              flex: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.5rem',
                              padding: '0.625rem',
                              background: '#f3f4f6',
                              color: '#4b5563',
                              borderRadius: '10px',
                              textDecoration: 'none',
                              fontSize: '0.85rem',
                              fontWeight: '500'
                            }}
                          >
                            ✉️ Email
                          </a>
                        )}
                        {service.website && (
                          <a
                            href={service.website.startsWith('http') ? service.website : `https://${service.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              flex: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.5rem',
                              padding: '0.625rem',
                              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                              color: 'white',
                              borderRadius: '10px',
                              textDecoration: 'none',
                              fontSize: '0.85rem',
                              fontWeight: '500'
                            }}
                          >
                            🌐 Website
                          </a>
                        )}
                      </div>

                      {/* Address */}
                      {service.address && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.625rem 0.875rem',
                          background: '#fef3c7',
                          borderRadius: '10px',
                          fontSize: '0.85rem',
                          color: '#92400e'
                        }}>
                          📍 {service.address}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '4rem 2rem', 
            background: 'white', 
            borderRadius: '16px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              {showRussian ? 'Ничего не найдено' : 'No services found'}
            </h3>
            <p style={{ color: '#6b7280' }}>
              {showRussian ? 'Попробуйте изменить поиск или категорию' : 'Try adjusting your search or category filter'}
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
