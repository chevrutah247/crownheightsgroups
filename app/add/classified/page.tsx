'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface UserInfo { name: string; email: string; role: 'user' | 'admin'; }

const categories = [
  { id: 'for-sale', name: '🏷️ For Sale' },
  { id: 'free-stuff', name: '🆓 Free Stuff / Giveaway' },
  { id: 'housing', name: '🏠 Housing (Rent / Sublet / Roommate)' },
  { id: 'jobs', name: '💼 Jobs & Gigs' },
  { id: 'services', name: '🔧 Services Offered' },
  { id: 'wanted', name: '🔍 Wanted' },
  { id: 'lost-found', name: '📦 Lost & Found' },
];

export default function AddClassifiedPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const [form, setForm] = useState({
    title: '',
    category: 'for-sale',
    description: '',
    price: '',
    imageUrls: [] as string[],
    location: 'Crown Heights',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    contactWhatsapp: '',
    duration: 30,
  });

  useEffect(() => {
    const token = localStorage.getItem('session_token');
    if (!token) return;
    fetch('/api/auth/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) })
      .then(r => r.json())
      .then(data => { if (data.valid) { setUser(data.user); setForm(f => ({ ...f, contactEmail: data.user.email, contactName: data.user.name })); } })
      .catch(() => {});
  }, []);

  const handleLogout = () => { localStorage.clear(); router.push('/auth/login'); };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remaining = 3 - form.imageUrls.length;
    if (remaining <= 0) { setError('Maximum 3 photos allowed'); return; }

    setUploading(true);
    setError('');

    const filesToUpload = Array.from(files).slice(0, remaining);

    for (const file of filesToUpload) {
      try {
        // Preview
        const reader = new FileReader();
        reader.onload = (ev) => setPreviewUrls(prev => [...prev, ev.target?.result as string]);
        reader.readAsDataURL(file);

        // Upload
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();

        if (data.url) {
          setForm(f => ({ ...f, imageUrls: [...f.imageUrls, data.url] }));
        } else {
          setError(data.error || 'Upload failed');
        }
      } catch {
        setError('Upload failed');
      }
    }
    setUploading(false);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setForm(f => ({ ...f, imageUrls: f.imageUrls.filter((_, i) => i !== index) }));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!form.title.trim()) { setError('Title is required'); setLoading(false); return; }
    if (!form.contactPhone && !form.contactEmail && !form.contactWhatsapp) {
      setError('At least one contact method is required');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/classifieds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          submittedBy: user?.email || 'anonymous',
        }),
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
          <h1 style={{ color: '#059669', marginBottom: '1rem' }}>Ad Submitted!</h1>
          <p style={{ color: '#666', marginBottom: '2rem' }}>Your listing will be reviewed and posted shortly.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/classifieds" style={{ padding: '0.75rem 2rem', background: '#16a34a', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
              View Classifieds
            </Link>
            <button onClick={() => { setSuccess(false); setForm({ title: '', category: 'for-sale', description: '', price: '', imageUrls: [], location: 'Crown Heights', contactName: '', contactEmail: user?.email || '', contactPhone: '', contactWhatsapp: '', duration: 30 }); setPreviewUrls([]); }}
              style={{ padding: '0.75rem 2rem', background: '#3b82f6', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>
              Post Another Ad
            </button>
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
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📋</div>
            <h1 style={{ color: '#16a34a', marginBottom: '0.5rem' }}>Post a Free Ad</h1>
            <p style={{ color: '#666' }}>Sell, rent, hire, or find anything in the community</p>
          </div>

          {error && (
            <div style={{ background: '#fee2e2', color: '#dc2626', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            {/* Category */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Category *</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={inputStyle}>
                {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
              </select>
            </div>

            {/* Title */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Title *</label>
              <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g., Beautiful couch for sale" style={inputStyle} required />
            </div>

            {/* Description */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Description</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe what you're offering or looking for..." rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>

            {/* Price */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Price</label>
              <input type="text" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder='e.g., $50, Free, $1200/mo, Negotiable' style={inputStyle} />
              <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.25rem' }}>Leave empty if not applicable</div>
            </div>

            {/* Photos */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Photos (up to 3)</label>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                {(previewUrls.length > 0 ? previewUrls : form.imageUrls).map((url, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={url} alt={`Photo ${i + 1}`} style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover', border: '2px solid #e2e8f0' }} />
                    <button type="button" onClick={() => removeImage(i)} style={{
                      position: 'absolute', top: '-6px', right: '-6px', width: '22px', height: '22px',
                      background: '#dc2626', color: 'white', border: 'none', borderRadius: '50%',
                      fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>✕</button>
                  </div>
                ))}
              </div>
              {form.imageUrls.length < 3 && (
                <>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" multiple style={{ display: 'none' }} />
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} style={{
                    padding: '0.75rem 1.5rem', background: uploading ? '#94a3b8' : '#f1f5f9', color: '#475569',
                    border: '2px dashed #cbd5e1', borderRadius: '8px', cursor: 'pointer', width: '100%',
                  }}>
                    {uploading ? '⏳ Uploading...' : `📷 Add Photo${form.imageUrls.length > 0 ? ` (${3 - form.imageUrls.length} left)` : 's'}`}
                  </button>
                </>
              )}
            </div>

            {/* Location */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>📍 Location</label>
              <input type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Crown Heights" style={inputStyle} />
            </div>

            {/* Contact */}
            <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <label style={{ ...labelStyle, color: '#166534' }}>📞 Contact Info (at least one required)</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: '#666' }}>Name</label>
                  <input type="text" value={form.contactName} onChange={e => setForm({ ...form, contactName: e.target.value })} placeholder="Your name" style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: '#666' }}>Phone</label>
                  <input type="tel" value={form.contactPhone} onChange={e => setForm({ ...form, contactPhone: e.target.value })} placeholder="+1 718 555 1234" style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: '#666' }}>Email</label>
                  <input type="email" value={form.contactEmail} onChange={e => setForm({ ...form, contactEmail: e.target.value })} placeholder="you@email.com" style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: '#666' }}>WhatsApp</label>
                  <input type="text" value={form.contactWhatsapp} onChange={e => setForm({ ...form, contactWhatsapp: e.target.value })} placeholder="+17185551234" style={inputStyle} />
                </div>
              </div>
            </div>

            {/* Duration */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Ad Duration</label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {[7, 14, 30].map(d => (
                  <button key={d} type="button" onClick={() => setForm({ ...form, duration: d })} style={{
                    flex: 1, padding: '0.75rem', borderRadius: '8px',
                    border: form.duration === d ? '2px solid #16a34a' : '2px solid #e5e7eb',
                    background: form.duration === d ? '#f0fdf4' : 'white',
                    color: form.duration === d ? '#166534' : '#666',
                    fontWeight: form.duration === d ? '700' : '500',
                    cursor: 'pointer', fontSize: '0.95rem',
                  }}>
                    {d} days
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '1rem',
              background: loading ? '#94a3b8' : 'linear-gradient(135deg, #16a34a, #15803d)',
              color: 'white', border: 'none', borderRadius: '8px',
              fontSize: '1.1rem', fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}>
              {loading ? 'Posting...' : '📋 Post Ad — Free'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <Link href="/classifieds" style={{ color: '#666', textDecoration: 'none' }}>← Back to Classifieds</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
