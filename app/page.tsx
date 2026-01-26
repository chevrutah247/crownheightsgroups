'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GroupCard from '@/components/GroupCard';
import Filters from '@/components/Filters';
import EmergencyBar from '@/components/EmergencyBar';
import { categories, locations, bannerConfig, getLocationById, getCategoryById } from '@/lib/data';
import { Group } from '@/lib/types';

interface UserInfo {
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  
  // Groups state
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('1');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'popular' | 'alpha'>('popular');

  // Check authentication on mount
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
          setUser({
            name: data.user.name,
            email: data.user.email,
            role: data.user.role
          });
        } else {
          localStorage.removeItem('session_token');
          localStorage.removeItem('user_name');
          localStorage.removeItem('user_email');
          localStorage.removeItem('user_role');
          window.location.href = '/auth/login';
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = '/auth/login';
      }
    };
    
    checkAuth();
  }, []);

  // Load groups from API
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await fetch('/api/admin/groups');
        const data = await res.json();
        if (Array.isArray(data)) {
          setAllGroups(data.filter((g: Group) => g.status === 'approved'));
        }
      } catch (error) {
        console.error('Error fetching groups:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGroups();
  }, []);

  // Filter and sort groups
  useEffect(() => {
    let result = [...allGroups];
    
    // Filter by location
    if (selectedLocation) {
      result = result.filter(g => g.locationId === selectedLocation);
    }
    
    // Filter by category
    if (selectedCategory) {
      result = result.filter(g => g.categoryId === selectedCategory);
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(g => 
        g.title.toLowerCase().includes(query) ||
        g.description.toLowerCase().includes(query) ||
        g.tags?.some(t => t.toLowerCase().includes(query))
      );
    }
    
    // Separate pinned and non-pinned groups
    const pinnedGroups = result.filter(g => g.isPinned);
    const regularGroups = result.filter(g => !g.isPinned);
    
    // Sort pinned groups by pinnedOrder
    pinnedGroups.sort((a, b) => (a.pinnedOrder || 999) - (b.pinnedOrder || 999));
    
    // Sort regular groups
    switch (sortBy) {
      case 'popular':
        regularGroups.sort((a, b) => b.clicksCount - a.clicksCount);
        break;
      case 'date':
        regularGroups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'alpha':
        regularGroups.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }
    
    setFilteredGroups([...pinnedGroups, ...regularGroups]);
  }, [allGroups, selectedLocation, selectedCategory, searchQuery, sortBy]);

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
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_role');
    window.location.href = '/auth/login';
  };

  // Loading state
  if (isAuthenticated === null || loading) {
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
      
      {bannerConfig.enabled && (
        <div className="banner active">
          <strong>{bannerConfig.title}</strong> {bannerConfig.text}
          {bannerConfig.buttonLink && (
            <a href={bannerConfig.buttonLink}>{bannerConfig.buttonText}</a>
          )}
        </div>
      )}
      
      <main className="main">
        <div className="page-header">
          <h1 className="page-title">WhatsApp Groups Directory</h1>
          <p className="page-subtitle">
            Find and join community groups in Crown Heights and beyond
          </p>
        </div>
        
        <Filters
          locations={locations.filter(l => l.status === 'approved')}
          categories={categories}
          selectedLocation={selectedLocation}
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          onLocationChange={setSelectedLocation}
          onCategoryChange={setSelectedCategory}
          onSearchChange={setSearchQuery}
        />
        
        <div className="sort-bar">
          <span className="results-count">
            {filteredGroups.length} group{filteredGroups.length !== 1 ? 's' : ''} found
          </span>
          <div className="sort-options">
            <button 
              className={`sort-btn ${sortBy === 'popular' ? 'active' : ''}`}
              onClick={() => setSortBy('popular')}
            >
              Popular
            </button>
            <button 
              className={`sort-btn ${sortBy === 'date' ? 'active' : ''}`}
              onClick={() => setSortBy('date')}
            >
              Recent
            </button>
            <button 
              className={`sort-btn ${sortBy === 'alpha' ? 'active' : ''}`}
              onClick={() => setSortBy('alpha')}
            >
              A-Z
            </button>
          </div>
        </div>
        
        {filteredGroups.length > 0 ? (
          <>
            {/* Pinned groups section */}
            {filteredGroups.some(g => g.isPinned) && (
              <div className="pinned-section">
                <div className="section-header">
                  <span className="section-icon">⭐</span>
                  <span className="section-title">Featured Groups</span>
                </div>
                <div className="groups-grid">
                  {filteredGroups.filter(g => g.isPinned).map(group => (
                    <GroupCard
                      key={group.id}
                      group={group}
                      category={getCategoryById(group.categoryId)}
                      location={getLocationById(group.locationId)}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Regular groups section */}
            {filteredGroups.some(g => !g.isPinned) && (
              <div className="regular-section">
                {filteredGroups.some(g => g.isPinned) && (
                  <div className="section-header">
                    <span className="section-title">All Groups</span>
                  </div>
                )}
                <div className="groups-grid">
                  {filteredGroups.filter(g => !g.isPinned).map(group => (
                    <GroupCard
                      key={group.id}
                      group={group}
                      category={getCategoryById(group.categoryId)}
                      location={getLocationById(group.locationId)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <h3>No groups found</h3>
            <p>Try adjusting your filters or search query</p>
          </div>
        )}
      </main>
      
      <Footer />
    </>
  );
}
