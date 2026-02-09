'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EmergencyBar from '@/components/EmergencyBar';

const gemachResources = [
  {
    id: 1,
    name: 'Hebrew Free Loan Society',
    nameRu: 'Общество Беспроцентных Займов',
    description: 'Interest-free loans for Jews since 1892. For business, education, medical expenses, housing, and emergencies.',
    descriptionRu: 'Беспроцентные займы для евреев с 1892 года. На бизнес, образование, медицину, жильё и экстренные нужды. Конфиденциально.',
    phone: '(212) 687-0188',
    email: 'info@hfls.org',
    address: '275 Madison Avenue Suite 1905, New York, NY 10016',
    website: 'https://hfls.org/',
    websiteRu: 'https://hfls.org/russian-2/',
    logo: '/images/hfls-logo.png',
    category: 'loans',
    featured: true,
  },
  {
    id: 2,
    name: 'TorahMates',
    description: 'Free one-on-one Torah learning with a personal study partner. Any level, any topic. Over the phone or video.',
    phone: '1-877-TORAH-123',
    email: 'info@torahmates.org',
    website: 'https://www.torahmates.org/',
    logo: 'https://www.oorah.org/img/logos/TMLogo.png',
    category: 'education',
    featured: true,
  },
  {
    id: 3,
    name: 'Oorah Free Events',
    description: 'Free trips to Upstate NY, retreats, family events, and more. Register at TorahMates to qualify.',
    website: 'https://www.oorah.org/events/',
    logo: 'https://www.oorah.org/img/logos/OorahWhiteLogo.png',
    logoBg: '#166534',
    category: 'events',
    featured: true,
  },
];

const categories = [
  { id: 'all', name: 'All', icon: '📋' },
  { id: 'loans', name: 'Free Loans', icon: '🏦' },
  { id: 'education', name: 'Education', icon: '📚' },
  { id: 'events', name: 'Events & Trips', icon: '🎉' },
  { id: 'food', name: 'Food', icon: '🍞' },
  { id: 'clothing', name: 'Clothing', icon: '👔' },
  { id: 'medical', name: 'Medical', icon: '🏥' },
  { id: 'other', name: 'Other', icon: '📦' },
];

export default function GemachPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showRussian, setShowRussian] = useState(false);

  const filteredResources = selectedCategory === 'all' 
    ? gemachResources 
    : gemachResources.filter(r => r.category === selectedCategory);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <EmergencyBar />
      <Header user={null} onLogout={() => {}} />
      
      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#1e3a5f', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            🆓 Free Resources & Gemach
          </h1>
          <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '1rem' }}>
            Community resources available for free or interest-free
          </p>
          
          {/* Language Toggle */}
          <button
            onClick={() => setShowRussian(!showRussian)}
            style={{
              padding: '0.5rem 1rem',
              background: showRussian ? '#1e3a5f' : 'white',
              color: showRussian ? 'white' : '#1e3a5f',
              border: '2px solid #1e3a5f',
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.9rem'
            }}
          >
            🇷🇺 {showRussian ? 'Показать English' : 'По-русски'}
          </button>
        </div>

        {/* Category Filter */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '0.5rem', 
          justifyContent: 'center',
          marginBottom: '2rem'
        }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '0.5rem 1rem',
                background: selectedCategory === cat.id ? '#1e3a5f' : 'white',
                color: selectedCategory === cat.id ? 'white' : '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* Featured Banner - HFLS */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a5f, #2d5a87)',
          borderRadius: '20px',
          padding: '2rem',
          marginBottom: '2rem',
          color: 'white',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '1.5rem'
        }}>
          <div style={{ background: 'white', padding: '15px 20px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ color: '#1e3a5f', fontWeight: 'bold', fontSize: '1.1rem', lineHeight: 1.2 }}>
              <span style={{ fontSize: '1.4rem' }}>Hebrew Free</span><br/>
              <span style={{ fontSize: '1.4rem' }}>Loan Society</span><br/>
              <span style={{ fontSize: '0.75rem', color: '#666' }}>SINCE 1892</span>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem' }}>
              {showRussian ? 'Беспроцентные Займы' : 'Interest-Free Loans'}
            </h2>
            <p style={{ margin: '0 0 1rem 0', opacity: 0.9 }}>
              {showRussian 
                ? 'Hebrew Free Loan Society — беспроцентные займы для евреев с 1892 года. На бизнес, образование, медицину, жильё и экстренные нужды.'
                : 'Hebrew Free Loan Society — interest-free loans for Jews since 1892. For business, education, medical, housing, and emergencies.'
              }
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.9rem', opacity: 0.85, marginBottom: '1rem' }}>
              <span>📞 (212) 687-0188</span>
              <span>✉️ info@hfls.org</span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <a 
                href="https://hfls.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  background: 'white',
                  color: '#1e3a5f',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '25px',
                  fontWeight: 'bold',
                  textDecoration: 'none'
                }}
              >
                Visit Website →
              </a>
              <a 
                href="https://hfls.org/russian-2/" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  background: 'linear-gradient(135deg, #ffd700, #f59e0b)',
                  color: '#1e3a5f',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '25px',
                  fontWeight: 'bold',
                  textDecoration: 'none'
                }}
              >
                🇷🇺 По-русски
              </a>
            </div>
          </div>
        </div>

        {/* Resources Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {filteredResources.filter(r => r.id !== 1).map(resource => (
            <div 
              key={resource.id}
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '1.5rem',
                boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                border: '1px solid #e5e7eb'
              }}
            >
              {/* Logo */}
              {resource.logo && (
                <div style={{ 
                  marginBottom: '1rem',
                  background: resource.logoBg || '#f8fafc',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  display: 'inline-block'
                }}>
                  <img 
                    src={resource.logo} 
                    alt={resource.name} 
                    style={{ height: '40px', objectFit: 'contain' }}
                  />
                </div>
              )}
              
              {/* Name */}
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e3a5f', fontSize: '1.2rem' }}>
                {resource.name}
              </h3>
              
              {/* Description */}
              <p style={{ color: '#666', fontSize: '0.95rem', marginBottom: '1rem', lineHeight: 1.5 }}>
                {showRussian && resource.descriptionRu ? resource.descriptionRu : resource.description}
              </p>
              
              {/* Contact Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                {resource.phone && <span>📞 {resource.phone}</span>}
                {resource.email && <span>✉️ {resource.email}</span>}
                {resource.address && <span>📍 {resource.address}</span>}
              </div>
              
              {/* Website Button */}
              {resource.website && (
                <a 
                  href={showRussian && resource.websiteRu ? resource.websiteRu : resource.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    background: '#1e3a5f',
                    color: 'white',
                    padding: '0.6rem 1.25rem',
                    borderRadius: '20px',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    fontSize: '0.9rem'
                  }}
                >
                  Learn More →
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Add Resource CTA */}
        <div style={{
          marginTop: '3rem',
          textAlign: 'center',
          padding: '2rem',
          background: '#f0fdf4',
          borderRadius: '16px',
          border: '2px dashed #86efac'
        }}>
          <h3 style={{ color: '#166534', marginBottom: '0.5rem' }}>Know a Gemach or Free Resource?</h3>
          <p style={{ color: '#666', marginBottom: '1rem' }}>Help the community by sharing it!</p>
          <Link 
            href="/contact"
            style={{
              display: 'inline-block',
              background: '#22c55e',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '25px',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}
          >
            ➕ Suggest a Resource
          </Link>
        </div>

      </main>

      <Footer />
    </div>
  );
}
