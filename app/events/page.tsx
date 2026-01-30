'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  address: string;
  organizer: string;
  contactPhone: string;
  link: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [link, setLink] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events');
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const userEmail = localStorage.getItem('user_email') || 'anonymous';
      const res = await fetch('/api/suggest-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          date,
          time,
          location,
          address,
          organizer,
          contactPhone,
          link,
          submittedBy: userEmail
        })
      });

      if (!res.ok) throw new Error('Failed to submit');

      setSuccess(true);
      setShowForm(false);
      setTitle('');
      setDescription('');
      setDate('');
      setTime('');
      setLocation('');
      setAddress('');
      setOrganizer('');
      setContactPhone('');
      setLink('');
    } catch (err) {
      setError('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = { width: '100%', padding: '0.875rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' as const };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div>
      <Header user={null} onLogout={() => {}} />
      
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#1e3a5f', marginBottom: '0.5rem' }}>📅 Community Events</h1>
          <p style={{ color: '#666' }}>Upcoming events in Crown Heights</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button
            onClick={() => setShowForm(true)}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            + Add Event
          </button>
        </div>

        {success && (
          <div style={{ background: '#d1fae5', color: '#065f46', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center' }}>
            ✅ Event submitted! It will appear after admin approval.
          </div>
        )}

        {showForm && (
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
            <h2 style={{ marginBottom: '1rem' }}>Add an Event</h2>
            {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Event Title *</label>
                <input style={inputStyle} value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g., Shabbos Hosting" />
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Description</label>
                <textarea style={{ ...inputStyle, minHeight: '80px' }} value={description} onChange={e => setDescription(e.target.value)} placeholder="Event details" />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Date *</label>
                  <input style={inputStyle} type="date" value={date} onChange={e => setDate(e.target.value)} required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Time</label>
                  <input style={inputStyle} value={time} onChange={e => setTime(e.target.value)} placeholder="7:00 PM" />
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Location/Venue</label>
                  <input style={inputStyle} value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g., 770 Eastern Parkway" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Organizer</label>
                  <input style={inputStyle} value={organizer} onChange={e => setOrganizer(e.target.value)} placeholder="Your name" />
                </div>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Contact Phone</label>
                <input style={inputStyle} value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="718-xxx-xxxx" />
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Link (optional)</label>
                <input style={inputStyle} value={link} onChange={e => setLink(e.target.value)} placeholder="https://..." />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px', background: 'white', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ flex: 1, padding: '0.75rem', background: submitting ? '#ccc' : '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: submitting ? 'not-allowed' : 'pointer' }}>
                  {submitting ? 'Submitting...' : 'Submit Event'}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <p style={{ textAlign: 'center', color: '#666' }}>Loading events...</p>
        ) : events.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
            <p>No upcoming events</p>
            <p>Be the first to add an event!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {events.map(event => (
              <div key={event.id} style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ marginBottom: '0.5rem', color: '#1e3a5f' }}>{event.title}</h3>
                    {event.description && <p style={{ color: '#666', marginBottom: '0.75rem' }}>{event.description}</p>}
                  </div>
                  {event.date && (
                    <div style={{ background: '#dbeafe', padding: '0.5rem 1rem', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ fontWeight: 'bold', color: '#1e40af' }}>{formatDate(event.date)}</div>
                      {event.time && <div style={{ fontSize: '0.9rem', color: '#1e40af' }}>{event.time}</div>}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.75rem', fontSize: '0.9rem', color: '#666' }}>
                  {event.location && <span>📍 {event.location}</span>}
                  {event.organizer && <span>👤 {event.organizer}</span>}
                  {event.contactPhone && <span>📞 {event.contactPhone}</span>}
                </div>
                {event.link && (
                  <a href={event.link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '1rem', color: '#2563eb', textDecoration: 'none' }}>
                    More info →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}