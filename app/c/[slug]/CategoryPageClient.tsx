'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GroupCard from '@/components/GroupCard';
import { Category, Group, Location } from '@/lib/types';

const GATE_STORAGE_KEY = 'ch_access_granted';

interface Props {
  category: Category;
  groups: (Group & { category?: Category; location?: Location })[];
  locations: Location[];
}

export default function CategoryPageClient({ category, groups, locations }: Props) {
  const [accessGranted, setAccessGranted] = useState<boolean | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(GATE_STORAGE_KEY);
    if (stored) {
      const { expiry } = JSON.parse(stored);
      if (new Date().getTime() < expiry) {
        setAccessGranted(true);
      } else {
        window.location.href = '/';
      }
    } else {
      window.location.href = '/';
    }
  }, []);

  if (accessGranted === null) {
    return (
      <div className="gate-container">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      
      <main className="main">
        <div className="page-header">
          <h1 className="page-title">
            {category.icon} {category.name}
          </h1>
          <p className="page-subtitle">
            {groups.length} group{groups.length !== 1 ? 's' : ''} in this category
          </p>
        </div>
        
        {groups.length > 0 ? (
          <div className="groups-grid">
            {groups.map(group => (
              <GroupCard
                key={group.id}
                group={group}
                category={group.category}
                location={group.location}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <h3>No groups yet</h3>
            <p>Be the first to suggest a group in this category!</p>
          </div>
        )}
      </main>
      
      <Footer />
    </>
  );
}
