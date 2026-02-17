'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EmergencyBar from '@/components/EmergencyBar';

interface UserInfo { name: string; email: string; role: 'user' | 'admin'; }

const feedbackTypes = [
  { id: 'bug', label: '🐛 Report a Bug', color: '#ef4444' },
  { id: 'suggestion', label: '💡 Suggestion', color: '#f59e0b' },
  { id: 'question', label: '❓ Question', color: '#3b82f6' },
  { id: 'content', label: '🚫 Report Content', color: '#dc2626' },
  { id: 'other', label: '💬 Other', color: '#6b7280' },
];

export default function ContactPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [form, setForm] = useState({ name: '', email: '', type: 'suggestion', subject: '', message: '' });
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string>('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [showScreenshotHelp, setShowScreenshotHelp] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('session_token');
      if (!token) return;
      try {
        const response = await fetch('/api/auth/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) });
        const data = await response.json();
        if (data.valid) {
          setUser({ name: data.user.name, email: data.user.email, role: data.user.role });
          setForm(f => ({ ...f, name: data.user.name, email: data.user.email }));
        } else localStorage.clear();
      } catch { /* ignore */ }
    };
    checkAuth();
  }, []);

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Screenshot must be less than 5MB');
        return;
      }
      setScreenshot(file);
      const reader = new FileReader();
      reader.onload = (e) => setScreenshotPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError('Please fill in all required fields');
      return;
    }
    setSending(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('email', form.email);
      formData.append('type', form.type);
      formData.append('subject', form.subject);
      formData.append('message', form.message);
      if (screenshot) {
        formData.append('screenshot', screenshot);
      }

      const res = await fetch('/api/contact', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        setSent(true);
        setForm({ name: user?.name || '', email: user?.email || '', type: 'suggestion', subject: '', message: '' });
        setScreenshot(null);
        setScreenshotPreview('');
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
          <h1 className="page-title">📧 Contact & Feedback</h1>
          <p className="page-subtitle">Report bugs, suggest features, or ask questions</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
          
          {/* Contact Form */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem' }}>Send Feedback</h2>
            
            {sent ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                <h3 style={{ color: '#10b981' }}>Thank You!</h3>
                <p style={{ color: '#666' }}>Your feedback has been sent. We appreciate your input!</p>
                <button onClick={() => setSent(false)} style={{ marginTop: '1rem', padding: '0.75rem 1.5rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Feedback Type */}
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>What's this about? *</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {feedbackTypes.map(type => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setForm({ ...form, type: type.id })}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '20px',
                          border: form.type === type.id ? `2px solid ${type.color}` : '2px solid #e5e7eb',
                          background: form.type === type.id ? type.color + '15' : 'white',
                          color: form.type === type.id ? type.color : '#666',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: form.type === type.id ? 'bold' : 'normal',
                        }}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>Name *</label>
                    <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>Email *</label>
                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle} required />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>Subject</label>
                  <input type="text" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Brief description" style={inputStyle} />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>Message *</label>
                  <textarea 
                    value={form.message} 
                    onChange={e => setForm({ ...form, message: e.target.value })} 
                    rows={5} 
                    placeholder={form.type === 'bug' ? "Please describe the bug: What happened? What did you expect? Steps to reproduce..." : "Your message..."}
                    style={inputStyle} 
                    required 
                  />
                </div>

                {/* Screenshot Upload */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <label style={{ fontWeight: 'bold' }}>📷 Attach Screenshot</label>
                    <button 
                      type="button" 
                      onClick={() => setShowScreenshotHelp(!showScreenshotHelp)}
                      style={{ background: '#e0f2fe', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', fontSize: '0.8rem', color: '#0369a1' }}
                    >?</button>
                  </div>
                  
                  {showScreenshotHelp && (
                    <div style={{ background: '#f0f9ff', padding: '1rem', borderRadius: '8px', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
                      <strong>How to take a screenshot:</strong>
                      <div style={{ marginTop: '0.5rem', display: 'grid', gap: '0.5rem' }}>
                        <div>🖥️ <strong>Windows:</strong> Press <code style={{ background: '#e5e7eb', padding: '2px 6px', borderRadius: '4px' }}>Win + Shift + S</code> or <code style={{ background: '#e5e7eb', padding: '2px 6px', borderRadius: '4px' }}>PrtScn</code></div>
                        <div>🍎 <strong>Mac:</strong> Press <code style={{ background: '#e5e7eb', padding: '2px 6px', borderRadius: '4px' }}>Cmd + Shift + 4</code></div>
                        <div>📱 <strong>iPhone:</strong> Press <code style={{ background: '#e5e7eb', padding: '2px 6px', borderRadius: '4px' }}>Side + Volume Up</code></div>
                        <div>🤖 <strong>Android:</strong> Press <code style={{ background: '#e5e7eb', padding: '2px 6px', borderRadius: '4px' }}>Power + Volume Down</code></div>
                      </div>
                    </div>
                  )}

                  <div style={{ border: '2px dashed #ddd', borderRadius: '8px', padding: '1rem', textAlign: 'center', background: '#fafafa' }}>
                    {screenshotPreview ? (
                      <div>
                        <img src={screenshotPreview} alt="Screenshot preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }} />
                        <button 
                          type="button" 
                          onClick={() => { setScreenshot(null); setScreenshotPreview(''); }}
                          style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                        >
                          ✕ Remove
                        </button>
                      </div>
                    ) : (
                      <label style={{ cursor: 'pointer', display: 'block' }}>
                        <input type="file" accept="image/*" onChange={handleScreenshotChange} style={{ display: 'none' }} />
                        <span style={{ color: '#666' }}>📎 Click to upload or drag & drop</span>
                        <br />
                        <span style={{ fontSize: '0.8rem', color: '#999' }}>PNG, JPG up to 5MB</span>
                      </label>
                    )}
                  </div>
                </div>

                {error && <p style={{ color: '#ef4444', margin: 0, padding: '0.5rem', background: '#fee2e2', borderRadius: '8px' }}>{error}</p>}
                
                <button type="submit" disabled={sending} style={{ padding: '1rem', background: sending ? '#ccc' : '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: sending ? 'not-allowed' : 'pointer' }}>
                  {sending ? 'Sending...' : '📤 Send Feedback'}
                </button>
              </form>
            )}
          </div>

          {/* Info Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Quick Tips */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>💡 Helpful Tips</h3>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#666', lineHeight: 1.8 }}>
                <li>For bugs, include steps to reproduce</li>
                <li>Screenshots help us understand issues faster</li>
                <li>Include the page URL where you found the problem</li>
                <li>Be specific about what you expected vs what happened</li>
              </ul>
            </div>

            {/* Contact Info */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>📬 Direct Contact</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.5rem' }}>📧</span>
                <a href="mailto:contact@edonthego.org" style={{ color: '#2563eb' }}>contact@edonthego.org</a>
              </div>
            </div>

            {/* We Listen */}
            <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', padding: '1.5rem', color: 'white' }}>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>🎯 We Listen!</h3>
              <p style={{ margin: 0, opacity: 0.95, fontSize: '0.95rem' }}>
                Your feedback shapes our community platform. Many features were added based on user suggestions!
              </p>
            </div>

            {/* What We're Looking For */}
            <div style={{ background: '#ecfdf5', borderRadius: '12px', padding: '1.5rem', border: '1px solid #a7f3d0' }}>
              <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.1rem', color: '#065f46' }}>✨ We Want to Hear About</h3>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#047857', lineHeight: 1.8, fontSize: '0.9rem' }}>
                <li>Features you'd like to see</li>
                <li>Broken links or errors</li>
                <li>Navigation improvements</li>
                <li>Missing information</li>
                <li>Accessibility issues</li>
              </ul>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
