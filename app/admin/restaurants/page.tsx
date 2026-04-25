'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import type { GoodFor, Restaurant, RestaurantType, HashgachaId } from '@/lib/restaurants-data';

const TYPE_OPTIONS: { value: RestaurantType; label: string }[] = [
  { value: 'meat', label: '🥩 Meat' },
  { value: 'dairy', label: '🥛 Dairy' },
  { value: 'parve', label: '🌿 Parve' },
  { value: 'fish', label: '🐟 Fish' },
  { value: 'pizza', label: '🍕 Pizza' },
  { value: 'bakery', label: '🥐 Bakery' },
  { value: 'sushi', label: '🍣 Sushi' },
  { value: 'ice-cream', label: '🍦 Ice Cream' },
  { value: 'catering', label: '🍽️ Catering' },
  { value: 'butcher', label: '🔪 Butcher' },
  { value: 'matzah', label: '🍞 Matzah' },
  { value: 'grocery', label: '🛒 Grocery' },
  { value: 'venue', label: '🎪 Venue' },
  { value: 'vegan', label: '🌱 Vegan' },
];

const GOOD_FOR_OPTIONS: { value: GoodFor; label: string }[] = [
  { value: 'breakfast', label: '🥞 Breakfast' },
  { value: 'brunch', label: '🍳 Brunch' },
  { value: 'lunch', label: '🥪 Lunch' },
  { value: 'dinner', label: '🍽️ Dinner' },
  { value: 'coffee', label: '☕ Coffee' },
  { value: 'tea', label: '🍵 Tea' },
  { value: 'dessert', label: '🍰 Dessert' },
  { value: 'takeout', label: '🥡 Take-out' },
  { value: 'delivery', label: '🛵 Delivery' },
  { value: 'date-night', label: '💕 Date Night' },
  { value: 'family', label: '👨‍👩‍👧 Family' },
  { value: 'cocktails', label: '🍸 Cocktails' },
];

const HASHGACHA_OPTIONS: { value: HashgachaId; label: string }[] = [
  { value: 'chk', label: '⭐ CHK (Beis Din Crown Heights)' },
  { value: 'ou', label: 'OU — Orthodox Union' },
  { value: 'ok', label: 'OK Kosher' },
  { value: 'star-k', label: 'Star-K' },
  { value: 'kof-k', label: 'Kof-K' },
  { value: 'crc-chicago', label: 'cRc Chicago' },
  { value: 'vaad-queens', label: 'Vaad Queens' },
  { value: 'vaad-five-towns', label: 'Vaad Five Towns' },
  { value: 'crc-williamsburg', label: 'CRC Williamsburg' },
  { value: 'vkm', label: 'VKM (Vaad Kashrus Mehadrin)' },
  { value: 'national-kosher', label: 'National Kosher' },
  { value: 'ikc', label: 'IKC (International Kosher Council)' },
  { value: 'rabbi-matusof', label: 'Rabbi E. Matusof' },
  { value: 'other', label: 'Other (specify in notes)' },
];

