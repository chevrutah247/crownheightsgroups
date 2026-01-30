'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Campaign {
  id: string;
  title: string;
  description: string;
  goal: number;
  raised: number;
  donationLink: string;
  imageUrl: string;
  organizer: string;
  status: string;
}

export default function CharityPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState('');
  const [donationLink, setDonationLink] = useState('');
  const [organizer, setOrganizer] = useState('');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch('/api/campaigns');
      const data = await res.json();
      setCampaigns(Array.isArray(data) ? data.filter((c: Campaign) => c.status === 'active') : []);
    } catch (e) {
      console.error('Failed to fetch campaigns');
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
      const res = await fetch('/api/suggest-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          goal: Number(goal) || 0,
          donationLink,
          organizer,
          submittedBy: userEmail
        })
      });

      if (!res.ok) throw new Error('Failed to submit');

      setSuccess(true);
      setShowForm(false);
      setTitle('');
      setDescription('');
      setGoal('');
      setDonationLink('');
      setOrganizer('');
    } catch (err) {
      setError('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = { width: '100%', padding: '0.875rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' as const };

  return (
    <div>
      <Header user={null} onLogout={() => {}} />
      
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#1e3a5f', marginBottom: '0.5rem' }}>💝 Charity Campaigns</h1>
          <p style={{ color: '#666' }}>Help families and individuals in our community</p>
          <p style={{ color: '#dc2626', fontWeight: 'bold', marginTop: '0.5rem' }}>
            {campaigns.length} Active Campaigns
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button
            onClick={() => setShowForm(true)}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            + Start a Campaign
          </button>
        </div>

        {success && (
          <div style={{ background: '#d1fae5', color: '#065f46', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center' }}>
            ✅ Campaign submitted! It will appear after admin approval.
          </div>
        )}

        {showForm && (
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
            <h2 style={{ marginBottom: '1rem' }}>Start a Campaign</h2>
            {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Campaign Title *</label>
                <input style={inputStyle} value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g., Help the Cohen Family" />
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Description *</label>
                <textarea style={{ ...inputStyle, minHeight: '100px' }} value={description} onChange={e => setDescription(e.target.value)} required placeholder="Describe the situation and how funds will be used" />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Goal Amount ($)</label>
                  <input style={inputStyle} type="number" value={goal} onChange={e => setGoal(e.target.value)} placeholder="10000" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Organizer Name</label>
                  <input style={inputStyle} value={organizer} onChange={e => setOrganizer(e.target.value)} placeholder="Your name" />
                </div>
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Donation Link *</label>
                <input style={inputStyle} value={donationLink} onChange={e => setDonationLink(e.target.value)} required placeholder="https://charidy.com/..." />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px', background: 'white', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ flex: 1, padding: '0.75rem', background: submitting ? '#ccc' : '#dc2626', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: submitting ? 'not-allowed' : 'pointer' }}>
                  {submitting ? 'Submitting...' : 'Submit Campaign'}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <p style={{ textAlign: 'center', color: '#666' }}>Loading campaigns...</p>
        ) : campaigns.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💝</div>
            <p>No active campaigns</p>
            <p>Be the first to start a fundraiser!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {campaigns.map(campaign => (
              <div key={campaign.id} style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <h3 style={{ marginBottom: '0.5rem', color: '#1e3a5f' }}>{campaign.title}</h3>
                <p style={{ color: '#666', marginBottom: '1rem' }}>{campaign.description}</p>
                {campaign.goal > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span>${campaign.raised || 0} raised</span>
                      <span>Goal: ${campaign.goal}</span>
                    </div>
                    <div style={{ background: '#e5e7eb', borderRadius: '4px', height: '8px' }}>
                      <div style={{ background: '#dc2626', borderRadius: '4px', height: '100%', width: `${Math.min(100, ((campaign.raised || 0) / campaign.goal) * 100)}%` }} />
                    </div>
                  </div>
                )}
                {campaign.donationLink && (
                  <a href={campaign.donationLink} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '0.75rem 1.5rem', background: '#dc2626', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
                    Donate Now
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