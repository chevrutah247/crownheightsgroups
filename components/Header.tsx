'use client';

import Link from 'next/link';

interface UserInfo {
  name: string;
  email: string;
  role: 'user' | 'admin';
}

interface HeaderProps {
  user?: UserInfo | null;
  onLogout?: () => void;
}

export default function Header({ user, onLogout }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-main">
        <Link href="/" className="logo">
          <div className="logo-icon">CH</div>
          <span className="logo-text">Crown Heights Groups</span>
        </Link>
        
        <nav className="nav">
          <Link href="/" className="nav-link">Groups</Link>
          <Link href="/services" className="nav-link">Services</Link>
          <Link href="/suggest" className="nav-link">Suggest</Link>
          <Link href="/contact" className="nav-link">Contact</Link>
          {user?.role === 'admin' && (
            <Link href="/admin" className="nav-link">Admin</Link>
          )}
          {user && (
            <div className="user-menu">
              <span className="user-name">{user.name}</span>
              {onLogout && (
                <button 
                  onClick={onLogout}
                  className="logout-btn"
                  title="Sign out"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                </button>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
