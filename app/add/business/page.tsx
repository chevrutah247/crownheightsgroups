'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface UserInfo { name: string; email: string; role: 'user' | 'admin'; }

const countries = [
  { code: 'US', name: '🇺🇸 United States' },
  { code: 'IL', name: '🇮🇱 Israel' },
  { code: 'CA', name: '🇨🇦 Canada' },
  { code: 'UK', name: '🇬🇧 United Kingdom' },
  { code: 'AU', name: '🇦🇺 Australia' },
  { code: 'FR', name: '🇫🇷 France' },
  { code: 'DE', name: '🇩🇪 Germany' },
  { code: 'RU', name: '🇷🇺 Russia' },
  { code: 'UA', name: '🇺🇦 Ukraine' },
  { code: 'AR', name: '🇦🇷 Argentina' },
  { code: 'BR', name: '🇧🇷 Brazil' },
  { code: 'MX', name: '🇲🇽 Mexico' },
  { code: 'ZA', name: '🇿🇦 South Africa' },
  { code: 'OTHER', name: '🌍 Other' },
];

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
  { id: 'kallah', name: '💍 Hachnasat Kallah' },
  { id: 'gemach', name: '🤝 Gemach / Charity' },
  { id: 'other', name: '📦 Other' }
];

export default function AddBusinessPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  const [form, setForm] = useState({
    businessName: '',
    description: '',
    category: 'services',
    logoUrl: '',
    country: 'US',
    city: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    instagram: '',
    whatsapp: '',
    telegram: '',
    hours: ''
  });

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target?.result as string);
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      
      if (data.url) {
        setForm({ ...form, logoUrl: data.url });
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch {
      setError('Upload failed');
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!form.businessName.trim()) { setError('Business name is required'); setLoading(false); return; }
    if (!form.description.trim()) { setError('Description is required'); setLoading(false); return; }
    if (!form.phone && !form.email && !form.website && !form.whatsapp) { 
      setError('At least one contact method is required'); setLoading(false); return; 
    }

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
    } catch {
      setError('Network error');
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
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/business" style={{ padding: '0.75rem 2rem', background: '#8b5cf6', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
              View Businesses
            </Link>
            <Link href="/kallah" style={{ padding: '0.75rem 2rem', background: '#ec4899', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
              💍 Kallah Services
            </Link>
          </div>
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
            <p style={{ color: '#666' }}>List your business for the community</p>
          </div>

          {/* Kallah Banner */}
          <Link href="/kallah" style={{ display: 'block', marginBottom: '1.5rem', padding: '1rem', background: 'linear-gradient(135deg, #fdf2f8 0%, #fbcfe8 100%)', borderRadius: '12px', textDecoration: 'none', textAlign: 'center' }}>
            <span style={{ fontSize: '1.5rem' }}>💍</span>
            <span style={{ marginLeft: '0.5rem', color: '#831843', fontWeight: 'bold' }}>Adding Kallah service?</span>
            <span style={{ marginLeft: '0.5rem', color: '#9d174d', fontSize: '0.9rem' }}>→ View all Kallah services</span>
          </Link>

          {error && (
            <div style={{ background: '#fee2e2', color: '#dc2626', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            {/* Business Name */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Business Name *</label>
              <input type="text" value={form.businessName} onChange={e => setForm({ ...form, businessName: e.target.value })} placeholder="e.g., Crown Heights Bakery" style={inputStyle} required />
            </div>

            {/* Category */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Category *</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={inputStyle}>
                {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
              </select>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Description *</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Tell us about your business..." rows={4} style={{ ...inputStyle, resize: 'vertical' }} required />
            </div>

            {/* Logo Upload */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Logo / Photo</label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                {(previewUrl || form.logoUrl) && (
                  <img src={previewUrl || form.logoUrl} alt="Preview" style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover', border: '2px solid #e2e8f0' }} />
                )}
                <div style={{ flex: 1 }}>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" style={{ display: 'none' }} />
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} style={{ padding: '0.75rem 1.5rem', background: uploading ? '#94a3b8' : '#f1f5f9', color: '#475569', border: '2px dashed #cbd5e1', borderRadius: '8px', cursor: 'pointer', width: '100%' }}>
                    {uploading ? '⏳ Uploading...' : '📷 Upload from Computer'}
                  </button>
                  <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>or paste URL:</div>
                  <input type="url" value={form.logoUrl} onChange={e => { setForm({ ...form, logoUrl: e.target.value }); setPreviewUrl(''); }} placeholder="https://..." style={{ ...inputStyle, marginTop: '0.25rem' }} />
                </div>
              </div>
            </div>

            {/* Location */}
            <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <label style={{ ...labelStyle, color: '#166534' }}>📍 Location</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: '#666' }}>Country</label>
                  <select value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} style={inputStyle}>
                    {countries.map(c => (<option key={c.code} value={c.code}>{c.name}</option>))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: '#666' }}>City</label>
                  <input type="text" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="e.g., Brooklyn" style={inputStyle} />
                </div>
              </div>
              <div style={{ marginTop: '0.75rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#666' }}>Full Address</label>
                <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="123 Kingston Ave" style={inputStyle} />
              </div>
              <div style={{ marginTop: '0.75rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#666' }}>Business Hours</label>
                <input type="text" value={form.hours} onChange={e => setForm({ ...form, hours: e.target.value })} placeholder="Sun-Thu 9am-6pm" style={inputStyle} />
              </div>
            </div>

            {/* Contact */}
            <div style={{ background: '#f5f3ff', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <label style={{ ...labelStyle, color: '#6d28d9' }}>📞 Contact (at least one required)</label>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: '#666' }}>📞 Phone</label>
                  <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+1 718 555 1234" style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: '#666' }}>✉️ Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="info@business.com" style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: '#666' }}>💬 WhatsApp</label>
                  <input type="text" value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} placeholder="https://wa.me/..." style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: '#666' }}>✈️ Telegram</label>
                  <input type="text" value={form.telegram} onChange={e => setForm({ ...form, telegram: e.target.value })} placeholder="@username or https://t.me/..." style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: '#666' }}>🌐 Website</label>
                  <input type="url" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="https://..." style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: '#666' }}>📸 Instagram</label>
                  <input type="text" value={form.instagram} onChange={e => setForm({ ...form, instagram: e.target.value })} placeholder="@yourbusiness" style={inputStyle} />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '1rem', background: loading ? '#94a3b8' : '#8b5cf6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Submitting...' : '🏪 Submit Business'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <Link href="/business" style={{ color: '#666', textDecoration: 'none' }}>← Back to Business Directory</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}