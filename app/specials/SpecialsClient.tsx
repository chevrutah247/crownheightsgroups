'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const ALL_STORES = [
  {
    id: 'koshertown',
    name: 'KosherTown',
    logo: '/images/koshertown-logo.svg',
    url: 'https://koshertown.com/brooklyn/category/specials',
    hasApi: true,
  },
  {
    id: 'kosherfamily',
    name: 'Kosher Family',
    logo: '/images/kosherfamily-logo.svg',
    url: 'https://kosherfamily.com/Brooklyn-Crown-Heights/category/specials',
    hasApi: true,
  },
  {
    id: 'empire',
    name: 'Empire Kosher',
    logo: '/images/empirekosher-logo.svg',
    url: 'https://empirekoshersupermarket.com/empire/category/specials',
    hasApi: true,
  },
  {
    id: 'kahans',
    name: "Kahan's Kosher",
    logo: '/images/kahanskosher-logo.svg',
    url: 'https://www.kahanskosher.com/specials',
    hasApi: false,
  },
];

interface StoreSpecial {
  id: string;
  name: string;
  normalizedName: string;
  price: number;
  priceDisplay: string;
  oldPrice: string | null;
  category: string;
  image: string;
  sku: string;
  store: string;
  storeName: string;
}

interface Comparison {
  productName: string;
  category: string;
  prices: {
    store: string;
    storeName: string;
    price: number;
    priceDisplay: string;
    image: string;
  }[];
  cheapestStore: string;
}

interface SpecialsData {
  timestamp: number;
  stores: { id: string; name: string; logo: string; url: string; count: number }[];
  byStore: Record<string, StoreSpecial[]>;
  comparisons: Comparison[];
}

type TabId = 'koshertown' | 'kosherfamily' | 'empire' | 'kahans' | 'compare';

export default function SpecialsClient() {
  const [data, setData] = useState<SpecialsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabId>('compare');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/store-specials')
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError('Failed to load specials'); setLoading(false); });
  }, []);

  const filteredProducts = (storeId: string): StoreSpecial[] => {
    if (!data?.byStore[storeId]) return [];
    if (!searchQuery) return data.byStore[storeId];
    const q = searchQuery.toLowerCase();
    return data.byStore[storeId].filter(p =>
      p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  };

  const filteredComparisons = (): Comparison[] => {
    if (!data?.comparisons) return [];
    if (!searchQuery) return data.comparisons;
    const q = searchQuery.toLowerCase();
    return data.comparisons.filter(c =>
      c.productName.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)
    );
  };

  const updatedAgo = data?.timestamp
    ? Math.round((Date.now() - data.timestamp) / 60000)
    : null;

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)',
        color: 'white',
        padding: '2rem 1rem',
        textAlign: 'center',
      }}>
        <Link href="/" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.9rem' }}>
          ← Back to Crown Heights Groups
        </Link>
        <h1 style={{ fontSize: '1.75rem', margin: '0.75rem 0 0.25rem', fontWeight: 'bold' }}>
          Store Specials — Price Comparison
        </h1>
        <p style={{ opacity: 0.8, margin: 0 }}>
          Compare weekly specials from Crown Heights kosher grocery stores
        </p>
        {updatedAgo !== null && (
          <p style={{ opacity: 0.6, fontSize: '0.8rem', marginTop: '0.5rem' }}>
            Updated {updatedAgo < 1 ? 'just now' : `${updatedAgo} min ago`}
          </p>
        )}
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1rem' }}>
        {/* Store Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '1rem',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          {ALL_STORES.map(store => (
            <button
              key={store.id}
              onClick={() => store.hasApi ? setActiveTab(store.id as TabId) : window.open(store.url, '_blank')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.75rem 1rem',
                background: activeTab === store.id ? '#fff' : 'rgba(255,255,255,0.7)',
                border: activeTab === store.id ? '2px solid #1e3a5f' : '2px solid transparent',
                borderRadius: '12px',
                cursor: 'pointer',
                minWidth: '100px',
                transition: 'all 0.2s',
                boxShadow: activeTab === store.id ? '0 2px 8px rgba(30,58,95,0.2)' : 'none',
                position: 'relative',
              }}
            >
              <img
                src={store.logo}
                alt={store.name}
                style={{ height: '40px', objectFit: 'contain', maxWidth: '80px' }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#333' }}>{store.name}</span>
              {!store.hasApi && (
                <span style={{
                  fontSize: '0.6rem',
                  background: '#f59e0b',
                  color: 'white',
                  padding: '1px 6px',
                  borderRadius: '8px',
                }}>Visit Site ↗</span>
              )}
              {store.hasApi && data?.byStore[store.id] && (
                <span style={{ fontSize: '0.65rem', color: '#666' }}>
                  {data.byStore[store.id].length} items
                </span>
              )}
            </button>
          ))}

          {/* Compare tab */}
          <button
            onClick={() => setActiveTab('compare')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.75rem 1.25rem',
              background: activeTab === 'compare'
                ? 'linear-gradient(135deg, #059669, #047857)'
                : 'linear-gradient(135deg, #10b981, #059669)',
              border: activeTab === 'compare' ? '2px solid #047857' : '2px solid transparent',
              borderRadius: '12px',
              cursor: 'pointer',
              minWidth: '100px',
              transition: 'all 0.2s',
              color: 'white',
              boxShadow: activeTab === 'compare' ? '0 2px 8px rgba(5,150,105,0.3)' : 'none',
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>⚖️</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Compare</span>
            {data?.comparisons && (
              <span style={{ fontSize: '0.65rem', opacity: 0.9 }}>
                {data.comparisons.length} matches
              </span>
            )}
          </button>
        </div>

        {/* Search */}
        <div style={{ marginBottom: '1.5rem' }}>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              border: '1px solid #ddd',
              fontSize: '1rem',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Content */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
            <p style={{ color: '#666' }}>Loading specials from stores...</p>
          </div>
        )}

        {error && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#dc2626' }}>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && activeTab === 'compare' && (
          <CompareView comparisons={filteredComparisons()} />
        )}

        {!loading && !error && activeTab !== 'compare' && activeTab !== 'kahans' && (
          <StoreView products={filteredProducts(activeTab)} storeName={ALL_STORES.find(s => s.id === activeTab)?.name || ''} />
        )}
      </div>
    </div>
  );
}

