'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Group, Category } from '@/lib/types';

interface CategoryPageClientProps {
  slug: string;
}

interface UserInfo { name: string; email: string; role: 'user' | 'admin'; }

export default function CategoryPageClient({ slug }: CategoryPageClientProps) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('session_token');
      if (!token) { window.location.href = '/auth/login'; return; }
      try {
        const response = await fetch('/api/auth/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) });
        const data = await response.json();
        if (data.valid) setUser({ name: data.user.name, email: data.user.email, role: data.user.role });
        else { localStorage.clear(); window.location.href = '/auth/login'; }
      } catch { window.location.href = '/auth/login'; }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [groupsRes, catsRes] = await Promise.all([
          fetch('/api/admin/groups'),
          fetch('/api/admin/group-categories')
        ]);
        const groupsData = await groupsRes.json();
        const catsData = await catsRes.json();
        const cat = catsData.find((c: Category) => c.slug === slug);
        setCategory(cat || null);
        if (cat && Array.isArray(groupsData)) {
          setGroups(groupsData.filter((g: Group) => g.categoryId === cat.id && g.status === 'approved'));
        }
      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [slug]);

  const handleLogout = () => { localStorage.clear(); window.location.href = '/auth/login'; };

  if (loading) return <div className="auth-container"><div className="loading"><div className="spinner"></div></div></div>;

  return (
    <>
      <Header user={user} onLogout={handleLogout} />
      <main className="main">
        <div className="page-header">
          <h1 className="page-title">{category?.icon} {category?.name || 'Category'}</h1>
          <p className="page-subtitle">{groups.length} groups</p>
        </div>
        {groups.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {groups.map(group => {
              const links = (group as any).whatsappLinks || [(group as any).whatsappLink].filter(Boolean);
              return (
                <div key={group.id} style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0' }}>{group.title}</h3>
                  <p style={{ color: '#666', fontSize: '0.9rem', margin: '0 0 1rem 0' }}>{group.description}</p>
                  {links[0] && <a href={links[0]} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '0.75rem 1.5rem', background: '#25D366', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>Join Group</a>}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}><h3>No groups found</h3></div>
        )}
      </main>
      <Footer />
    </>
  );
}
