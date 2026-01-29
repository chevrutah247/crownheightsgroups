'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface UserInfo { name: string; email: string; role: 'user' | 'admin'; }

export default function HostShabbosPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    hostName: '',
    shabbosDate: '',
    meals: [] as string[],
    guestCount: '1-2',
    description: '',
    address: '',
    phone: '',
    email: '',
    dietary: '',
    notes: ''
  });

  const mealOptions = [
    { id: 'friday-dinner', name: '🕯️ Friday Night Dinner' },
    { id: 'saturday-lunch', name: '☀️ Shabbos Day Lunch' },
    { id: 'seudah-shlishis', name: '🌅 Seudah Shlishis' },
  ];

  const guestOptions = ['1-2', '3-4', '5-6', '7+'];

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

  const toggleMeal = (mealId: string) => {
    setForm(prev => ({
      ...prev,
      meals: prev.meals.includes(mealId) 
        ? prev.meals.filter(m => m !== mealId)
        : [...prev.meals, mealId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!form.hostName.trim()) { setError('Your name is required'); setLoading(false); return; }
    if (!form.shabbosDate) { setError('Please select a Shabbos date'); setLoading(false); return; }
    if (form.meals.length === 0) { setError('Please select at least one meal'); setLoading(false); return; }
    if (!form.phone && !form.email) { setError('Contact info is required'); setLoading(false); return; }

    try {
      const response = await fetch('/api/shabbos-hosting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          submittedBy: user?.email || 'anonymous',
          status: 'active',
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
          <h1 style={{ color: '#059669', marginBottom: '1rem' }}>Hosting Posted!</h1>
          <p style={{ color: '#666', marginBottom: '2rem' }}>Thank you for opening your home! Guests will contact you directly.</p>
          <p style={{ color: '#c9a227', marginBottom: '2rem' }}>🕯️ Good Shabbos!</p>
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

  // Get next Friday
  const getNextFriday = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7;
    const nextFriday = new Date(today);
    nextFriday.setDate(today.getDate() + daysUntilFriday);
    return nextFriday.toISOString().split('T')[0];
  };

  return (
    <div>
      <Header user={user} onLogout={handleLogout} />
      <main className="main">
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem 1rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🕯️</div>
            <h1 style={{ color: '#c9a227', marginBottom: '0.5rem' }}>Host Shabbos Guests</h1>
            <p style={{ color: '#666' }}>Open your home and invite guests for Shabbos meals</p>
          </div>

          {error && (
            <div style={{ background: '#fee2e2', color: '#dc2626', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Your Name *</label>
              <input
                type="text"
                value={form.hostName}
                onChange={e => setForm({ ...form, hostName: e.target.value })}
                placeholder="e.g., The Cohen Family"
                style={inputStyle}
                required
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Shabbos Date *</label>
              <input
                type="date"
                value={form.shabbosDate}
                onChange={e => setForm({ ...form, shabbosDate: e.target.value })}
                min={getNextFriday()}
                style={inputStyle}
                required
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Which meals? *</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {mealOptions.map(meal => (
                  <label 
                    key={meal.id}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      background: form.meals.includes(meal.id) ? '#fef3c7' : '#f9fafb',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: form.meals.includes(meal.id) ? '2px solid #c9a227' : '2px solid transparent'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={form.meals.includes(meal.id)}
                      onChange={() => toggleMeal(meal.id)}
                      style={{ width: '20px', height: '20px' }}
                    />
                    <span style={{ fontSize: '1rem' }}>{meal.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>How many guests can you host?</label>
              <select
                value={form.guestCount}
                onChange={e => setForm({ ...form, guestCount: e.target.value })}
                style={inputStyle}
              >
                {guestOptions.map(opt => (
                  <option key={opt} value={opt}>{opt} guests</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Description (optional)</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Tell guests about your family, atmosphere, etc."
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Neighborhood/Area</label>
              <input
                type="text"
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                placeholder="Crown Heights, near 770"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Dietary accommodations</label>
              <input
                type="text"
                value={form.dietary}
                onChange={e => setForm({ ...form, dietary: e.target.value })}
                placeholder="e.g., Can accommodate vegetarian, allergies, etc."
                style={inputStyle}
              />
            </div>

            <div style={{ background: '#fffbeb', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <label style={{ ...labelStyle, color: '#92400e' }}>📞 Contact Info (at least one required)</label>
              
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

              <div>
                <label style={{ fontSize: '0.85rem', color: '#666' }}>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="your@email.com"
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={labelStyle}>Additional notes</label>
              <textarea
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                placeholder="Any other information for guests..."
                rows={2}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '1rem',
                background: loading ? '#94a3b8' : '#c9a227',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Posting...' : '🕯️ Post Hosting'}
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
