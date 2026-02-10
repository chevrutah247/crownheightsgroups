'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function SuggestGroupPage() {
  const [formData, setFormData] = useState({ name: '', platform: 'whatsapp', link: '', description: '', language: 'english', submitterEmail: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/suggest-group', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      const data = await res.json();
      
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError(data.error || 'Error submitting. Please try again.');
      }
    } catch { 
      setError('Error submitting. Please try again.'); 
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <Header user={null} onLogout={() => {}} />
        <main style={{ maxWidth: '600px', margin: '0 auto', padding: '3rem 1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
          <h1 style={{ color: '#22c55e', marginBottom: '0.5rem' }}>Thank You!</h1>
          <p style={{ color: '#666', marginBottom: '2rem' }}>Your Torah group suggestion has been submitted for review.</p>
          <Link href="/torah-groups" style={{ display: 'inline-block', background: '#1e3a5f', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '25px', textDecoration: 'none', fontWeight: 'bold' }}>← Back to Torah Groups</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Header user={null} onLogout={() => {}} />
      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#1e3a5f', fontSize: '2rem', marginBottom: '0.5rem' }}>📚 Suggest a Torah Group</h1>
          <p style={{ color: '#666' }}>Know a great Torah study group? Share it with the community!</p>
        </div>

        <form onSubmit={handleSubmit} style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
          
          {error && (
            <div style={{ 
              background: '#fef2f2', 
              border: '1px solid #fecaca', 
              color: '#dc2626', 
              padding: '1rem', 
              borderRadius: '8px', 
              marginBottom: '1.5rem',
              fontSize: '0.95rem'
            }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#374151' }}>Group Name *</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g., Daily Tanya WhatsApp" style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#374151' }}>Platform *</label>
            <select value={formData.platform} onChange={e => setFormData({...formData, platform: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem' }}>
              <option value="whatsapp">WhatsApp</option>
              <option value="telegram">Telegram</option>
              <option value="facebook">Facebook</option>
              <option value="zoom">Zoom</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#374151' }}>Group Link *</label>
            <input type="url" required value={formData.link} onChange={e => { setFormData({...formData, link: e.target.value}); setError(''); }} placeholder="https://chat.whatsapp.com/..." style={{ width: '100%', padding: '0.75rem', border: error && error.includes('link') ? '2px solid #dc2626' : '2px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' }} />
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: '#666' }}>
              ℹ️ Link will be verified before submission
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#374151' }}>Language</label>
            <select value={formData.language} onChange={e => setFormData({...formData, language: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem' }}>
              <option value="english">English</option>
              <option value="hebrew">Hebrew</option>
              <option value="russian">Russian</option>
              <option value="yiddish">Yiddish</option>
              <option value="spanish">Spanish</option>
              <option value="french">French</option>
            </select>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#374151' }}>Description</label>
            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="What topics does the group cover?" rows={3} style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem', resize: 'vertical', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#374151' }}>Your Email (optional)</label>
            <input type="email" value={formData.submitterEmail} onChange={e => setFormData({...formData, submitterEmail: e.target.value})} placeholder="To notify you when approved" style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' }} />
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '1rem', background: loading ? '#9ca3af' : '#22c55e', color: 'white', border: 'none', borderRadius: '10px', fontSize: '1.1rem', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? '🔍 Checking link & submitting...' : '📚 Submit Group'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link href="/torah-groups" style={{ color: '#3b82f6', textDecoration: 'none' }}>← Back to Torah Groups</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
