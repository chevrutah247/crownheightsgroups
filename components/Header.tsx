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
        <nav className="nav">
          <Link href="/" className="nav-link">Home</Link>
          <Link href="/groups" className="nav-link">Groups</Link>
          <Link href="/new" className="nav-link" style={{ color: '#10b981' }}>🆕 New</Link>
          <Link href="/services" className="nav-link">Services</Link>
          <Link href="/news" className="nav-link">News</Link>
          <Link href="/contact" className="nav-link">Contact</Link>
          {user?.role === 'admin' && (
            <Link href="/admin" className="nav-link">Admin</Link>
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
