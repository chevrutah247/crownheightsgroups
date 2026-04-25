'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { GoodFor, Hashgacha, HashgachaId, Restaurant, RestaurantType } from '@/lib/restaurants-data';

type TypeFilter = 'all' | RestaurantType;
type HashgachaFilter = 'all' | HashgachaId;
type GoodForFilter = 'all' | GoodFor;

const TYPE_LABELS: Record<RestaurantType, { label: string; icon: string }> = {
  meat: { label: 'Meat', icon: '🥩' },
  dairy: { label: 'Dairy', icon: '🥛' },
  parve: { label: 'Parve', icon: '🌿' },
  fish: { label: 'Fish', icon: '🐟' },
  pizza: { label: 'Pizza', icon: '🍕' },
  bakery: { label: 'Bakery', icon: '🥐' },
  sushi: { label: 'Sushi', icon: '🍣' },
  'ice-cream': { label: 'Ice Cream', icon: '🍦' },
  catering: { label: 'Catering', icon: '🍽️' },
  butcher: { label: 'Butcher', icon: '🔪' },
  matzah: { label: 'Matzah', icon: '🍞' },
  grocery: { label: 'Grocery', icon: '🛒' },
  venue: { label: 'Venue', icon: '🎪' },
  vegan: { label: 'Vegan', icon: '🌱' },
};

