'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EmergencyBar from '@/components/EmergencyBar';

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
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#1e3a5f', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            📚 Torah Learning
          </h1>
          <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '1rem' }}>
            Study groups, learning partners & educational resources
          </p>
          
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
          <img src="https://www.oorah.org/img/logos/TMLogo.png" alt="TorahMates" style={{ height: '60px' }} />
          <div style={{ flex: 1, minWidth: '250px' }}>
            <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.4rem' }}>
              {showRussian ? 'Хочешь изучать Тору?' : 'Want to Learn Torah?'}
            </h2>
            <p style={{ margin: '0 0 1rem 0', opacity: 0.9, fontSize: '0.95rem' }}>
              {showRussian ? 'Бесплатное изучение один на один с партнёром. Любой уровень, любая тема.' : 'Free one-on-one learning with a personal study partner. Any level, any topic.'}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem', opacity: 0.8, marginBottom: '1rem' }}>
              <span>📞 1-877-TORAH-123</span>
              <span>✉️ info@torahmates.org</span>
            </div>
            <a href="https://www.torahmates.org/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', background: 'linear-gradient(135deg, #ffd700, #f59e0b)', color: '#1e3a5f', padding: '0.75rem 1.5rem', borderRadius: '25px', fontWeight: 'bold', textDecoration: 'none' }}>
              Sign Up Free →
            </a>
          </div>
        </div>

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
          <img src="https://www.oorah.org/img/logos/OorahWhiteLogo.png" alt="Oorah" style={{ height: '45px' }} />
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.2rem' }}>
              {showRussian ? 'Бесплатные поездки в Апстейт!' : 'FREE Trips to Upstate NY!'}
            </h3>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>
              {showRussian ? 'Ретриты, шаббатоны и семейные мероприятия.' : 'Retreats, Shabbatons & family events. First register at TorahMates!'}
            </p>
          </div>
          <a href="https://www.oorah.org/events/" target="_blank" rel="noopener noreferrer" style={{ background: 'linear-gradient(135deg, #ffd700, #f59e0b)', color: '#1e3a5f', padding: '0.6rem 1.25rem', borderRadius: '25px', fontWeight: 'bold', textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Browse Events →
          </a>
        </div>

        <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#1e3a5f' }}>🔍 Find Torah Groups</h3>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem', display: 'block' }}>Language:</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {languages.map(lang => (
                <button key={lang.id} onClick={() => setSelectedLanguage(lang.id)} style={{ padding: '0.4rem 0.8rem', background: selectedLanguage === lang.id ? '#1e3a5f' : '#f3f4f6', color: selectedLanguage === lang.id ? 'white' : '#374151', border: 'none', borderRadius: '15px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  {lang.flag} {lang.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem', display: 'block' }}>Platform:</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {platforms.map(plat => (
                <button key={plat.id} onClick={() => setSelectedPlatform(plat.id)} style={{ padding: '0.4rem 0.8rem', background: selectedPlatform === plat.id ? '#1e3a5f' : '#f3f4f6', color: selectedPlatform === plat.id ? 'white' : '#374151', border: 'none', borderRadius: '15px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  {plat.icon} {plat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {torahGroups.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {torahGroups.map(group => (
              <div key={group.id} style={{ background: 'white', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <h3 style={{ margin: 0, color: '#1e3a5f', fontSize: '1.1rem' }}>{group.name}</h3>
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center', padding: '2rem', background: '#eff6ff', borderRadius: '16px', border: '2px dashed #93c5fd' }}>
          <h3 style={{ color: '#1e40af', marginBottom: '0.5rem' }}>
            {showRussian ? 'Знаете группу по изучению Торы?' : 'Know a Torah Study Group?'}
          </h3>
          <p style={{ color: '#666', marginBottom: '1rem' }}>
            {showRussian ? 'Поделитесь с общиной!' : 'Share it with the community!'}
          </p>
          <Link href="/suggest-group" style={{ display: 'inline-block', background: '#22c55e', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '25px', textDecoration: 'none', fontWeight: 'bold' }}>
            ➕ {showRussian ? 'Добавить группу' : 'Suggest a Group'}
          </Link>
        </div>

      </main>
      <Footer />
    </div>
  );
}
