'use client';

import { useState, useEffect } from 'react';
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
  {
    id: 'featured-showerdoor',
    name: 'Crown Heights Shower Door',
    description: 'Custom glass shower doors, mirrors, window repair. Quality craftsmanship.',
    descriptionRu: 'Стеклянные душевые двери на заказ, зеркала, ремонт окон.',
    website: 'https://nyglassdoors.com',
    logoUrl: '/images/showerdoor-logo.png',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    cta: 'Get a Quote',
    ctaRu: 'Получить расчёт',
    languages: ['en', 'ru', 'he'],
    phone: 'contact@nyglassdoors.com',
  },
  {
    id: 'featured-hfls',
    name: 'Hebrew Free Loan Society',
    description: 'Interest-free loans since 1892. Improving lives through lending.',
    descriptionRu: 'Беспроцентные займы с 1892 года. Улучшаем жизни через кредитование.',
    website: 'https://hfls.org',
    logoUrl: '/images/hfls-logo.png',
    gradient: 'linear-gradient(135deg, #f5af19 0%, #f12711 100%)',
    cta: 'Apply Now',
    ctaRu: 'Подать заявку',
    languages: ['en'],
    phone: '(212) 687-0188',
  },
  {
    id: 'featured-taxi',
    name: 'Crown Heights Taxi',
    description: 'Airport transfers, local rides, long distance. Available 24/7.',
    descriptionRu: 'Трансферы в аэропорт, местные поездки, дальние расстояния. 24/7.',
    website: '',
    logoUrl: '/images/taxi-logo.png',
    gradient: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
    cta: 'Call Now',
    ctaRu: 'Позвонить',
    languages: ['en', 'ru', 'he'],
    phone: '718-663-4444',
  },
];

const languageFlags: Record<string, string> = {
  en: '🇺🇸',
  ru: '🇷🇺',
  he: '🇮🇱',
  yi: '🕎',
};

