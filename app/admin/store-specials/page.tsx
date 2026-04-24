'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import Link from 'next/link';

interface ManualSpecial {
  id: string;
  name: string;
  brand?: string;
  size?: string;
  priceSale: string;
  priceWas?: string;
  endsAt?: string;
  category?: string;
  note?: string;
}

interface ManualStore {
  id: string;
  name: string;
  logo?: string;
  logoEmoji?: string;
  address?: string;
  phone?: string;
  referenceUrl?: string;
  updateInstructions?: string;
  specials: ManualSpecial[];
  updatedAt?: string;
  updatedBy?: string;
}

export default function AdminStoreSpecialsPage() {
  const [stores, setStores] = useState<ManualStore[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/store-specials');
      if (!r.ok) throw new Error('Not authorized');
      const data = await r.json();
      if (Array.isArray(data)) {
        setStores(data);
        if (data.length > 0 && !activeId) setActiveId(data[0].id);
      }
    } catch (e) {
      setMsg('Failed to load. Make sure you are signed in as admin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const active = stores.find((s) => s.id === activeId);

  const updateSpecial = (idx: number, patch: Partial<ManualSpecial>) => {
    if (!active) return;
    const newSpecials = active.specials.map((s, i) => (i === idx ? { ...s, ...patch } : s));
    setStores(stores.map((s) => (s.id === active.id ? { ...s, specials: newSpecials } : s)));
  };

  const deleteSpecial = (idx: number) => {
    if (!active) return;
    const newSpecials = active.specials.filter((_, i) => i !== idx);
    setStores(stores.map((s) => (s.id === active.id ? { ...s, specials: newSpecials } : s)));
  };

  const addBlankSpecial = () => {
    if (!active) return;
    const newSpecial: ManualSpecial = {
      id: `${active.id}-${Date.now()}`,
      name: '',
      brand: '',
      size: '',
      priceSale: '',
      priceWas: '',
      endsAt: '',
      category: '',
      note: '',
    };
    setStores(stores.map((s) => (s.id === active.id ? { ...s, specials: [newSpecial, ...s.specials] } : s)));
  };

  const clearAll = () => {
    if (!active) return;
    if (!confirm(`Clear ALL ${active.specials.length} specials for ${active.name}?`)) return;
    setStores(stores.map((s) => (s.id === active.id ? { ...s, specials: [] } : s)));
  };

  const updateStoreMeta = (patch: Partial<ManualStore>) => {
    if (!active) return;
    setStores(stores.map((s) => (s.id === active.id ? { ...s, ...patch } : s)));
  };

  const save = async () => {
    if (!active) return;
    setSaving(true);
    setMsg('');
    try {
      const r = await fetch('/api/admin/store-specials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: active.id,
          specials: active.specials,
          referenceUrl: active.referenceUrl,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Save failed');
      setMsg(`Saved ${active.specials.length} specials for ${active.name}. Public cache invalidated.`);
      await load();
      setActiveId(active.id);
    } catch (e: any) {
      setMsg(`Error: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' }}>
        <p>Loading…</p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <Link href="/admin" style={{ color: '#2563eb', textDecoration: 'none', fontSize: '0.9rem' }}>
          &larr; Back to Admin
        </Link>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Store Specials (manual stores)</h1>
      </div>

      <p style={{ color: '#64748b', marginBottom: '1rem' }}>
        These stores don't have an auto-fetch API. Update weekly — ideally each Monday. KosherTown, Empire, and Kosher Family are fetched automatically every 2 hours.
      </p>

      {/* Store picker */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {stores.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveId(s.id)}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: '10px',
              border: activeId === s.id ? '2px solid #2563eb' : '1px solid #cbd5e1',
              background: activeId === s.id ? '#dbeafe' : '#fff',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {s.logoEmoji || '🛒'} {s.name}
            <span style={{ marginLeft: '0.4rem', background: '#e2e8f0', color: '#475569', fontSize: '0.75rem', padding: '1px 8px', borderRadius: '8px' }}>{s.specials.length}</span>
          </button>
        ))}
      </div>

      {!active ? null : (
        <>
          {/* Store meta */}
          <section style={cardStyle}>
            <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem' }}>{active.name}</h2>
            {active.address && <div style={{ fontSize: '0.85rem', color: '#64748b' }}>📍 {active.address}</div>}
            {active.phone && <div style={{ fontSize: '0.85rem', color: '#64748b' }}>📞 {active.phone}</div>}
            {active.updatedAt && (
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>
                Last updated: {new Date(active.updatedAt).toLocaleString()}{active.updatedBy ? ` by ${active.updatedBy}` : ''}
              </div>
            )}
            {active.updateInstructions && (
              <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.8rem', background: '#fef3c7', borderLeft: '3px solid #f59e0b', borderRadius: '6px', fontSize: '0.85rem' }}>
                💡 {active.updateInstructions}
              </div>
            )}
            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 400px' }}>
                <span style={{ fontSize: '0.85rem', color: '#475569', whiteSpace: 'nowrap' }}>Reference URL:</span>
                <input
                  type="url"
                  value={active.referenceUrl || ''}
                  onChange={(e) => updateStoreMeta({ referenceUrl: e.target.value })}
                  placeholder="https://example.com/specials"
                  style={{ ...inputStyle, flex: 1 }}
                />
              </label>
              {active.referenceUrl && (
                <a href={active.referenceUrl} target="_blank" rel="noopener noreferrer" style={btnLink}>
                  Open {active.name} ↗
                </a>
              )}
            </div>
          </section>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', margin: '1rem 0' }}>
            <button onClick={addBlankSpecial} style={btnPrimary}>+ Add special</button>
            <button onClick={clearAll} style={btnWarn} disabled={active.specials.length === 0}>Clear all</button>
            <div style={{ flex: 1 }} />
            <button onClick={save} style={btnSave} disabled={saving}>
              {saving ? 'Saving…' : `Save (${active.specials.length} items)`}
            </button>
          </div>

          {msg && <div style={{ padding: '0.6rem 0.8rem', background: '#dbeafe', borderRadius: '8px', marginBottom: '1rem', color: '#1e3a8a' }}>{msg}</div>}

          {/* Specials editor */}
          {active.specials.length === 0 ? (
            <div style={{ ...cardStyle, textAlign: 'center', color: '#64748b' }}>
              No specials yet. Click <strong>+ Add special</strong> to create the first one.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {active.specials.map((s, idx) => (
                <div key={s.id} style={{ ...cardStyle, display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem', alignItems: 'start' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                    <input placeholder="Product name" value={s.name} onChange={(e) => updateSpecial(idx, { name: e.target.value })} style={{ ...inputStyle, gridColumn: '1 / -1', fontWeight: 600 }} />
                    <input placeholder="Brand" value={s.brand || ''} onChange={(e) => updateSpecial(idx, { brand: e.target.value })} style={inputStyle} />
                    <input placeholder="Size (e.g. 10 oz)" value={s.size || ''} onChange={(e) => updateSpecial(idx, { size: e.target.value })} style={inputStyle} />
                    <input placeholder="Sale $" value={s.priceSale} onChange={(e) => updateSpecial(idx, { priceSale: e.target.value })} style={{ ...inputStyle, color: '#dc2626', fontWeight: 700 }} />
                    <input placeholder="Was $ (optional)" value={s.priceWas || ''} onChange={(e) => updateSpecial(idx, { priceWas: e.target.value })} style={inputStyle} />
                    <input type="date" value={s.endsAt || ''} onChange={(e) => updateSpecial(idx, { endsAt: e.target.value })} style={inputStyle} />
                    <input placeholder="Note (KFP, GF, etc.)" value={s.note || ''} onChange={(e) => updateSpecial(idx, { note: e.target.value })} style={inputStyle} />
                    <input placeholder="Category (optional)" value={s.category || ''} onChange={(e) => updateSpecial(idx, { category: e.target.value })} style={{ ...inputStyle, gridColumn: '1 / -1' }} />
                  </div>
                  <button onClick={() => deleteSpecial(idx)} style={btnDelete}>✕</button>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', margin: '1rem 0 2rem' }}>
            <button onClick={addBlankSpecial} style={btnPrimary}>+ Add special</button>
            <div style={{ flex: 1 }} />
            <button onClick={save} style={btnSave} disabled={saving}>
              {saving ? 'Saving…' : `Save (${active.specials.length} items)`}
            </button>
          </div>
        </>
      )}
    </main>
  );
}

const cardStyle: CSSProperties = {
  background: 'white',
  borderRadius: '10px',
  border: '1px solid #e2e8f0',
  padding: '0.85rem',
  boxShadow: '0 1px 4px rgba(15,23,42,0.04)',
};
const inputStyle: CSSProperties = {
  width: '100%',
  padding: '0.45rem 0.7rem',
  borderRadius: '6px',
  border: '1px solid #cbd5e1',
  fontSize: '0.9rem',
  boxSizing: 'border-box',
};
const btnPrimary: CSSProperties = { border: '1px solid #2563eb', background: '#2563eb', color: 'white', borderRadius: '8px', padding: '0.5rem 1rem', fontWeight: 600, cursor: 'pointer' };
const btnWarn: CSSProperties = { border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', borderRadius: '8px', padding: '0.5rem 1rem', fontWeight: 600, cursor: 'pointer' };
const btnSave: CSSProperties = { border: 'none', background: '#16a34a', color: 'white', borderRadius: '8px', padding: '0.55rem 1.25rem', fontWeight: 700, cursor: 'pointer' };
const btnDelete: CSSProperties = { border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', borderRadius: '8px', padding: '0.4rem 0.7rem', fontWeight: 700, cursor: 'pointer' };
const btnLink: CSSProperties = { display: 'inline-block', padding: '0.45rem 0.85rem', background: '#f1f5f9', color: '#1e3a5f', borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, border: '1px solid #cbd5e1' };