function StoreView({ products, storeName }: { products: StoreSpecial[]; storeName: string }) {
  if (products.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
        No specials found for {storeName}
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '1rem',
    }}>
      {products.map(p => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

function ProductCard({ product, showStore }: { product: StoreSpecial; showStore?: boolean }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      transition: 'transform 0.2s',
    }}>
      {product.image && (
        <div style={{
          height: '140px',
          background: '#f9f9f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}>
          <img
            src={product.image}
            alt={product.name}
            style={{ maxHeight: '130px', maxWidth: '90%', objectFit: 'contain' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      )}
      <div style={{ padding: '0.75rem' }}>
        <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.25rem' }}>
          {product.category}
        </div>
        <div style={{
          fontSize: '0.9rem',
          fontWeight: 600,
          color: '#333',
          marginBottom: '0.5rem',
          lineHeight: 1.3,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {product.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#059669' }}>
            {product.priceDisplay}
          </span>
          {product.oldPrice && (
            <span style={{ fontSize: '0.85rem', color: '#999', textDecoration: 'line-through' }}>
              {product.oldPrice}
            </span>
          )}
        </div>
        {showStore && (
          <div style={{
            fontSize: '0.7rem',
            marginTop: '0.4rem',
            background: '#f0f0f0',
            display: 'inline-block',
            padding: '2px 8px',
            borderRadius: '8px',
            color: '#666',
          }}>
            {product.storeName}
          </div>
        )}
      </div>
    </div>
  );
}

function CompareView({ comparisons }: { comparisons: Comparison[] }) {
  if (comparisons.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
        <p>No matching products found across stores</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <p style={{ color: '#666', fontSize: '0.9rem', textAlign: 'center' }}>
        Showing {comparisons.length} products found in multiple stores
      </p>
      {comparisons.map((comp, i) => (
        <div key={i} style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#888' }}>{comp.category}</span>
            <h3 style={{ margin: '0.25rem 0 0', fontSize: '1rem', color: '#333' }}>
              {comp.productName}
            </h3>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${comp.prices.length}, 1fr)`,
            gap: '0.75rem',
          }}>
            {comp.prices
              .sort((a, b) => a.price - b.price)
              .map((p, j) => {
                const isCheapest = p.store === comp.cheapestStore;
                return (
                  <div key={j} style={{
                    padding: '0.75rem',
                    borderRadius: '10px',
                    background: isCheapest ? '#ecfdf5' : '#f9fafb',
                    border: isCheapest ? '2px solid #059669' : '1px solid #e5e7eb',
                    textAlign: 'center',
                    position: 'relative',
                  }}>
                    {isCheapest && (
                      <div style={{
                        position: 'absolute',
                        top: '-8px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: '#059669',
                        color: 'white',
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '8px',
                        whiteSpace: 'nowrap',
                      }}>
                        BEST PRICE
                      </div>
                    )}
                    {p.image && (
                      <img
                        src={p.image}
                        alt=""
                        style={{ height: '50px', objectFit: 'contain', marginBottom: '0.25rem' }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    )}
                    <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.25rem' }}>
                      {p.storeName}
                    </div>
                    <div style={{
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                      color: isCheapest ? '#059669' : '#333',
                    }}>
                      {p.priceDisplay}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}
