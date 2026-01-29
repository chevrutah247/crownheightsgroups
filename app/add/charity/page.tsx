'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface UserInfo { name: string; email: string; role: 'user' | 'admin'; }

export default function AddCharityPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    campaignName: '',
    description: '',
    imageUrl: '',
    whatsappLink: '',
    websiteLink: '',
    goalAmount: '',
    duration: '7',
    refereeName: '',
    refereeRole: '',
    refereePhone: '',
    refereeEmail: ''
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!form.campaignName.trim()) { setError('Campaign name is required'); setLoading(false); return; }
    if (!form.description.trim()) { setError('Description is required'); setLoading(false); return; }
    if (!form.whatsappLink && !form.websiteLink) { setError('At least one link is required'); setLoading(false); return; }
    if (!form.goalAmount) { setError('Goal amount is required'); setLoading(false); return; }
    if (!form.refereeName) { setError('Reference person is required'); setLoading(false); return; }
    if (!form.refereePhone && !form.refereeEmail) { setError('Reference contact is required'); setLoading(false); return; }

    try {
      const response = await fetch('/api/charity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          goalAmount: parseFloat(form.goalAmount),
          duration: parseInt(form.duration),
          submittedBy: user?.email || 'anonymous',
          status: 'pending',
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + parseInt(form.duration) * 24 * 60 * 60 * 1000).toISOString()
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
          <h1 style={{ color: '#059669', marginBottom: '1rem' }}>Campaign Submitted!</h1>
          <p style={{ color: '#666', marginBottom: '1rem' }}>Your charity campaign will be reviewed and published soon.</p>
          <p style={{ color: '#f59e0b', marginBottom: '2rem', fontSize: '0.9rem' }}>
            ⏰ Note: Campaign will be active for {form.duration} days after approval.
          </p>
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
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>💝</div>
            <h1 style={{ color: '#e11d48', marginBottom: '0.5rem' }}>Add a Charity Campaign</h1>
            <p style={{ color: '#666' }}>Create a fundraising campaign for someone in need</p>
          </div>

          <div style={{ background: '#fef3c7', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #fcd34d' }}>
            <strong style={{ color: '#92400e' }}>⏰ Important:</strong>
            <span style={{ color: '#78350f' }}> Campaigns are active for max 7 days. After expiration, you will receive an email to renew or it will be archived.</span>
          </div>

          {error && (
            <div style={{ background: '#fee2e2', color: '#dc2626', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Campaign Name *</label>
              <input
                type="text"
                value={form.campaignName}
                onChange={e => setForm({ ...form, campaignName: e.target.value })}
                placeholder="e.g., Help the Cohen Family"
                style={inputStyle}
                required
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Description *</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Tell the story - why is this campaign needed?"
                rows={5}
                style={{ ...inputStyle, resize: 'vertical' }}
                required
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Campaign Image URL</label>
              <input
                type="url"
                value={form.imageUrl}
                onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://... (link to image)"
                style={inputStyle}
              />
              <small style={{ color: '#666' }}>Upload image to imgur.com or similar and paste link</small>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={labelStyle}>Goal Amount ($) *</label>
                <input
                  type="number"
                  value={form.goalAmount}
                  onChange={e => setForm({ ...form, goalAmount: e.target.value })}
                  placeholder="5000"
                  min="1"
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Duration (days) *</label>
                <select
                  value={form.duration}
                  onChange={e => setForm({ ...form, duration: e.target.value })}
                  style={inputStyle}
                >
                  <option value="1">1 day</option>
                  <option value="2">2 days</option>
                  <option value="3">3 days</option>
                  <option value="5">5 days</option>
                  <option value="7">7 days (max)</option>
                </select>
              </div>
            </div>

            <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <label style={{ ...labelStyle, color: '#166534' }}>🔗 Donation Links (at least one required)</label>
              
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#666' }}>WhatsApp Contact</label>
                <input
                  type="url"
                  value={form.whatsappLink}
                  onChange={e => setForm({ ...form, whatsappLink: e.target.value })}
                  placeholder="https://wa.me/1234567890"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: '#666' }}>Donation Website</label>
                <input
                  type="url"
                  value={form.websiteLink}
                  onChange={e => setForm({ ...form, websiteLink: e.target.value })}
                  placeholder="https://gofundme.com/..."
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ background: '#fef3c7', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <label style={{ ...labelStyle, color: '#92400e' }}>📋 Reference (Required for Verification)</label>
              <p style={{ fontSize: '0.85rem', color: '#78350f', marginBottom: '1rem' }}>
                Please provide someone who can verify this need (Shliach, Rabbi, community member)
              </p>
              
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#666' }}>Reference Name *</label>
                <input
                  type="text"
                  value={form.refereeName}
                  onChange={e => setForm({ ...form, refereeName: e.target.value })}
                  placeholder="Rabbi Moshe Cohen"
                  style={inputStyle}
                  required
                />
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#666' }}>Role/Title</label>
                <input
                  type="text"
                  value={form.refereeRole}
                  onChange={e => setForm({ ...form, refereeRole: e.target.value })}
                  placeholder="Shliach, Rabbi of..."
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: '#666' }}>Phone</label>
                  <input
                    type="tel"
                    value={form.refereePhone}
                    onChange={e => setForm({ ...form, refereePhone: e.target.value })}
                    placeholder="(718) 555-1234"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: '#666' }}>Email</label>
                  <input
                    type="email"
                    value={form.refereeEmail}
                    onChange={e => setForm({ ...form, refereeEmail: e.target.value })}
                    placeholder="rabbi@shul.org"
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
                background: loading ? '#94a3b8' : '#e11d48',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Submitting...' : '💝 Submit Campaign'}
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