// Color gradients for service cards based on category
const categoryGradients: Record<string, string> = {
  '1': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Plumber
  '2': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Electrician
  '3': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Taxi
  '4': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // SIM Cards
  '5': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', // Notary
  '6': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', // Locksmith
  '7': 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', // Musicians
  '8': 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', // Tile
  '9': 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)', // Glass
  '10': 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)', // Painter
  '11': 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)', // Carpenter
  '12': 'linear-gradient(135deg, #48c6ef 0%, #6f86d6 100%)', // HVAC
  '13': 'linear-gradient(135deg, #feada6 0%, #f5efef 100%)', // Cleaning
  '14': 'linear-gradient(135deg, #a8caba 0%, #5d4157 100%)', // Moving
  '15': 'linear-gradient(135deg, #ff8177 0%, #cf556c 100%)', // Handyman
  'default': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '60px', height: '60px', border: '4px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ color: 'white', fontSize: '1.1rem' }}>Loading services...</p>
      </div>
      <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      <EmergencyBar />
      <Header user={user} onLogout={handleLogout} />
      
      <main style={{ maxWidth: '1300px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Page Header */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '2.5rem',
          background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)',
          borderRadius: '24px',
          padding: '3rem 2rem',
          color: 'white',
          boxShadow: '0 20px 60px rgba(30, 58, 95, 0.3)'
        }}>
          <h1 style={{ fontSize: '2.75rem', fontWeight: '800', marginBottom: '0.75rem', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
            🔧 Local Services
          </h1>
          <p style={{ fontSize: '1.15rem', opacity: 0.9, marginBottom: '1.5rem' }}>
            {showRussian ? 'Найдите проверенных специалистов в нашем сообществе' : 'Find trusted professionals in Crown Heights'}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/suggest-service" style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', 
              color: 'white', padding: '0.875rem 1.75rem', borderRadius: '50px', 
              textDecoration: 'none', fontWeight: '700', fontSize: '1rem',
              boxShadow: '0 4px 20px rgba(34, 197, 94, 0.4)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}>
              ➕ {showRussian ? 'Предложить сервис' : 'Suggest a Service'}
            </a>
            <button 
              onClick={() => setShowRussian(!showRussian)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: showRussian ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.15)',
                color: showRussian ? '#1e3a5f' : 'white',
                padding: '0.875rem 1.75rem', borderRadius: '50px',
                border: '2px solid rgba(255,255,255,0.3)', fontWeight: '700', fontSize: '1rem',
                cursor: 'pointer', transition: 'all 0.2s',
                backdropFilter: 'blur(10px)'
              }}
            >
              {showRussian ? '🇷🇺 Русский' : '🇺🇸 English'}
            </button>
          </div>
        </div>

        {/* Featured Services */}
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '700', 
            color: '#1e3a5f', 
            marginBottom: '1.25rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            paddingLeft: '0.5rem'
          }}>
            ⭐ {showRussian ? 'Рекомендуемые сервисы' : 'Featured Services'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {featuredServices.map((service: any) => (
              <a
                key={service.id}
                href={service.website || (service.phone ? `tel:${service.phone.replace(/[^0-9+]/g, '')}` : '#')}
                target={service.website ? "_blank" : "_self"}
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  background: service.gradient,
                  borderRadius: '20px',
                  padding: '1.5rem',
                  color: 'white',
                  textDecoration: 'none',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                  position: 'relative',
                  overflow: 'hidden',
                  minHeight: '220px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.15)';
                }}
              >
                {/* Decorative circle */}
                <div style={{
                  position: 'absolute',
                  top: '-30px',
                  right: '-30px',
                  width: '120px',
                  height: '120px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '50%'
                }} />
                
                {/* Language badges */}
                <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.75rem' }}>
                  {service.languages.map((lang: string) => (
                    <span key={lang} style={{ 
                      fontSize: '0.85rem',
                      background: 'rgba(255,255,255,0.2)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '6px'
                    }}>{languageFlags[lang]}</span>
                  ))}
                </div>
                
                {/* Logo */}
                <div style={{ 
                  width: '56px', height: '56px', 
                  background: 'rgba(255,255,255,0.95)', 
                  borderRadius: '14px', 
                  marginBottom: '1rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                  overflow: 'hidden'
                }}>
                  {service.logoUrl ? (
                    <img src={service.logoUrl} alt={service.name} style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                  ) : (
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333' }}>{service.name.charAt(0)}</span>
                  )}
                </div>
                
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                  {service.name}
                </h3>
                <p style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: 'auto', lineHeight: '1.5', flex: 1 }}>
                  {showRussian && service.descriptionRu ? service.descriptionRu : service.description}
                </p>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  background: 'rgba(255,255,255,0.25)',
                  padding: '0.6rem 1.25rem',
                  borderRadius: '30px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  marginTop: '1rem',
                  alignSelf: 'flex-start',
                  backdropFilter: 'blur(10px)'
                }}>
                  {service.phone && !service.website ? (
                    <>📞 {service.phone}</>
                  ) : (
                    <>{showRussian && service.ctaRu ? service.ctaRu : service.cta} →</>
                  )}
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
            background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
            borderRadius: '20px',
            padding: '1.5rem 2rem',
            marginBottom: '2.5rem',
            color: 'white',
            textDecoration: 'none',
            boxShadow: '0 10px 40px rgba(59, 130, 246, 0.35)',
            flexWrap: 'wrap',
            gap: '1rem',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '100px',
            width: '200px',
            height: '200px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%'
          }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', position: 'relative' }}>
            <div style={{ 
              fontSize: '3rem',
              background: 'rgba(255,255,255,0.2)',
              padding: '0.75rem',
              borderRadius: '16px'
            }}>📚</div>
            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.3rem' }}>
                {showRussian ? 'Хотите изучать Тору?' : 'Want to Learn Torah?'}
              </h3>
              <p style={{ opacity: 0.9, fontSize: '1rem' }}>
                {showRussian ? 'Бесплатное обучение один-на-один с партнёром' : 'Free one-on-one learning with a partner. Any level, any topic.'}
              </p>
            </div>
          </div>
          <span style={{
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
            color: '#1e3a5f',
            padding: '0.875rem 2rem',
            borderRadius: '50px',
            fontWeight: '700',
            fontSize: '1rem',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 15px rgba(251, 191, 36, 0.4)',
            position: 'relative'
          }}>
            {showRussian ? 'Записаться бесплатно →' : 'Sign Up Free →'}
          </span>
        </a>

        {/* Search & Filter */}
        <div style={{ 
          background: 'white', 
          borderRadius: '20px', 
          padding: '1.75rem', 
          marginBottom: '2rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
        }}>
          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
            {/* Search */}
            <div style={{ flex: '1', minWidth: '280px' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                🔍 {showRussian ? 'Поиск' : 'Search'}
              </label>
              <input
                type="text"
                placeholder={showRussian ? 'Имя, телефон, описание...' : 'Search by name, phone, or description...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '1rem 1.25rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '14px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            
            {/* Category */}
            <div style={{ minWidth: '220px' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                📁 {showRussian ? 'Категория' : 'Category'}
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '1rem 1.25rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '14px',
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
        <p style={{ color: '#6b7280', marginBottom: '1.25rem', fontSize: '1rem', paddingLeft: '0.5rem' }}>
          <strong style={{ color: '#1e3a5f' }}>{filteredServices.length}</strong> {showRussian ? 'сервисов найдено' : 'services found'}
        </p>

        {/* Services Grid */}
        {filteredServices.length > 0 ? (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
            gap: '1.5rem' 
          }}>
            {filteredServices.map((service) => {
              const cat = getCat(service.categoryId);
              const gradient = categoryGradients[service.categoryId] || categoryGradients['default'];
              
              return (
                <div
                  key={service.id}
                  style={{
                    background: 'white',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    border: service.isPinned ? '3px solid #fbbf24' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.boxShadow = '0 15px 50px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                  }}
                >
                  {/* Top colored header */}
                  <div style={{
                    background: gradient,
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem'
                  }}>
                    {/* Category badge */}
                    {cat && (
                      <span style={{
                        background: 'rgba(255,255,255,0.25)',
                        color: 'white',
                        padding: '0.35rem 0.85rem',
                        borderRadius: '50px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        backdropFilter: 'blur(10px)'
                      }}>
                        {cat.icon} {showRussian && cat.nameRu ? cat.nameRu : cat.name}
                      </span>
                    )}
                    
                    {/* Featured badge */}
                    {service.isPinned && (
                      <span style={{
                        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                        color: '#78350f',
                        padding: '0.35rem 0.85rem',
                        borderRadius: '50px',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}>
                        ⭐ Featured
                      </span>
                    )}
                  </div>
                  
                  {/* Image */}
                  {service.imageUrl && (
                    <div style={{ 
                      height: '140px', 
                      background: `url(${service.imageUrl}) center/cover`,
                    }} />
                  )}
                  
                  {/* Content */}
                  <div style={{ padding: '1.5rem' }}>
                    {/* Logo + Name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                      {service.logoUrl ? (
                        <img 
                          src={service.logoUrl} 
                          alt={service.name}
                          style={{ 
                            width: '52px', 
                            height: '52px', 
                            borderRadius: '12px', 
                            objectFit: 'cover',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '52px',
                          height: '52px',
                          borderRadius: '12px',
                          background: gradient,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: '700',
                          fontSize: '1.25rem',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                        }}>
                          {service.name.charAt(0)}
                        </div>
                      )}
                      <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>
                        {service.name}
                      </h3>
                    </div>

                    {/* Description */}
                    {service.description && (
                      <p style={{ 
                        color: '#6b7280', 
                        fontSize: '0.9rem', 
                        lineHeight: '1.6',
                        marginBottom: '1.25rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {service.description}
                      </p>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {/* Phone - Primary CTA */}
                      <a
                        href={`tel:${service.phone.replace(/[^0-9+]/g, '')}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          padding: '1rem',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: 'white',
                          borderRadius: '14px',
                          textDecoration: 'none',
                          fontWeight: '700',
                          fontSize: '1.05rem',
                          boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                          transition: 'transform 0.2s, box-shadow 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.02)';
                          e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
                        }}
                      >
                        📞 {service.phone}
                      </a>

                      {/* Secondary actions row */}
                      <div style={{ display: 'flex', gap: '0.6rem' }}>
                        {service.email && (
                          <a
                            href={`mailto:${service.email}`}
                            style={{
                              flex: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.4rem',
                              padding: '0.75rem',
                              background: '#f3f4f6',
                              color: '#4b5563',
                              borderRadius: '12px',
                              textDecoration: 'none',
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#e5e7eb'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#f3f4f6'}
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
                              gap: '0.4rem',
                              padding: '0.75rem',
                              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                              color: 'white',
                              borderRadius: '12px',
                              textDecoration: 'none',
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              boxShadow: '0 2px 10px rgba(99, 102, 241, 0.3)'
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
                          padding: '0.75rem 1rem',
                          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                          borderRadius: '12px',
                          fontSize: '0.85rem',
                          color: '#92400e',
                          fontWeight: '500'
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
            padding: '5rem 2rem', 
            background: 'white', 
            borderRadius: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
          }}>
            <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>🔍</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#374151', marginBottom: '0.75rem' }}>
              {showRussian ? 'Ничего не найдено' : 'No services found'}
            </h3>
            <p style={{ color: '#6b7280', fontSize: '1.05rem' }}>
              {showRussian ? 'Попробуйте изменить поиск или категорию' : 'Try adjusting your search or category filter'}
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
