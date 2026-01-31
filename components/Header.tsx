'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import GlobalSearch from './GlobalSearch';

interface HeaderProps {
  user: { name: string; email: string; role?: string } | null;
  onLogout: () => void;
}

export default function Header({ user, onLogout }: HeaderProps) {
  const [showSearch, setShowSearch] = useState(false);
  const [pulse, setPulse] = useState(true);

  // Убираем пульсацию через 5 секунд
  useEffect(() => {
    const timer = setTimeout(() => setPulse(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Горячая клавиша "/" для открытия поиска
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !showSearch && 
          !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setShowSearch(true);
      }
      if (e.key === 'Escape' && showSearch) {
        setShowSearch(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSearch]);

  return (
    <>
      <header className="header">
        <div className="header-content">
          <Link href="/" className="logo">
            <span className="logo-icon">CH</span>
            <span className="logo-text">Crown Heights Groups</span>
          </Link>
          <nav className="nav" style={{ flexWrap: 'wrap', gap: '0.25rem 0.5rem', alignItems: 'center' }}>
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/groups" className="nav-link">Groups</Link>
            <Link href="/charity" className="nav-link" style={{ color: '#e11d48' }}>💝 Charity</Link>
            <Link href="/shabbos" className="nav-link" style={{ color: '#c9a227' }}>🕯️ Shabbos</Link>
            <Link href="/business" className="nav-link" style={{ color: '#8b5cf6' }}>🏪 Business</Link>
            <Link href="/events" className="nav-link" style={{ color: '#f59e0b' }}>Events</Link>
            <Link href="/news" className="nav-link">News</Link>
            <Link href="/kallah" className="nav-link" style={{ color: '#ec4899' }}>🕍 Kallah</Link>          
            <Link href="/services" className="nav-link">Services</Link>
            
            {/* 🔍 Search Button - ЗАМЕТНАЯ ВЕРСИЯ */}
            <button 
              onClick={() => setShowSearch(true)} 
              style={{ 
                background: pulse ? '#3b82f6' : '#f3f4f6',
                color: pulse ? 'white' : '#374151',
                border: 'none', 
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
                padding: '0.5rem 1rem',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                transition: 'all 0.3s ease',
                animation: pulse ? 'pulse 2s ease-in-out infinite' : 'none',
                boxShadow: pulse ? '0 0 0 0 rgba(59, 130, 246, 0.5)' : 'none',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#2563eb';
                e.currentTarget.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = pulse ? '#3b82f6' : '#f3f4f6';
                e.currentTarget.style.color = pulse ? 'white' : '#374151';
              }}
              title="Search (Press /)"
            >
              🔍 <span>Search</span>
              <span style={{
                fontSize: '0.7rem',
                padding: '2px 6px',
                background: pulse ? 'rgba(255,255,255,0.2)' : '#e5e7eb',
                borderRadius: '4px',
                marginLeft: '4px',
              }}>/</span>
            </button>

            {user?.role === 'admin' && (
              <Link href="/admin" className="nav-link" style={{ color: '#dc2626' }}>Admin</Link>
            )}
            {user && (
              <>
                <span className="nav-user">{user.name}</span>
                <button onClick={onLogout} className="nav-logout" title="Logout">
                  <span>→</span>
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* CSS для анимации пульсации */}
      <style jsx global>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.6);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
          }
        }
      `}</style>

      {/* Search Modal */}
      {showSearch && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '8vh',
            backdropFilter: 'blur(4px)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowSearch(false);
          }}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '20px',
              width: '92%',
              maxWidth: '560px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '16px' 
            }}>
              <h2 style={{ 
                margin: 0, 
                fontSize: '18px', 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <span>🔍</span> Search
              </h2>
              <button 
                onClick={() => setShowSearch(false)}
                style={{
                  background: '#f3f4f6',
                  border: 'none',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6b7280',
                  transition: 'background 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#e5e7eb'}
                onMouseOut={(e) => e.currentTarget.style.background = '#f3f4f6'}
              >
                ✕
              </button>
            </div>
            <GlobalSearch 
              placeholder="Search groups, businesses, events..." 
              onClose={() => setShowSearch(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
