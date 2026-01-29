'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface UserInfo { name: string; email: string; role: 'user' | 'admin'; }

export default function AddBusinessPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    businessName: '',
    description: '',
    category: 'retail',
    logoUrl: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    instagram: '',
    whatsapp: '',
    hours: ''
  });

  const categories = [
    { id: 'retail', name: '🛍️ Retail / Store' },
    { id: 'food', name: '🍕 Food / Restaurant' },
    { id: 'services', name: '🔧 Services' },
    { id: 'health', name: '🏥 Health / Medical' },
    { id: 'education', name: '📚 Education' },
    { id: 'beauty', name: '💇 Beauty / Salon' },
    { id: 'auto', name: '🚗 Auto' },
    { id: 'home', name: '🏠 Home Services' },
    { id: 'tech', name: '💻 Technology' },
    { id: 'finance', name: '💰 Finance / Insurance' },
    { id: 'real-estate', name: '🏢 Real Estate' },
    { id: 'other', name: '📦 Other' }
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

    if (!form.businessName.trim()) { setError('Business name is required'); setLoading(false); return; }
    if (!form.description.trim()) { setError('Description is required'); setLoading(false); return; }
    if (!form.phone && !form.email && !form.website) { setError('At least one contact method is required'); setLoading(false); return; }

    try {
      const response = await fetch('/api/business', {
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
          <h1 style={{ color: '#059669', marginBottom: '1rem' }}>Business Submitted!</h1>
          <p style={{ color: '#666', marginBottom: '2rem' }}>Your business will be reviewed and listed soon.</p>
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
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🏪</div>
            <h1 style={{ color: '#8b5cf6', marginBottom: '0.5rem' }}>Add Your Business</h1>
            <p style={{ color: '#666' }}>List your local business for the community</p>
          </div>

          {error && (
            <div style={{ background: '#fee2e2', color: '#dc2626', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Business Name *</label>
              <input
                type="text"
                value={form.businessName}
                onChange={e => setForm({ ...form, businessName: e.target.value })}
                placeholder="e.g., Crown Heights Bakery"
                style={inputStyle}
                required
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Category *</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                style={inputStyle}
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Description *</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Tell us about your business, products or services..."
                rows={4}
                style={{ ...inputStyle, resize: 'vertical' }}
                required
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Logo URL (optional)</label>
              <input
                type="url"
                value={form.logoUrl}
                onChange={e => setForm({ ...form, logoUrl: e.target.value })}
                placeholder="https://... (link to your logo)"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Address</label>
              <input
                type="text"
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                placeholder="123 Kingston Ave, Brooklyn NY 11213"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Business Hours</label>
              <input
                type="text"
                value={form.hours}
                onChange={e => setForm({ ...form, hours: e.target.value })}
                placeholder="Sun-Thu 9am-6pm, Fri 9am-2pm"
                style={inputStyle}
              />
            </div>

            <div style={{ background: '#f5f3ff', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <label style={{ ...labelStyle, color: '#6d28d9' }}>📞 Contact Information (at least one required)</label>
              
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#666' }}>Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="(718) 555-1234"
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#666' }}>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="info@business.com"
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#666' }}>Website</label>
                <input
                  type="url"
                  value={form.website}
                  onChange={e => setForm({ ...form, website: e.target.value })}
                  placeholder="https://yourbusiness.com"
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#666' }}>Instagram</label>
                <input
                  type="text"
                  value={form.instagram}
                  onChange={e => setForm({ ...form, instagram: e.target.value })}
                  placeholder="@yourbusiness"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: '#666' }}>WhatsApp</label>
                <input
                  type="url"
                  value={form.whatsapp}
                  onChange={e => setForm({ ...form, whatsapp: e.target.value })}
                  placeholder="https://wa.me/1234567890"
                  style={inputStyle}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '1rem',
                background: loading ? '#94a3b8' : '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Submitting...' : '🏪 Submit Business'}
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
