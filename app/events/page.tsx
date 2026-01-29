'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface UserInfo { name: string; email: string; role: 'user' | 'admin'; }
interface Event {
  id: string;
  title: string;
  eventType: string;
  description: string;
  date?: string;
  time?: string;
  address?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  link?: string;
  imageUrl?: string;
  status: string;
  createdAt: string;
}

const eventTypeLabels: Record<string, { name: string; icon: string }> = {
  'shiur': { name: 'Shiur / Class', icon: '📚' },
  'farbrengen': { name: 'Farbrengen', icon: '🥃' },
  'simcha': { name: 'Simcha', icon: '🎉' },
  'wedding': { name: 'Wedding', icon: '💒' },
  'bris': { name: 'Bris', icon: '✂️' },
  'kiddush': { name: 'Kiddush', icon: '🍷' },
  'lecture': { name: 'Lecture', icon: '🎤' },
  'community': { name: 'Community Event', icon: '👥' },
  'other': { name: 'Other', icon: '📅' }
};

export default function EventsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

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

  useEffect(() => {
    fetch('/api/events')
      .then(r => r.json())
      .then(data => setEvents(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => { localStorage.clear(); router.push('/auth/login'); };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${minutes} ${ampm}`;
  };

  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(e => e.eventType === filter);

  const eventTypes = ['all', ...Array.from(new Set(events.map(e => e.eventType)))];

  return (
    <div>
      <Header user={user} onLogout={handleLogout} />
      <main className="main">
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', color: '#f59e0b', marginBottom: '0.5rem' }}>🎉 Community Events</h1>
            <p style={{ color: '#666' }}>Shiurim, Farbrengens, Simchas & more</p>
            <p style={{ color: '#f59e0b', fontSize: '1.25rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
              {events.length} Upcoming Event{events.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <Link 
              href="/add/event"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: '#f59e0b',
                color: 'white',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 'bold'
              }}
            >
              ➕ Add Event
            </Link>
          </div>

          {/* Filter */}
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
            {eventTypes.map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  border: 'none',
                  background: filter === type ? '#f59e0b' : '#f1f5f9',
                  color: filter === type ? 'white' : '#475569',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: filter === type ? 'bold' : 'normal'
                }}
              >
                {type === 'all' ? '📋 All' : `${eventTypeLabels[type]?.icon || '📅'} ${eventTypeLabels[type]?.name || type}`}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div className="spinner"></div>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: '#fffbeb', borderRadius: '12px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
              <h3 style={{ color: '#92400e' }}>No upcoming events</h3>
              <p style={{ color: '#666', marginTop: '0.5rem' }}>Be the first to add an event!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {filteredEvents.map(event => (
                <div
                  key={event.id}
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                    border: '1px solid #fef3c7',
                    display: 'flex',
                    flexDirection: event.imageUrl ? 'row' : 'column'
                  }}
                >
                  {event.imageUrl && (
                    <div style={{ 
                      width: '200px',
                      minHeight: '150px',
                      backgroundImage: `url(${event.imageUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      flexShrink: 0
                    }} />
                  )}
                  <div style={{ padding: '1.5rem', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                      <div>
                        <span style={{
                          display: 'inline-block',
                          background: '#fef3c7',
                          color: '#92400e',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          marginBottom: '0.5rem'
                        }}>
                          {eventTypeLabels[event.eventType]?.icon} {eventTypeLabels[event.eventType]?.name || event.eventType}
                        </span>
                        <h2 style={{ margin: 0, color: '#1e3a5f', fontSize: '1.25rem' }}>{event.title}</h2>
                      </div>
                      {event.date && (
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 'bold', color: '#f59e0b' }}>{formatDate(event.date)}</div>
                          {event.time && <div style={{ fontSize: '0.85rem', color: '#666' }}>{formatTime(event.time)}</div>}
                        </div>
                      )}
                    </div>

                    <p style={{ color: '#666', marginBottom: '1rem', lineHeight: '1.5' }}>
                      {event.description.length > 200 ? event.description.slice(0, 200) + '...' : event.description}
                    </p>

                    {event.address && (
                      <div style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '0.5rem' }}>
                        📍 {event.address}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                      {event.link && (
                        <a
                          href={event.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            padding: '0.5rem 1rem',
                            background: '#f59e0b',
                            color: 'white',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontSize: '0.85rem',
                            fontWeight: 'bold'
                          }}
                        >
                          🔗 More Info
                        </a>
                      )}
                      {event.contactPhone && (
                        <a
                          href={`tel:${event.contactPhone}`}
                          style={{
                            padding: '0.5rem 1rem',
                            background: '#25D366',
                            color: 'white',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontSize: '0.85rem'
                          }}
                        >
                          📞 Call
                        </a>
                      )}
                      {event.contactEmail && (
                        <a
                          href={`mailto:${event.contactEmail}`}
                          style={{
                            padding: '0.5rem 1rem',
                            background: '#2563eb',
                            color: 'white',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontSize: '0.85rem'
                          }}
                        >
                          ✉️ Email
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
