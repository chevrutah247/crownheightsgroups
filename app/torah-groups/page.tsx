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

        {/* CHEVRUTAH 24x7 - TOP FEATURED BANNER */}
        <div style={{
          background: 'linear-gradient(135deg, #1e1b4b, #4c1d95, #6d28d9)',
          borderRadius: '24px',
          padding: '2.5rem',
          marginBottom: '2rem',
          color: 'white',
          boxShadow: '0 10px 40px rgba(109, 40, 217, 0.4)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: 'bold' }}>
              📰 Chevrutah 24x7
            </h2>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '1.1rem' }}>
              {showRussian ? 'Еженедельная газета для всей семьи!' : 'Weekly newspaper for the whole family!'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <div style={{ textAlign: 'center' }}>
              <img src="/images/chevrutah-russian.png" alt="Chevrutah Russian" style={{ height: '180px', borderRadius: '12px', boxShadow: '0 8px 25px rgba(0,0,0,0.4)' }} />
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', opacity: 0.9 }}>🇷🇺 На русском</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <img src="/images/chevrutah-kids.png" alt="Chevrutah Kids" style={{ height: '180px', borderRadius: '12px', boxShadow: '0 8px 25px rgba(0,0,0,0.4)' }} />
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', opacity: 0.9 }}>🇺🇸 Kids Edition</p>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <p style={{ margin: '0 auto', maxWidth: '700px', fontSize: '1rem', opacity: 0.95, lineHeight: '1.6' }}>
              {showRussian
                ? '✨ Двар Тора • Мидраш • Хасидские рассказы • Комиксы • Вопросы от детей • Интересные факты о медицине и полиции'
                : '✨ Dvar Torah • Midrash • Hasidic Stories • Comics • Kids Q&A • Fun facts about medicine & police'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="https://edonthego.org" target="_blank" rel="noopener noreferrer" style={{ 
              display: 'inline-block', 
              background: 'linear-gradient(135deg, #ffd700, #f59e0b)', 
              color: '#1e1b4b', 
              padding: '1rem 2rem', 
              borderRadius: '30px', 
              fontWeight: 'bold', 
              textDecoration: 'none',
              fontSize: '1.1rem',
              boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)'
            }}>
              {showRussian ? '📬 Подписаться бесплатно!' : '📬 Subscribe Free!'}
            </a>
            <a href="https://edonthego.org" target="_blank" rel="noopener noreferrer" style={{ 
              display: 'inline-block', 
              background: 'rgba(255,255,255,0.15)', 
              color: 'white', 
              padding: '1rem 2rem', 
              borderRadius: '30px', 
              fontWeight: 'bold', 
              textDecoration: 'none',
              border: '2px solid rgba(255,255,255,0.5)',
              fontSize: '1rem'
            }}>
              {showRussian ? '💝 Поддержать проект' : '💝 Support Project'}
            </a>
          </div>
        </div>

        {/* TorahMates Banner */}
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
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', opacity: 0.8, marginBottom: '1rem', flexWrap: 'wrap' }}>
              <span>📞 1-877-TORAH-123</span>
              <span>✉️ info@torahmates.org</span>
            </div>
            <a href="https://www.torahmates.org/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', background: 'linear-gradient(135deg, #ffd700, #f59e0b)', color: '#1e3a5f', padding: '0.75rem 1.5rem', borderRadius: '25px', fontWeight: 'bold', textDecoration: 'none' }}>
              Sign Up Free →
            </a>
          </div>
        </div>

        {/* Oorah Events Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #166534, #22c55e)',
          borderRadius: '20px',
          padding: '1.5rem 2rem',
          marginBottom: '1.5rem',
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

        {/* Chitas for Kids Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #ec4899, #f472b6)',
          borderRadius: '20px',
          padding: '2rem',
          marginBottom: '2rem',
          color: 'white',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '1.5rem'
        }}>
          <img src="/images/chitas-for-kids-logo.png" alt="Chitas for Kids" style={{ height: '70px', background: 'white', borderRadius: '10px', padding: '5px' }} />
          <div style={{ flex: 1, minWidth: '250px' }}>
            <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.4rem' }}>
              {showRussian ? '📚 Хитас для детей' : '📚 Chitas for Kids'}
            </h2>
            <p style={{ margin: '0 0 1rem 0', opacity: 0.95, fontSize: '0.95rem' }}>
              {showRussian 
                ? 'Ежедневные уроки Торы для детей и взрослых! Понятные краткие изложения, аудио и раскраски - по email и WhatsApp.' 
                : 'Daily Torah learning for kids (and adults too)! Easy-to-understand summaries in written & audio format, plus coloring books - via email & WhatsApp.'}
            </p>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', opacity: 0.9, marginBottom: '1rem', flexWrap: 'wrap' }}>
              <span>📞 413-376-8770</span>
              <span>✉️ info@kidschitas.org</span>
            </div>
            <a href="https://www.kidschitas.org/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', background: 'white', color: '#ec4899', padding: '0.75rem 1.5rem', borderRadius: '25px', fontWeight: 'bold', textDecoration: 'none' }}>
              Subscribe Free →
            </a>
          </div>
        </div>

        {/* Filters */}
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
