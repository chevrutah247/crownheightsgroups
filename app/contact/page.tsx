'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EmergencyBar from '@/components/EmergencyBar';

interface UserInfo { name: string; email: string; role: 'user' | 'admin'; }

export default function ContactPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('session_token');
      if (!token) { window.location.href = '/auth/login'; return; }
      try {
        const response = await fetch('/api/auth/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) });
        const data = await response.json();
        if (data.valid) {
          setUser({ name: data.user.name, email: data.user.email, role: data.user.role });
          setForm(f => ({ ...f, name: data.user.name, email: data.user.email }));
        } else { localStorage.clear(); window.location.href = '/auth/login'; }
      } catch { window.location.href = '/auth/login'; }
    };
    checkAuth();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError('Please fill in all required fields');
      return;
    }
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setSent(true);
        setForm({ name: user?.name || '', email: user?.email || '', subject: '', message: '' });
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to send');
      }
    } catch {
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleLogout = () => { localStorage.clear(); window.location.href = '/auth/login'; };

  const inputStyle = { width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', boxSizing: 'border-box' as const };

  return (
    <>
      <EmergencyBar />
      <Header user={user} onLogout={handleLogout} />
      
      <main className="main">
        <div className="page-header">
          <h1 className="page-title">📧 Contact Us</h1>
          <p className="page-subtitle">Have questions or suggestions? We'd love to hear from you!</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
          
          {/* Contact Form */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem' }}>Send us a Message</h2>
            
            {sent ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                <h3 style={{ color: '#10b981' }}>Message Sent!</h3>
                <p style={{ color: '#666' }}>Thank you for reaching out. We'll get back to you soon.</p>
                <button onClick={() => setSent(false)} style={{ marginTop: '1rem', padding: '0.75rem 1.5rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>Name *</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>Email *</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle} required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>Subject</label>
                  <input type="text" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Question about groups" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>Message *</label>
                  <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={5} placeholder="Your message..." style={inputStyle} required />
                </div>
                {error && <p style={{ color: '#ef4444', margin: 0 }}>{error}</p>}
                <button type="submit" disabled={sending} style={{ padding: '0.75rem', background: sending ? '#ccc' : '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: sending ? 'not-allowed' : 'pointer' }}>
                  {sending ? 'Sending...' : '📤 Send Message'}
                </button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div>
            <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '1rem' }}>
              <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem' }}>Other Ways to Reach Us</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>📧</span>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>Email</div>
                    <a href="mailto:contact@edonthego.org" style={{ color: '#2563eb' }}>contact@edonthego.org</a>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>🌐</span>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>Website</div>
                    <a href="https://crownheightsgroups.com" style={{ color: '#2563eb' }}>crownheightsgroups.com</a>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', padding: '2rem', color: 'white' }}>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>💡 Suggestions Welcome!</h3>
              <p style={{ margin: 0, opacity: 0.9 }}>
                Have an idea to improve our community platform? Want to add a new feature? Let us know!
              </p>
            </div>

            <div style={{ background: '#fef3c7', borderRadius: '12px', padding: '1.5rem', marginTop: '1rem' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#92400e' }}>🚨 Report an Issue</h3>
              <p style={{ margin: 0, color: '#92400e', fontSize: '0.9rem' }}>
                Found a broken link or inappropriate content? Please report it using the contact form or the report button on each group/service.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
