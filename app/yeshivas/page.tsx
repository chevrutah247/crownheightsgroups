'use client';

import { useState, useMemo, type CSSProperties } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EmergencyBar from '@/components/EmergencyBar';
import {
  yeshivas,
  categoryLabels,
  type YeshivaCategory,
  type Yeshiva,
} from '@/lib/yeshivas-data';

const allCategories = Object.keys(categoryLabels) as YeshivaCategory[];

function getUniqueValues(field: keyof Yeshiva): string[] {
  const set = new Set<string>();
  for (const y of yeshivas) {
    const val = y[field];
    if (typeof val === 'string' && val) set.add(val);
  }
  return Array.from(set).sort();
}

export default function YeshivasPage() {
  const [user, setUser] = useState<{ name: string; email: string; role?: string } | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<YeshivaCategory | 'all'>('all');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedState, setSelectedState] = useState('all');

  const countries = useMemo(() => getUniqueValues('country'), []);
  const states = useMemo(() => {
    if (selectedCountry === 'all') return getUniqueValues('state');
    return Array.from(
      new Set(yeshivas.filter((y) => y.country === selectedCountry).map((y) => y.state).filter(Boolean))
    ).sort();
  }, [selectedCountry]);

  const filtered = useMemo(() => {
    let list = yeshivas;

    if (selectedCategory !== 'all') {
      list = list.filter((y) => y.category === selectedCategory);
    }
    if (selectedCountry !== 'all') {
      list = list.filter((y) => y.country === selectedCountry);
    }
    if (selectedState !== 'all') {
      list = list.filter((y) => y.state === selectedState);
    }

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((y) =>
        [y.name, y.address, y.city, y.state, y.country, y.phone || '', y.email || '', y.website || '']
          .join(' ')
          .toLowerCase()
          .includes(q)
      );
    }

    return list;
  }, [search, selectedCategory, selectedCountry, selectedState]);

  const groupedByCategory = useMemo(() => {
    const map = new Map<YeshivaCategory, Yeshiva[]>();
    for (const y of filtered) {
      if (!map.has(y.category)) map.set(y.category, []);
      map.get(y.category)!.push(y);
    }
    return map;
  }, [filtered]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/auth/login';
  };

  // Check auth on mount
  useState(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('session_token');
    if (!token) return;
    fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.valid) setUser({ name: data.user.name, email: data.user.email, role: data.user.role });
      })
      .catch(() => {});
  });

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f8fafc 0%, #edf2f7 100%)' }}>
      <EmergencyBar />
      <Header user={user} onLogout={handleLogout} />

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 50%, #1a5c3a 100%)', borderRadius: '20px', padding: '2rem', color: 'white', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '2rem' }}>📚</span>
            <h1 style={{ margin: 0, fontSize: '2rem' }}>Chabad Yeshiva Directory</h1>
          </div>
          <p style={{ marginTop: '0.5rem', marginBottom: 0, opacity: 0.9 }}>
            Comprehensive directory of Chabad educational institutions worldwide. Preschools, elementary schools, high schools, seminaries, and yeshivos gedolos.
          </p>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Badge text={`${yeshivas.length} institutions`} />
            <Badge text={`${countries.length} countries`} />
            <Badge text="Source: Merkos L'Inyonei Chinuch 2019-2020" />
          </div>
        </section>

        {/* Filters */}
        <section style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem', marginBottom: '1.5rem', boxShadow: '0 4px 14px rgba(15,23,42,0.04)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
            {/* Search */}
            <div style={{ gridColumn: '1 / -1' }}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, city, state, country..."
                style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '1rem', background: '#f8fafc' }}
              />
            </div>

            {/* Category Filter */}
            <div>
              <label style={labelStyle}>Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as YeshivaCategory | 'all')}
                style={selectStyle}
              >
                <option value="all">All Categories</option>
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>{categoryLabels[cat]}</option>
                ))}
              </select>
            </div>

            {/* Country Filter */}
            <div>
              <label style={labelStyle}>Country</label>
              <select
                value={selectedCountry}
                onChange={(e) => { setSelectedCountry(e.target.value); setSelectedState('all'); }}
                style={selectStyle}
              >
                <option value="all">All Countries</option>
                {countries.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* State Filter */}
            <div>
              <label style={labelStyle}>State / Region</label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                style={selectStyle}
              >
                <option value="all">All States</option>
                {states.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, color: '#1e3a5f', fontSize: '0.95rem' }}>
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </span>
            {(search || selectedCategory !== 'all' || selectedCountry !== 'all' || selectedState !== 'all') && (
              <button
                onClick={() => { setSearch(''); setSelectedCategory('all'); setSelectedCountry('all'); setSelectedState('all'); }}
                style={{ border: '1px solid #e2e8f0', background: '#f8fafc', borderRadius: '8px', padding: '0.3rem 0.7rem', fontSize: '0.85rem', cursor: 'pointer', color: '#64748b' }}
              >
                Clear filters
              </button>
            )}
          </div>
        </section>

        {/* Quick Category Tabs */}
        <section style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
          <button
            onClick={() => setSelectedCategory('all')}
            style={{
              ...pillBtn,
              background: selectedCategory === 'all' ? '#1d4ed8' : 'white',
              color: selectedCategory === 'all' ? 'white' : '#334155',
            }}
          >
            All ({yeshivas.length})
          </button>
          {allCategories.map((cat) => {
            const count = yeshivas.filter((y) => y.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  ...pillBtn,
                  background: selectedCategory === cat ? '#1d4ed8' : 'white',
                  color: selectedCategory === cat ? 'white' : '#334155',
                }}
              >
                {categoryLabels[cat]} ({count})
              </button>
            );
          })}
        </section>

        {/* Results */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
            <p style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No institutions found</p>
            <p>Try adjusting your search or filters.</p>
          </div>
        ) : (
          Array.from(groupedByCategory.entries()).map(([cat, items]) => (
            <section key={cat} style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.35rem', color: '#1e3a5f', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>{catIcon(cat)}</span>
                {categoryLabels[cat]}
                <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#64748b' }}>({items.length})</span>
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '0.85rem' }}>
                {items.map((y, i) => (
                  <YeshivaCard key={`${cat}-${i}`} yeshiva={y} />
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      <Footer />
    </div>
  );
}

function catIcon(cat: YeshivaCategory): string {
  switch (cat) {
    case 'early-childhood': return '💒';
    case 'elementary': return '🏫';
    case 'high-school': return '🎓';
    case 'seminary': return '👩\u200D🎓';
    case 'yeshiva-gedolah': return '📖';
    default: return '📚';
  }
}

function YeshivaCard({ yeshiva: y }: { yeshiva: Yeshiva }) {
  return (
    <article style={cardStyle}>
      <div style={{ padding: '1rem' }}>
        <h3 style={{ margin: '0 0 0.4rem', fontSize: '1.05rem', color: '#0f172a' }}>{y.name}</h3>
        <p style={{ margin: '0 0 0.3rem', color: '#334155', fontSize: '0.92rem' }}>📍 {y.address}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.5rem' }}>
          <span style={tagBlue}>{y.country}</span>
          {y.state && <span style={tagGray}>{y.state}</span>}
          {y.grades && <span style={tagGreen}>{y.grades}</span>}
          {y.gender && <span style={tagPurple}>{y.gender === 'boys' ? 'Boys' : y.gender === 'girls' ? 'Girls' : 'Co-Ed'}</span>}
          {y.founded && <span style={tagAmber}>Est. {y.founded}</span>}
        </div>
        <div style={{ marginTop: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          {y.phone && (
            <p style={{ margin: 0, fontSize: '0.88rem' }}>
              ☎️ <a href={`tel:${y.phone.replace(/[^0-9+]/g, '')}`} style={{ color: '#0f766e', textDecoration: 'none' }}>{y.phone}</a>
            </p>
          )}
          {y.email && (
            <p style={{ margin: 0, fontSize: '0.88rem' }}>
              ✉️ <a href={`mailto:${y.email}`} style={{ color: '#2563eb', textDecoration: 'none' }}>{y.email}</a>
            </p>
          )}
          {y.website && (
            <p style={{ margin: 0, fontSize: '0.88rem' }}>
              🌐 <a href={y.website.startsWith('http') ? y.website : `https://${y.website}`} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'none' }}>{y.website}</a>
            </p>
          )}
          {y.principal && <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569' }}>Principal: {y.principal}</p>}
          {y.director && <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569' }}>Director: {y.director}</p>}
          {y.dean && <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569' }}>Dean: {y.dean}</p>}
        </div>
      </div>
    </article>
  );
}

function Badge({ text }: { text: string }) {
  return <div style={{ background: 'rgba(255,255,255,0.14)', borderRadius: '12px', padding: '0.55rem 0.85rem', fontSize: '0.9rem' }}>{text}</div>;
}

const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: '#64748b',
  marginBottom: '0.25rem',
  textTransform: 'uppercase',
  letterSpacing: '0.03em',
};

const selectStyle: CSSProperties = {
  width: '100%',
  padding: '0.65rem 0.75rem',
  borderRadius: '10px',
  border: '1px solid #cbd5e1',
  fontSize: '0.92rem',
  background: '#f8fafc',
  cursor: 'pointer',
};

const pillBtn: CSSProperties = {
  border: '1px solid #cbd5e1',
  borderRadius: '999px',
  padding: '0.4rem 0.8rem',
  fontWeight: 600,
  fontSize: '0.85rem',
  cursor: 'pointer',
};

const cardStyle: CSSProperties = {
  background: 'white',
  borderRadius: '14px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 4px 14px rgba(15, 23, 42, 0.05)',
  overflow: 'hidden',
  transition: 'box-shadow 0.2s ease, transform 0.2s ease',
};

const tagBlue: CSSProperties = {
  background: '#dbeafe',
  color: '#1e40af',
  borderRadius: '6px',
  padding: '0.15rem 0.45rem',
  fontSize: '0.78rem',
  fontWeight: 600,
};

const tagGray: CSSProperties = {
  background: '#f1f5f9',
  color: '#475569',
  borderRadius: '6px',
  padding: '0.15rem 0.45rem',
  fontSize: '0.78rem',
  fontWeight: 500,
};

const tagGreen: CSSProperties = {
  background: '#dcfce7',
  color: '#166534',
  borderRadius: '6px',
  padding: '0.15rem 0.45rem',
  fontSize: '0.78rem',
  fontWeight: 600,
};

const tagPurple: CSSProperties = {
  background: '#f3e8ff',
  color: '#7c3aed',
  borderRadius: '6px',
  padding: '0.15rem 0.45rem',
  fontSize: '0.78rem',
  fontWeight: 600,
};

const tagAmber: CSSProperties = {
  background: '#fef3c7',
  color: '#92400e',
  borderRadius: '6px',
  padding: '0.15rem 0.45rem',
  fontSize: '0.78rem',
  fontWeight: 500,
};
