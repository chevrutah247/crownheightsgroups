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
];

const categories = [
  { id: 'all', name: 'All', icon: '📋' },
  { id: 'loans', name: 'Free Loans', icon: '🏦' },
  { id: 'food', name: 'Food', icon: '🍞' },
  { id: 'clothing', name: 'Clothing', icon: '👔' },
  { id: 'medical', name: 'Medical Equipment', icon: '🏥' },
  { id: 'baby', name: 'Baby Items', icon: '👶' },
  { id: 'simcha', name: 'Simcha', icon: '🎉' },
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
            Free loans, equipment, and community resources
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
            🇷🇺 {showRussian ? 'Show English' : 'По-русски'}
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
          <img 
            src="/images/hfls-logo.png" 
            alt="Hebrew Free Loan Society" 
            style={{ height: '80px', background: 'white', padding: '10px', borderRadius: '10px' }}
          />
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
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.9rem', opacity: 0.85, marginBottom: '1rem' }}>
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

        {/* Other Resources Grid */}
        {filteredResources.filter(r => !r.featured).length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            {filteredResources.filter(r => !r.featured).map(resource => (
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
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e3a5f', fontSize: '1.2rem' }}>
                  {showRussian && resource.nameRu ? resource.nameRu : resource.name}
                </h3>
                <p style={{ color: '#666', fontSize: '0.95rem', marginBottom: '1rem', lineHeight: 1.5 }}>
                  {showRussian && resource.descriptionRu ? resource.descriptionRu : resource.description}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                  {resource.phone && <span>📞 {resource.phone}</span>}
                  {resource.email && <span>✉️ {resource.email}</span>}
                  {resource.address && <span>📍 {resource.address}</span>}
                </div>
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
        )}

        {/* Empty state for categories */}
        {selectedCategory !== 'all' && selectedCategory !== 'loans' && (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            background: 'white',
            borderRadius: '16px',
            marginBottom: '2rem'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
              {categories.find(c => c.id === selectedCategory)?.icon}
            </div>
            <h3 style={{ color: '#1e3a5f', marginBottom: '0.5rem' }}>Coming Soon!</h3>
            <p style={{ color: '#666' }}>Know a gemach in this category? Add it below!</p>
          </div>
        )}

        {/* Looking for Torah Learning? */}
        <div style={{
          background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          <div>
            <h3 style={{ margin: '0 0 0.25rem 0', color: '#1e40af' }}>📚 Looking for Torah Learning?</h3>
            <p style={{ margin: 0, color: '#3b82f6', fontSize: '0.95rem' }}>
              Free study partners, groups, and educational programs
            </p>
          </div>
          <Link 
            href="/torah-groups"
            style={{
              background: '#3b82f6',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '25px',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}
          >
            Torah Learning →
          </Link>
        </div>

        {/* Add Resource CTA */}
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          background: '#f0fdf4',
          borderRadius: '16px',
          border: '2px dashed #86efac'
        }}>
          <h3 style={{ color: '#166534', marginBottom: '0.5rem' }}>
            {showRussian ? 'Знаете гмах?' : 'Know a Gemach?'}
          </h3>
          <p style={{ color: '#666', marginBottom: '1rem' }}>
            {showRussian ? 'Помогите общине — добавьте его!' : 'Help the community by sharing it!'}
          </p>
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
            ➕ {showRussian ? 'Добавить ресурс' : 'Suggest a Resource'}
          </Link>
        </div>

      </main>

      <Footer />
    </div>
  );
}
