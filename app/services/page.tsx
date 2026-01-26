'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EmergencyBar from '@/components/EmergencyBar';
import { 
  serviceCategories, 
  serviceContacts, 
  getApprovedServiceContacts,
  getServiceCategoryById,
  getLocationById 
} from '@/lib/data';
import { ServiceContact, ServiceCategory } from '@/lib/types';

interface UserInfo {
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export default function ServicesPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredContacts, setFilteredContacts] = useState<ServiceContact[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('session_token');
      
      if (!token) {
        window.location.href = '/auth/login';
        return;
      }
      
      try {
        const response = await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        
        const data = await response.json();
        
        if (data.valid) {
          setIsAuthenticated(true);
          setUser(data.user);
        } else {
          localStorage.removeItem('session_token');
          window.location.href = '/auth/login';
        }
      } catch (error) {
        window.location.href = '/auth/login';
      }
    };
    
    checkAuth();
  }, []);

  // Filter contacts
  useEffect(() => {
    let result = getApprovedServiceContacts();
    
    if (selectedCategory) {
      result = result.filter(c => c.categoryId === selectedCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(query) ||
        c.description?.toLowerCase().includes(query) ||
        c.phone.includes(query)
      );
    }
    
    // Sort: pinned first, then alphabetically
    result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return a.name.localeCompare(b.name);
    });
    
    setFilteredContacts(result);
  }, [selectedCategory, searchQuery]);

  const handleLogout = async () => {
    const token = localStorage.getItem('session_token');
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('session_token');
    window.location.href = '/auth/login';
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone.replace(/[^0-9+]/g, '')}`;
  };

  if (isAuthenticated === null) {
    return (
      <div className="auth-container">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <EmergencyBar />
      <Header user={user} onLogout={handleLogout} />
      
      <main className="main">
        <div className="page-header">
          <h1 className="page-title">Services & Contacts</h1>
          <p className="page-subtitle">
            Find trusted professionals in your community
          </p>
        </div>

        {/* Search and Filter */}
        <div className="filters-section">
          <div className="filters-row">
            <div className="filter-group search-group">
              <label className="filter-label">Search</label>
              <input
                type="text"
                className="filter-input search-input"
                placeholder="Search by name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="filter-group">
              <label className="filter-label">Category</label>
              <select
                className="filter-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {serviceCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name} {cat.nameRu ? `/ ${cat.nameRu}` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="category-pills">
          <button
            className={`category-pill ${selectedCategory === '' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('')}
          >
            All
          </button>
          {serviceCategories.map(cat => (
            <button
              key={cat.id}
              className={`category-pill ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* Results count */}
        <div className="sort-bar">
          <span className="results-count">
            {filteredContacts.length} contact{filteredContacts.length !== 1 ? 's' : ''} found
          </span>
        </div>

        {/* Contacts Grid */}
        {filteredContacts.length > 0 ? (
          <div className="services-grid">
            {filteredContacts.map(contact => {
              const category = getServiceCategoryById(contact.categoryId);
              return (
                <div key={contact.id} className={`service-card ${contact.isPinned ? 'pinned' : ''}`}>
                  {contact.isPinned && (
                    <div className="pinned-badge">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      Recommended
                    </div>
                  )}
                  
                  <div className="service-header">
                    <div className="service-icon">
                      {category?.icon || '👤'}
                    </div>
                    <div className="service-info">
                      <h3 className="service-name">{contact.name}</h3>
                      {category && (
                        <span className="service-category">
                          {category.name}
                          {category.nameRu && <span className="service-category-ru"> / {category.nameRu}</span>}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {contact.description && (
                    <p className="service-description">{contact.description}</p>
                  )}
                  
                  {contact.languages && contact.languages.length > 0 && (
                    <div className="service-languages">
                      <span className="languages-label">Languages:</span>
                      {contact.languages.map(lang => (
                        <span key={lang} className="language-tag">{lang}</span>
                      ))}
                    </div>
                  )}
                  
                  <div className="service-phones">
                    <button 
                      className="phone-btn primary"
                      onClick={() => handleCall(contact.phone)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                      </svg>
                      {contact.phone}
                    </button>
                    
                    {contact.secondPhone && (
                      <button 
                        className="phone-btn secondary"
                        onClick={() => handleCall(contact.secondPhone!)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                          <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                        </svg>
                        {contact.secondPhone}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <h3>No contacts found</h3>
            <p>Try adjusting your filters or search query</p>
          </div>
        )}
      </main>
      
      <Footer />
    </>
  );
}
