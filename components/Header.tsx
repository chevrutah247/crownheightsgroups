'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import GlobalSearch from './GlobalSearch';

interface HeaderProps {
  user: { name: string; email: string; role?: string } | null;
  onLogout: () => void;
}

export default function Header({ user, onLogout }: HeaderProps) {
  const [showSearch, setShowSearch] = useState(false);
  const [showMitzvah, setShowMitzvah] = useState(false);
  const [pulse, setPulse] = useState(true);
  const mitzvahRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setPulse(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !showSearch && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setShowSearch(true);
      }
      if (e.key === 'Escape') {
        setShowSearch(false);
        setShowMitzvah(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (mitzvahRef.current && !mitzvahRef.current.contains(e.target as Node)) {
        setShowMitzvah(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
            
            {/* Mitzvah Dropdown */}
            <div ref={mitzvahRef} style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowMitzvah(!showMitzvah)}
                className="nav-link"
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  color: '#e11d48',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '0.5rem',
                  fontSize: 'inherit',
                  fontFamily: 'inherit',
                }}
              >
                💝 Mitzvah <span style={{ fontSize: '0.7rem' }}>{showMitzvah ? '▲' : '▼'}</span>
              </button>
              {showMitzvah && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  background: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                  padding: '0.5rem',
                  zIndex: 1000,
                  minWidth: '180px',
                  marginTop: '4px',
                }}>
                  <Link href="/charity" onClick={() => setShowMitzvah(false)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1rem', color: '#e11d48', textDecoration: 'none', borderRadius: '8px', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#fef2f2'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                    💝 Charity
                  </Link>
                  <Link href="/shabbos" onClick={() => setShowMitzvah(false)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1rem', color: '#c9a227', textDecoration: 'none', borderRadius: '8px', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#fefce8'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                    🕯️ Shabbos
                  </Link>
                  <Link href="/kallah" onClick={() => setShowMitzvah(false)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1rem', color: '#ec4899', textDecoration: 'none', borderRadius: '8px', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#fdf2f8'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                    🕍 Kallah
                  </Link>
                </div>
              )}
            </div>

            <Link href="/classifieds" className="nav-link" style={{ color: '#16a34a' }}>📋 Classifieds</Link>
            <Link href="/business" className="nav-link" style={{ color: '#8b5cf6' }}>🏪 Business</Link>
            <Link href="/events" className="nav-link">Events</Link>
            <Link href="/shuls" className="nav-link" style={{ color: '#1e3a5f' }}>СИНАГОГИ</Link>
            <Link href="/photo-archive" className="nav-link">Photo Archive</Link>
            <Link href="/news" className="nav-link">News</Link>
            <Link href="/services" className="nav-link">Services</Link>
            <Link href="/yeshivas" className="nav-link" style={{ color: '#1e3a5f' }}>📚 Yeshivas</Link>
            
            {/* 🔍 Search Button */}
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
              onMouseOver={(e) => { e.currentTarget.style.background = '#2563eb'; e.currentTarget.style.color = 'white'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = pulse ? '#3b82f6' : '#f3f4f6'; e.currentTarget.style.color = pulse ? 'white' : '#374151'; }}
              title="Search (Press /)"
            >
              🔍 <span>Search</span>
              <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: pulse ? 'rgba(255,255,255,0.2)' : '#e5e7eb', borderRadius: '4px', marginLeft: '4px' }}>/</span>
            </button>

            {user?.role === 'admin' && (
              <Link href="/admin" className="nav-link" style={{ color: '#dc2626' }}>Admin</Link>
            )}
            {user ? (
              <>
                <Link href="/profile" className="nav-link" style={{ color: '#10b981' }}>{user.name}</Link>
                <button onClick={onLogout} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>Logout</button>
              </>
            ) : (
              <Link href="/auth/login" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.55rem 1.25rem',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.9rem',
                borderRadius: '9999px',
                textDecoration: 'none',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.35)',
                transition: 'all 0.2s ease',
                border: '2px solid transparent',
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(37, 99, 235, 0.5)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(37, 99, 235, 0.35)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >Log In</Link>
            )}
          </nav>
        </div>
      </header>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5); }
          50% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0); }
        }
      `}</style>

      {/* Search Modal */}
      {showSearch && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.6)', zIndex: 9999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '8vh', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowSearch(false); }}
        >
          <div style={{ background: 'white', borderRadius: '16px', padding: '20px', width: '92%', maxWidth: '560px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🔍</span> Search
              </h2>
              <button 
                onClick={() => setShowSearch(false)}
                style={{ background: '#f3f4f6', border: 'none', width: '32px', height: '32px', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', transition: 'background 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.background = '#e5e7eb'}
                onMouseOut={(e) => e.currentTarget.style.background = '#f3f4f6'}
              >✕</button>
            </div>
            <GlobalSearch placeholder="Search groups, businesses, events..." onClose={() => setShowSearch(false)} />
          </div>
        </div>
      )}
    </>
  );
}
