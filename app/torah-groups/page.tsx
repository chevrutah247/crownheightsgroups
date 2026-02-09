'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EmergencyBar from '@/components/EmergencyBar';

const torahResources = [
  {
    id: 1,
    name: 'TorahMates',
    description: 'Free one-on-one Torah learning with a personal study partner. Any level, any topic. Over the phone or video.',
    descriptionRu: 'Бесплатное изучение Торы один на один с партнёром. Любой уровень, любая тема. По телефону или видео.',
    phone: '1-877-TORAH-123',
    email: 'info@torahmates.org',
    website: 'https://www.torahmates.org/',
    logo: 'https://www.oorah.org/img/logos/TMLogo.png',
    languages: ['English', 'Hebrew'],
    type: 'program',
    featured: true,
  },
  {
    id: 2,
    name: 'Oorah Free Events & Trips',
    description: 'Free trips to Upstate NY, retreats, Shabbatons, and family events. Register at TorahMates to qualify.',
    descriptionRu: 'Бесплатные поездки в Апстейт Нью-Йорк, ретриты, шаббатоны и семейные мероприятия. Зарегистрируйтесь в TorahMates.',
    website: 'https://www.oorah.org/events/',
    logo: 'https://www.oorah.org/img/logos/OorahWhiteLogo.png',
    logoBg: '#166534',
    languages: ['English'],
    type: 'events',
    featured: true,
  },
];

// This will be populated from database later
const torahGroups: any[] = [];

const languages = [
  { id: 'all', name: 'All Languages', flag: '🌍' },
  { id: 'english', name: 'English', flag: '🇺🇸' },
  { id: 'hebrew', name: 'Hebrew', flag: '🇮🇱' },
  { id: 'russian', name: 'Russian', flag: '🇷🇺' },
  { id: 'yiddish', name: 'Yiddish', flag: '🕎' },
  { id: 'spanish', name: 'Spanish', flag: '🇪🇸' },
  { id: 'french', name: 'French', flag: '🇫🇷' },
];

const platforms = [
  { id: 'all', name: 'All', icon: '📱' },
  { id: 'whatsapp', name: 'WhatsApp', icon: '💬' },
  { id: 'telegram', name: 'Telegram', icon: '✈️' },
  { id: 'facebook', name: 'Facebook', icon: '👤' },
  { id: 'zoom', name: 'Zoom', icon: '🎥' },
];

