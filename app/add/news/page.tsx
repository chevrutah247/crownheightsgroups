'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface UserInfo { name: string; email: string; role: 'user' | 'admin'; }

export default function AddNewsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    newsType: 'announcement',
    description: '',
    link: '',
    address: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    imageUrl: ''
  });

  const newsTypes = [
    { id: 'announcement', name: '📢 Announcement', icon: '📢' },
    { id: 'mazel-tov', name: '🎉 Mazel Tov', icon: '🎉' },
    { id: 'baruch-dayan', name: '🕯️ Baruch Dayan Emes', icon: '🕯️' },
    { id: 'lost-found', name: '🔍 Lost & Found', icon: '🔍' },
    { id: 'community', name: '👥 Community News', icon: '👥' },
    { id: 'other', name: '📰 Other', icon: '📰' }
  ];

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
  }, [router]);

  const handleLogout = () => { localStorage.clear(); router.push('/auth/login'); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!form.title.trim()) { setError('Title is required'); setLoading(false); return; }
    if (!form.description.trim()) { setError('Description is required'); setLoading(false); return; }

    try {
      const response = await fetch('/api/community-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          submittedBy: user?.email || 'anonymous',
          status: 'pending',
          createdAt: new Date().toISOString()
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
          <h1 style={{ color: '#059669', marginBottom: '1rem' }}>News Submitted!</h1>
          <p style={{ color: '#666', marginBottom: '2rem' }}>Your news will be reviewed and posted soon.</p>
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
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📰</div>
            <h1 style={{ color: '#dc2626', marginBottom: '0.5rem' }}>Post Community News</h1>
            <p style={{ color: '#666' }}>Share announcements, Mazel Tovs, and community updates</p>
          </div>

          {error && (
            <div style={{ background: '#fee2e2', color: '#dc2626', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>News Type *</label>
              <select
                value={form.newsType}
                onChange={e => setForm({ ...form, newsType: e.target.value })}
                style={inputStyle}
              >
                {newsTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Title / Headline *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., Mazel Tov to the Cohen Family!"
                style={inputStyle}
                required
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Description / Details *</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Share the full details here..."
                rows={5}
                style={{ ...inputStyle, resize: 'vertical' }}
                required
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Link (optional)</label>
              <input
                type="url"
                value={form.link}
                onChange={e => setForm({ ...form, link: e.target.value })}
                placeholder="https://... (article, event page, etc.)"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Location/Address (optional)</label>
              <input
                type="text"
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                placeholder="Where is this happening?"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Image URL (optional)</label>
              <input
                type="url"
                value={form.imageUrl}
                onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://... (photo or flyer)"
                style={inputStyle}
              />
            </div>

            <div style={{ background: '#fef2f2', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <label style={{ ...labelStyle, color: '#991b1b' }}>📞 Contact Info (optional)</label>
              
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#666' }}>Contact Name</label>
                <input
                  type="text"
                  value={form.contactName}
                  onChange={e => setForm({ ...form, contactName: e.target.value })}
                  placeholder="Who to contact for more info"
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: '#666' }}>Phone</label>
                  <input
                    type="tel"
                    value={form.contactPhone}
                    onChange={e => setForm({ ...form, contactPhone: e.target.value })}
                    placeholder="(718) 555-1234"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: '#666' }}>Email</label>
                  <input
                    type="email"
                    value={form.contactEmail}
                    onChange={e => setForm({ ...form, contactEmail: e.target.value })}
                    placeholder="email@example.com"
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '1rem',
                background: loading ? '#94a3b8' : '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Submitting...' : '📰 Submit News'}
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