export default function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [editing, setEditing] = useState<Restaurant | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'closed'>('active');
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/restaurants');
      if (!r.ok) throw new Error('Not authorized');
      const d = await r.json();
      if (Array.isArray(d)) setRestaurants(d);
    } catch (e: any) {
      setMsg(e.message || 'Load failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = restaurants.filter((r) => {
    if (filterType !== 'all' && r.type !== filterType) return false;
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const saveAll = async (list: Restaurant[]) => {
    setSaving(true);
    try {
      const r = await fetch('/api/admin/restaurants', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(list),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Save failed');
      setMsg(`Saved ${d.count} restaurants.`);
      setRestaurants(list);
    } catch (e: any) {
      setMsg(`Error: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    const list = isNew
      ? [...restaurants, { ...editing, id: editing.id || `r-${Date.now()}` }]
      : restaurants.map((r) => (r.id === editing.id ? editing : r));
    await saveAll(list);
    setEditing(null);
    setIsNew(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this restaurant permanently?')) return;
    await saveAll(restaurants.filter((r) => r.id !== id));
  };

  const handleToggleStatus = async (r: Restaurant) => {
    const updated = restaurants.map((x) => x.id === r.id ? { ...x, status: x.status === 'closed' ? 'active' as const : 'closed' as const } : x);
    await saveAll(updated);
  };

  if (loading) {
    return <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' }}><p>Loading…</p></main>;
  }

  return (
    <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <Link href="/admin" style={{ color: '#2563eb', textDecoration: 'none', fontSize: '0.9rem' }}>← Back to Admin</Link>
        <h1 style={{ margin: 0, fontSize: '1.5rem', flex: 1 }}>Restaurants ({restaurants.length})</h1>
        <button onClick={() => { setEditing(makeBlank()); setIsNew(true); }} style={btnPrimary}>+ Add restaurant</button>
      </div>

      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>
        Manage the public <Link href="/restaurants" style={{ color: '#2563eb' }}>/restaurants</Link> directory. Each entry needs a hashgacha so users can filter by certification.
      </p>

      {msg && <div style={{ padding: '0.6rem 0.8rem', background: '#dbeafe', borderRadius: '8px', marginBottom: '1rem', color: '#1e3a8a' }}>{msg}</div>}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...inputStyle, maxWidth: '240px' }} />
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={inputStyle}>
          <option value="all">All types</option>
          {TYPE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} style={inputStyle}>
          <option value="active">Active only</option>
          <option value="closed">Closed only</option>
          <option value="all">Active + Closed</option>
        </select>
      </div>

      {/* Editor modal */}
      {editing && (
        <div style={modalOverlay} onClick={() => { setEditing(null); setIsNew(false); }}>
          <div style={modalBody} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 1rem', fontSize: '1.2rem' }}>{isNew ? 'Add restaurant' : 'Edit restaurant'}</h2>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <Label>Name</Label>
              <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} style={inputStyle} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <Label>Type</Label>
                  <select value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value as RestaurantType })} style={inputStyle}>
                    {TYPE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Hashgacha</Label>
                  <select value={editing.hashgacha} onChange={(e) => setEditing({ ...editing, hashgacha: e.target.value as HashgachaId })} style={inputStyle}>
                    {HASHGACHA_OPTIONS.map((h) => <option key={h.value} value={h.value}>{h.label}</option>)}
                  </select>
                </div>
              </div>

              <Label>Hashgacha note (optional)</Label>
              <input value={editing.hashgachaNote || ''} onChange={(e) => setEditing({ ...editing, hashgachaNote: e.target.value })} style={inputStyle} placeholder='e.g. "Cholov Yisroel, Pas Yisroel"' />

              <Label>Address</Label>
              <input value={editing.address || ''} onChange={(e) => setEditing({ ...editing, address: e.target.value })} style={inputStyle} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <Label>Phone</Label>
                  <input value={editing.phone || ''} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <Label>Cuisine</Label>
                  <input value={editing.cuisine || ''} onChange={(e) => setEditing({ ...editing, cuisine: e.target.value })} style={inputStyle} placeholder='e.g. "Italian · Brunch"' />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <Label>Website</Label>
                  <input value={editing.website || ''} onChange={(e) => setEditing({ ...editing, website: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <Label>Instagram</Label>
                  <input value={editing.instagram || ''} onChange={(e) => setEditing({ ...editing, instagram: e.target.value })} style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <Label>Price range</Label>
                  <select value={editing.priceRange || ''} onChange={(e) => setEditing({ ...editing, priceRange: (e.target.value as any) || undefined })} style={inputStyle}>
                    <option value="">—</option>
                    <option value="$">$</option>
                    <option value="$$">$$</option>
                    <option value="$$$">$$$</option>
                  </select>
                </div>
                <div>
                  <Label>Status</Label>
                  <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value as any })} style={inputStyle}>
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div>
                  <Label>Area</Label>
                  <input value={editing.area || 'Crown Heights'} onChange={(e) => setEditing({ ...editing, area: e.target.value })} style={inputStyle} />
                </div>
              </div>

              <Label>Hours</Label>
              <input value={editing.hours || ''} onChange={(e) => setEditing({ ...editing, hours: e.target.value })} style={inputStyle} placeholder='e.g. "Su-Th 11am-10pm, F until 1hr before Shabbos"' />

              <Label>Description (1-2 sentence editorial blurb)</Label>
              <textarea value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} style={{ ...inputStyle, minHeight: '50px' }} placeholder='What makes this place worth visiting?' />

              <Label>Review summary (Yelp/Google snapshot)</Label>
              <textarea value={editing.reviewSummary || ''} onChange={(e) => setEditing({ ...editing, reviewSummary: e.target.value })} style={{ ...inputStyle, minHeight: '50px' }} placeholder='What customers consistently praise / complain about' />

              <Label>Good for (select all that apply)</Label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', padding: '0.5rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                {GOOD_FOR_OPTIONS.map((opt) => {
                  const checked = (editing.goodFor || []).includes(opt.value);
                  return (
                    <label
                      key={opt.value}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        padding: '4px 10px',
                        borderRadius: '999px',
                        background: checked ? '#1e3a5f' : 'white',
                        color: checked ? 'white' : '#334155',
                        border: '1px solid ' + (checked ? '#1e3a5f' : '#cbd5e1'),
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          const current = editing.goodFor || [];
                          const next = checked ? current.filter((g) => g !== opt.value) : [...current, opt.value];
                          setEditing({ ...editing, goodFor: next });
                        }}
                        style={{ display: 'none' }}
                      />
                      {opt.label}
                    </label>
                  );
                })}
              </div>

              <Label>Notes</Label>
              <textarea value={editing.notes || ''} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} style={{ ...inputStyle, minHeight: '60px' }} placeholder='e.g. "Delivery available", "Switched from CHK to VKM in May 2025"' />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button onClick={handleSaveEdit} style={btnSave} disabled={saving || !editing.name}>
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button onClick={() => { setEditing(null); setIsNew(false); }} style={btnCancel}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div style={{ display: 'grid', gap: '0.4rem' }}>
        {filtered.map((r) => (
          <div key={r.id} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                <strong style={{ color: r.status === 'closed' ? '#94a3b8' : '#1e3a5f', textDecoration: r.status === 'closed' ? 'line-through' : 'none' }}>{r.name}</strong>
                <span style={{ background: '#e2e8f0', color: '#475569', fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>{r.type}</span>
                <span style={{ background: '#1e3a5f', color: 'white', fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>{r.hashgacha.toUpperCase()}</span>
                {r.status === 'closed' && <span style={{ background: '#dc2626', color: 'white', fontSize: '0.6rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>CLOSED</span>}
              </div>
              {r.address && <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{r.address}</div>}
            </div>
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              <button onClick={() => { setEditing({ ...r }); setIsNew(false); }} style={btnEdit}>Edit</button>
              <button onClick={() => handleToggleStatus(r)} style={btnWarn}>{r.status === 'closed' ? 'Reopen' : 'Close'}</button>
              <button onClick={() => handleDelete(r.id)} style={btnDelete}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ ...cardStyle, textAlign: 'center', color: '#64748b' }}>
          No restaurants match your filter.
        </div>
      )}
    </main>
  );
}

function makeBlank(): Restaurant {
  return {
    id: '',
    name: '',
    type: 'meat',
    hashgacha: 'chk',
    area: 'Crown Heights',
    status: 'active',
  };
}

function Label({ children }: { children: React.ReactNode }) {
  return <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'block' }}>{children}</label>;
}

const cardStyle: CSSProperties = { background: 'white', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '0.7rem 0.9rem', boxShadow: '0 1px 3px rgba(15,23,42,0.04)' };
const inputStyle: CSSProperties = { width: '100%', padding: '0.45rem 0.7rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' };
const btnPrimary: CSSProperties = { border: '1px solid #2563eb', background: '#2563eb', color: 'white', borderRadius: '8px', padding: '0.5rem 1rem', fontWeight: 600, cursor: 'pointer' };
const btnSave: CSSProperties = { border: 'none', background: '#16a34a', color: 'white', borderRadius: '8px', padding: '0.55rem 1.25rem', fontWeight: 700, cursor: 'pointer' };
const btnCancel: CSSProperties = { border: '1px solid #cbd5e1', background: 'white', color: '#64748b', borderRadius: '8px', padding: '0.55rem 1rem', fontWeight: 600, cursor: 'pointer' };
const btnEdit: CSSProperties = { border: '1px solid #2563eb', background: 'white', color: '#2563eb', borderRadius: '6px', padding: '0.35rem 0.7rem', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' };
const btnDelete: CSSProperties = { border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', borderRadius: '6px', padding: '0.35rem 0.7rem', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' };
const btnWarn: CSSProperties = { border: '1px solid #fde68a', background: '#fef3c7', color: '#b45309', borderRadius: '6px', padding: '0.35rem 0.7rem', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' };
const modalOverlay: CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2rem 1rem', overflowY: 'auto' };
const modalBody: CSSProperties = { background: 'white', borderRadius: '14px', padding: '1.5rem', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.25)' };