const GOOD_FOR_LABELS: Record<GoodFor, { label: string; icon: string }> = {
  breakfast: { label: 'Breakfast', icon: '🥞' },
  brunch: { label: 'Brunch', icon: '🍳' },
  lunch: { label: 'Lunch', icon: '🥪' },
  dinner: { label: 'Dinner', icon: '🍽️' },
  coffee: { label: 'Coffee', icon: '☕' },
  tea: { label: 'Tea', icon: '🍵' },
  dessert: { label: 'Dessert', icon: '🍰' },
  takeout: { label: 'Take-out', icon: '🥡' },
  delivery: { label: 'Delivery', icon: '🛵' },
  'date-night': { label: 'Date Night', icon: '💕' },
  family: { label: 'Family', icon: '👨‍👩‍👧' },
  cocktails: { label: 'Cocktails', icon: '🍸' },
};

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [hashgachas, setHashgachas] = useState<Record<HashgachaId, Hashgacha> | null>(null);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [hashgachaFilter, setHashgachaFilter] = useState<HashgachaFilter>('all');
  const [goodForFilter, setGoodForFilter] = useState<GoodForFilter>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/restaurants')
      .then((r) => r.json())
      .then((d) => {
        setRestaurants(Array.isArray(d.restaurants) ? d.restaurants : []);
        setHashgachas(d.hashgachas || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return restaurants.filter((r) => {
      if (typeFilter !== 'all' && r.type !== typeFilter) return false;
      if (hashgachaFilter !== 'all' && r.hashgacha !== hashgachaFilter) return false;
      if (goodForFilter !== 'all' && (!r.goodFor || !r.goodFor.includes(goodForFilter))) return false;
      if (search) {
        const q = search.toLowerCase();
        const haystack = [r.name, r.address, r.cuisine, r.notes].filter(Boolean).join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [restaurants, typeFilter, hashgachaFilter, goodForFilter, search]);

  const goodForCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of restaurants) {
      for (const gf of r.goodFor || []) counts[gf] = (counts[gf] || 0) + 1;
    }
    return counts;
  }, [restaurants]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of restaurants) counts[r.type] = (counts[r.type] || 0) + 1;
    return counts;
  }, [restaurants]);

  const hashgachaCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of restaurants) counts[r.hashgacha] = (counts[r.hashgacha] || 0) + 1;
    return counts;
  }, [restaurants]);

  const availableTypes = Object.keys(TYPE_LABELS).filter((t) => typeCounts[t]) as RestaurantType[];

  return (
    <div>
      <Header user={null} onLogout={() => {}} />

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg,#1e3a5f 0%,#2d5a87 100%)', color: 'white', padding: '2.5rem 1rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.9rem' }}>← Back to Crown Heights Groups</Link>
          <h1 style={{ fontSize: '2rem', margin: '0.75rem 0 0.25rem', fontWeight: 800 }}>
            🍽️ Crown Heights Restaurants
          </h1>
          <p style={{ margin: 0, opacity: 0.85 }}>
            Kosher restaurants, cafes, bakeries & caterers — with hashgacha info
          </p>
          <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', opacity: 0.75 }}>
            {loading ? 'Loading…' : `${restaurants.length} establishments`}
          </div>
        </div>
      </section>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1rem' }}>

        {/* Search */}
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Search by name, address, cuisine…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }}
          />
        </div>

        {/* Type filters */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          <Chip active={typeFilter === 'all'} onClick={() => setTypeFilter('all')}>
            All · {restaurants.length}
          </Chip>
          {availableTypes.map((t) => (
            <Chip key={t} active={typeFilter === t} onClick={() => setTypeFilter(t)}>
              {TYPE_LABELS[t].icon} {TYPE_LABELS[t].label} · {typeCounts[t] || 0}
            </Chip>
          ))}
        </div>

        {/* "Good for" filters */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', marginRight: '0.25rem' }}>Good for:</span>
          <Chip active={goodForFilter === 'all'} onClick={() => setGoodForFilter('all')}>
            Anytime
          </Chip>
          {(Object.keys(GOOD_FOR_LABELS) as GoodFor[])
            .filter((gf) => goodForCounts[gf])
            .map((gf) => (
              <Chip key={gf} active={goodForFilter === gf} onClick={() => setGoodForFilter(gf)}>
                {GOOD_FOR_LABELS[gf].icon} {GOOD_FOR_LABELS[gf].label} · {goodForCounts[gf] || 0}
              </Chip>
            ))}
        </div>

        {/* Hashgacha filters */}
        {hashgachas && (
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', marginRight: '0.25rem' }}>Hashgacha:</span>
            <Chip active={hashgachaFilter === 'all'} onClick={() => setHashgachaFilter('all')}>
              All
            </Chip>
            {(Object.keys(hashgachas) as HashgachaId[])
              .filter((id) => hashgachaCounts[id])
              .sort((a, b) => (hashgachaCounts[b] || 0) - (hashgachaCounts[a] || 0))
              .map((id) => {
                const h = hashgachas[id];
                const count = hashgachaCounts[id] || 0;
                return (
                  <Chip key={id} active={hashgachaFilter === id} onClick={() => setHashgachaFilter(id)} color={h.color}>
                    {h.isLocal ? '⭐ ' : ''}{h.name} · {count}
                  </Chip>
                );
              })}
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            No restaurants match your filters.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {filtered.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} hashgacha={hashgachas?.[r.hashgacha]} />
            ))}
          </div>
        )}

        {/* Hashgacha directory info */}
        {hashgachas && (
          <section style={{ marginTop: '3rem', padding: '1.5rem', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h2 style={{ margin: '0 0 0.75rem', fontSize: '1.25rem', color: '#1e3a5f' }}>🏛️ Hashgacha Authorities</h2>
            <p style={{ color: '#475569', fontSize: '0.9rem', margin: '0 0 1rem' }}>
              Kosher certification organizations and their directories:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem' }}>
              {(Object.values(hashgachas) as Hashgacha[])
                .sort((a, b) => (b.isLocal ? 1 : 0) - (a.isLocal ? 1 : 0))
                .map((h) => (
                  <a
                    key={h.id}
                    href={h.website || '#'}
                    target={h.website ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    style={{
                      display: 'block',
                      padding: '0.75rem',
                      borderRadius: '10px',
                      background: h.isLocal ? '#fef3c7' : '#f8fafc',
                      border: h.isLocal ? '2px solid #f59e0b' : '1px solid #e2e8f0',
                      textDecoration: 'none',
                      color: '#1e3a5f',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ background: h.color, color: 'white', padding: '3px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700 }}>
                        {h.shortName}
                      </span>
                      <span style={{ fontWeight: 700 }}>{h.name}</span>
                      {h.isLocal && <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: '#b45309', fontWeight: 700 }}>⭐ LOCAL</span>}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{h.fullName}</div>
                    {h.website && (
                      <div style={{ fontSize: '0.7rem', color: '#2563eb', marginTop: '0.25rem' }}>
                        {h.website.replace(/^https?:\/\//, '')} ↗
                      </div>
                    )}
                  </a>
                ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

function Chip({ active, onClick, color, children }: { active: boolean; onClick: () => void; color?: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '0.4rem 0.85rem',
        borderRadius: '999px',
        border: active ? `2px solid ${color || '#1e3a5f'}` : '1px solid #cbd5e1',
        background: active ? (color || '#1e3a5f') : 'white',
        color: active ? 'white' : '#334155',
        fontSize: '0.8rem',
        fontWeight: 700,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  );
}

function RestaurantCard({ restaurant, hashgacha }: { restaurant: Restaurant; hashgacha?: Hashgacha }) {
  const typeMeta = TYPE_LABELS[restaurant.type];
  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.5rem' }}>
        <div style={{ fontSize: '2.2rem', lineHeight: 1 }}>{typeMeta.icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.05rem', color: '#1e3a5f', fontWeight: 700 }}>
            {restaurant.name}
          </h3>
          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {hashgacha && (
              <span
                title={hashgacha.fullName}
                style={{
                  background: hashgacha.color,
                  color: 'white',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  letterSpacing: '0.3px',
                }}
              >
                {hashgacha.isLocal ? '⭐ ' : ''}{hashgacha.shortName}
              </span>
            )}
            <span style={{ background: '#e2e8f0', color: '#475569', fontSize: '0.65rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px' }}>
              {typeMeta.label}
            </span>
            {restaurant.priceRange && (
              <span style={{ color: '#16a34a', fontSize: '0.8rem', fontWeight: 700 }}>{restaurant.priceRange}</span>
            )}
          </div>
        </div>
      </div>
      {restaurant.cuisine && (
        <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.3rem' }}>{restaurant.cuisine}</div>
      )}
      {restaurant.address && (
        <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.15rem' }}>📍 {restaurant.address}</div>
      )}
      {restaurant.phone && (
        <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.15rem' }}>📞 <a href={`tel:${restaurant.phone.replace(/-/g, '')}`} style={{ color: '#2563eb', textDecoration: 'none' }}>{restaurant.phone}</a></div>
      )}
      {restaurant.hours && (
        <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.15rem' }}>🕐 {restaurant.hours}</div>
      )}
      {restaurant.hashgachaNote && (
        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem', fontStyle: 'italic' }}>{restaurant.hashgachaNote}</div>
      )}
      {restaurant.goodFor && restaurant.goodFor.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.5rem' }}>
          {restaurant.goodFor.map((gf) => {
            const meta = GOOD_FOR_LABELS[gf];
            if (!meta) return null;
            return (
              <span
                key={gf}
                title={`Good for ${meta.label}`}
                style={{
                  background: '#f1f5f9',
                  color: '#334155',
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  padding: '2px 7px',
                  borderRadius: '999px',
                }}
              >
                {meta.icon} {meta.label}
              </span>
            );
          })}
        </div>
      )}
      {restaurant.notes && (
        <div style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.35rem', fontStyle: 'italic' }}>ℹ️ {restaurant.notes}</div>
      )}
      {(restaurant.website || restaurant.instagram) && (
        <div style={{ marginTop: '0.6rem', display: 'flex', gap: '0.5rem' }}>
          {restaurant.website && (
            <a href={restaurant.website} target="_blank" rel="noopener noreferrer" style={linkBtn}>Website ↗</a>
          )}
          {restaurant.instagram && (
            <a href={restaurant.instagram} target="_blank" rel="noopener noreferrer" style={linkBtn}>Instagram ↗</a>
          )}
        </div>
      )}
    </div>
  );
}

const cardStyle: CSSProperties = {
  background: 'white',
  borderRadius: '12px',
  padding: '1rem',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  border: '1px solid #e2e8f0',
};
const linkBtn: CSSProperties = {
  display: 'inline-block',
  padding: '0.35rem 0.7rem',
  fontSize: '0.75rem',
  fontWeight: 600,
  color: '#2563eb',
  background: '#eff6ff',
  borderRadius: '6px',
  textDecoration: 'none',
  border: '1px solid #dbeafe',
};
