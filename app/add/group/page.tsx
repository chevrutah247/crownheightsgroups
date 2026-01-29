'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Category { id: string; name: string; icon: string; }
interface Location { id: string; neighborhood: string; city: string; state: string; }
interface UserInfo { name: string; email: string; role: 'user' | 'admin'; }

export default function AddGroupPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    whatsappLink: '',
    telegramLink: '',
    facebookLink: '',
    websiteLink: '',
    categoryId: '',
    locationId: '',
    language: 'English'
  });

  const languages = ['English', 'Hebrew', 'Yiddish', 'Russian', 'Spanish', 'French'];

  useEffect(() => {
    const token = localStorage.getItem('session_token');
    if (!token) { router.push('/auth/login'); return; }
    
    fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    })
      .then(r => r.json())
      .then(data => { if (data.valid) setUser(data.user); else router.push('/auth/login'); })
      .catch(() => router.push('/auth/login'));

    fetch('/api/admin/group-categories').then(r => r.json()).then(data => setCategories(Array.isArray(data) ? data : []));
    fetch('/api/admin/locations').then(r => r.json()).then(data => setLocations(Array.isArray(data) ? data : []));
  }, [router]);

  const handleLogout = () => { localStorage.clear(); router.push('/auth/login'); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!form.title.trim()) { setError('Group name is required'); setLoading(false); return; }
    if (!form.whatsappLink && !form.telegramLink && !form.facebookLink && !form.websiteLink) {
      setError('At least one link is required'); setLoading(false); return;
    }
    if (!form.categoryId) { setError('Please select a category'); setLoading(false); return; }
    if (!form.locationId) { setError('Please select a location'); setLoading(false); return; }

    try {
      const response = await fetch('/api/suggest-group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          submittedBy: user?.email || 'anonymous',
          status: 'pending'
        })
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to submit');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div>
        <Header user={user} onLogout={handleLogout} />
        <main className="main" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
          <h1 style={{ color: '#059669', marginBottom: '1rem' }}>Group Submitted!</h1>
          <p style={{ color: '#666', marginBottom: '2rem' }}>Your group will be reviewed and added soon.</p>
          <Link href="/" style={{ display: 'inline-block', padding: '0.75rem 2rem', background: '#2563eb', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
            Back to Home
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const inputStyle = { width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' as const };
  const labelStyle = { display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' as const, color: '#333' };

  return (
    <div>
      <Header user={user} onLogout={handleLogout} />
      <main className="main">
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem 1rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>👥</div>
            <h1 style={{ color: '#1e3a5f', marginBottom: '0.5rem' }}>Add a Group</h1>
            <p style={{ color: '#666' }}>Share a WhatsApp, Telegram or other group with the community</p>
          </div>

          {error && (
            <div style={{ background: '#fee2e2', color: '#dc2626', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Group Name *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., Crown Heights Moms"
                style={inputStyle}
                required
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="What is this group about?"
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <label style={{ ...labelStyle, color: '#166534' }}>🔗 Group Links (at least one required)</label>
              
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#666' }}>WhatsApp Link</label>
                <input
                  type="url"
                  value={form.whatsappLink}
                  onChange={e => setForm({ ...form, whatsappLink: e.target.value })}
                  placeholder="https://chat.whatsapp.com/..."
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#666' }}>Telegram Link</label>
                <input
                  type="url"
                  value={form.telegramLink}
                  onChange={e => setForm({ ...form, telegramLink: e.target.value })}
                  placeholder="https://t.me/..."
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#666' }}>Facebook Link</label>
                <input
                  type="url"
                  value={form.facebookLink}
                  onChange={e => setForm({ ...form, facebookLink: e.target.value })}
                  placeholder="https://facebook.com/groups/..."
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: '#666' }}>Website Link</label>
                <input
                  type="url"
                  value={form.websiteLink}
                  onChange={e => setForm({ ...form, websiteLink: e.target.value })}
                  placeholder="https://..."
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={labelStyle}>Category *</label>
                <select
                  value={form.categoryId}
                  onChange={e => setForm({ ...form, categoryId: e.target.value })}
                  style={inputStyle}
                  required
                >
                  <option value="">Select category...</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Language *</label>
                <select
                  value={form.language}
                  onChange={e => setForm({ ...form, language: e.target.value })}
                  style={inputStyle}
                >
                  {languages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={labelStyle}>Location *</label>
              <select
                value={form.locationId}
                onChange={e => setForm({ ...form, locationId: e.target.value })}
                style={inputStyle}
                required
              >
                <option value="">Select location...</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.neighborhood}{loc.city ? ', ' + loc.city : ''}{loc.state ? ', ' + loc.state : ''}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '1rem',
                background: loading ? '#94a3b8' : '#25D366',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Submitting...' : '👥 Submit Group'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <Link href="/" style={{ color: '#666', textDecoration: 'none' }}>← Back to Home</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