export default function TorahGroupsPage() {
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [showRussian, setShowRussian] = useState(false);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <EmergencyBar />
      <Header user={null} onLogout={() => {}} />
      
      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#1e3a5f', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            📚 Torah Learning
          </h1>
          <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '1rem' }}>
            Study groups, learning partners & educational resources
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

        {/* Featured: TorahMates Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a5f, #3b82f6)',
          borderRadius: '20px',
          padding: '2rem',
          marginBottom: '1.5rem',
          color: 'white',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '1.5rem'
        }}>
          <img 
            src="https://www.oorah.org/img/logos/TMLogo.png" 
            alt="TorahMates" 
            style={{ height: '60px' }}
          />
          <div style={{ flex: 1, minWidth: '250px' }}>
            <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.4rem' }}>
              {showRussian ? 'Хочешь изучать Тору?' : 'Want to Learn Torah?'}
            </h2>
            <p style={{ margin: '0 0 1rem 0', opacity: 0.9, fontSize: '0.95rem' }}>
              {showRussian 
                ? 'Бесплатное изучение один на один с партнёром. Любой уровень, любая тема.'
                : 'Free one-on-one learning with a personal study partner. Any level, any topic.'
              }
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem', opacity: 0.8, marginBottom: '1rem' }}>
              <span>📞 1-877-TORAH-123</span>
              <span>✉️ info@torahmates.org</span>
            </div>
            <a 
              href="https://www.torahmates.org/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #ffd700, #f59e0b)',
                color: '#1e3a5f',
                padding: '0.75rem 1.5rem',
                borderRadius: '25px',
                fontWeight: 'bold',
                textDecoration: 'none'
              }}
            >
              Sign Up Free →
            </a>
          </div>
        </div>

        {/* Featured: Oorah Events Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #166534, #22c55e)',
          borderRadius: '20px',
          padding: '1.5rem 2rem',
          marginBottom: '2rem',
          color: 'white',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '1.5rem'
        }}>
          <img 
            src="https://www.oorah.org/img/logos/OorahWhiteLogo.png" 
            alt="Oorah" 
            style={{ height: '45px' }}
          />
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.2rem' }}>
              {showRussian ? 'Бесплатные поездки в Апстейт!' : 'FREE Trips to Upstate NY!'}
            </h3>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>
              {showRussian 
                ? 'Ретриты, шаббатоны и семейные мероприятия. Сначала зарегистрируйтесь в TorahMates!'
                : 'Retreats, Shabbatons & family events. First register at TorahMates to qualify!'
              }
            </p>
          </div>
          <a 
            href="https://www.oorah.org/events/" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              background: 'linear-gradient(135deg, #ffd700, #f59e0b)',
              color: '#1e3a5f',
              padding: '0.6rem 1.25rem',
              borderRadius: '25px',
              fontWeight: 'bold',
              textDecoration: 'none',
              whiteSpace: 'nowrap'
            }}
          >
            Browse Events →
          </a>
        </div>

        {/* Filters */}
        <div style={{ 
          background: 'white', 
          borderRadius: '16px', 
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#1e3a5f' }}>🔍 Find Torah Groups</h3>
          
          {/* Language Filter */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem', display: 'block' }}>Language:</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {languages.map(lang => (
                <button
                  key={lang.id}
                  onClick={() => setSelectedLanguage(lang.id)}
                  style={{
                    padding: '0.4rem 0.8rem',
                    background: selectedLanguage === lang.id ? '#1e3a5f' : '#f3f4f6',
                    color: selectedLanguage === lang.id ? 'white' : '#374151',
                    border: 'none',
                    borderRadius: '15px',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  {lang.flag} {lang.name}
                </button>
              ))}
            </div>
          </div>

          {/* Platform Filter */}
          <div>
            <label style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem', display: 'block' }}>Platform:</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {platforms.map(plat => (
                <button
                  key={plat.id}
                  onClick={() => setSelectedPlatform(plat.id)}
                  style={{
                    padding: '0.4rem 0.8rem',
                    background: selectedPlatform === plat.id ? '#1e3a5f' : '#f3f4f6',
                    color: selectedPlatform === plat.id ? 'white' : '#374151',
                    border: 'none',
                    borderRadius: '15px',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  {plat.icon} {plat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Groups List */}
        {torahGroups.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
            <h3 style={{ color: '#1e3a5f', marginBottom: '0.5rem' }}>
              {showRussian ? 'Группы скоро появятся!' : 'Groups Coming Soon!'}
            </h3>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>
              {showRussian 
                ? 'Мы собираем группы по изучению Торы. Знаете хорошую группу? Добавьте её!'
                : 'We\'re collecting Torah study groups. Know a good one? Add it!'
              }
            </p>
            <Link 
              href="/suggest-group"
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
              ➕ {showRussian ? 'Добавить группу' : 'Add a Torah Group'}
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {torahGroups.map(group => (
              <div 
                key={group.id}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                  <h3 style={{ margin: 0, color: '#1e3a5f', fontSize: '1.1rem' }}>{group.name}</h3>
                  <span style={{ 
                    background: group.platform === 'whatsapp' ? '#25D366' : group.platform === 'telegram' ? '#0088cc' : '#1877F2',
                    color: 'white',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem'
                  }}>
                    {group.platform}
                  </span>
                </div>
                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.75rem' }}>{group.description}</p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                  {group.languages?.map((lang: string) => (
                    <span key={lang} style={{ background: '#f3f4f6', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                      {lang}
                    </span>
                  ))}
                </div>
                <a 
                  href={group.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    background: '#1e3a5f',
                    color: 'white',
                    padding: '0.6rem',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    fontSize: '0.9rem'
                  }}
                >
                  Join Group →
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Add Group CTA */}
        <div style={{
          marginTop: '2rem',
          textAlign: 'center',
          padding: '2rem',
          background: '#eff6ff',
          borderRadius: '16px',
          border: '2px dashed #93c5fd'
        }}>
          <h3 style={{ color: '#1e40af', marginBottom: '0.5rem' }}>
            {showRussian ? 'Знаете группу по изучению Торы?' : 'Know a Torah Study Group?'}
          </h3>
          <p style={{ color: '#666', marginBottom: '1rem' }}>
            {showRussian ? 'Поделитесь с общиной!' : 'Share it with the community!'}
          </p>
          <Link 
            href="/suggest-group"
            style={{
              display: 'inline-block',
              background: '#3b82f6',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '25px',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}
          >
            ➕ {showRussian ? 'Добавить группу' : 'Suggest a Group'}
          </Link>
        </div>

      </main>

      <Footer />
    </div>
  );
}
