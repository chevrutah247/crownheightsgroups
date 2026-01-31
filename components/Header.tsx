'use client';

import { useState } from 'react';
import Link from 'next/link';
import GlobalSearch from './GlobalSearch';

interface HeaderProps {
  user: { name: string; email: string; role?: string } | null;
  onLogout: () => void;
}

export default function Header({ user, onLogout }: HeaderProps) {
  const [showSearch, setShowSearch] = useState(false);

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
            
            {/* 🔍 Search Button */}
            <button 
              onClick={() => setShowSearch(true)} 
              className="nav-link"
              style={{ 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer',
                fontSize: '1.1rem',
                padding: '0.25rem 0.5rem'
              }}
              title="Search"
            >
              🔍
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

      {/* Search Modal */}
      {showSearch && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '10vh',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowSearch(false);
          }}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '1.5rem',
              width: '90%',
              maxWidth: '600px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>🔍 Search</h2>
              <button 
                onClick={() => setShowSearch(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#666',
                }}
              >
                ✕
              </button>
            </div>
            <GlobalSearch 
              placeholder="Search groups, businesses, events..." 
              className=""
            />
          </div>
        </div>
      )}
    </>
  );
}
