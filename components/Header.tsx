'use client';

import Link from 'next/link';

interface HeaderProps {
  user: { name: string; email: string; role?: string } | null;
  onLogout: () => void;
}

export default function Header({ user, onLogout }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-content">
        <Link href="/" className="logo">
          <span className="logo-icon">CH</span>
          <span className="logo-text">Crown Heights Groups</span>
        </Link>
        <nav className="nav" style={{ flexWrap: 'wrap', gap: '0.25rem 0.5rem' }}>
          <Link href="/" className="nav-link">Home</Link>
          <Link href="/groups" className="nav-link">Groups</Link>
          <Link href="/charity" className="nav-link" style={{ color: '#e11d48' }}>💝 Charity</Link>
          <Link href="/shabbos" className="nav-link" style={{ color: '#c9a227' }}>🕯️ Shabbos</Link>
          <Link href="/business" className="nav-link" style={{ color: '#8b5cf6' }}>🏪 Business</Link>
          <Link href="/events" className="nav-link" style={{ color: '#f59e0b' }}>Events</Link>
          <Link href="/news" className="nav-link">News</Link>
          <Link href="/kallah" className="nav-link" style={{ color: '#ec4899' }}>💒 Kallah</Link>          
          <Link href="/services" className="nav-link">Services</Link>
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
  );
}
