'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface UserInfo { name: string; email: string; role: 'user' | 'admin'; }
interface Campaign {
  id: string;
  campaignName: string;
  description: string;
  imageUrl?: string;
  whatsappLink?: string;
  websiteLink?: string;
  goalAmount: number;
  expiresAt: string;
  refereeName: string;
  refereeRole?: string;
  status: string;
  createdAt: string;
  likes?: number;
  likedBy?: string[];
}

export default function CharityPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [archived, setArchived] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
    Promise.all([
      fetch('/api/charity').then(r => r.json()),
      fetch('/api/charity?archived=true').then(r => r.json())
    ])
      .then(([active, arch]) => {
        setCampaigns(Array.isArray(active) ? active : []);
        setArchived(Array.isArray(arch) ? arch : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => { localStorage.clear(); router.push('/auth/login'); };

  const getDaysLeft = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const handleLike = async (campaignId: string) => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/charity/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId, userEmail: user.email })
      });
      
      if (response.ok) {
        const data = await response.json();
        setCampaigns(prev => prev.map(c => 
          c.id === campaignId ? { ...c, likes: data.likes, likedBy: data.likedBy } : c
        ));
      }
    } catch (err) {
      console.error('Like failed:', err);
    }
  };

  const shareViaEmail = (campaign: Campaign) => {
    const subject = encodeURIComponent(`Help Support: ${campaign.campaignName}`);
    const body = encodeURIComponent(`I wanted to share this important fundraising campaign with you:\n\n${campaign.campaignName}\n\n${campaign.description.slice(0, 200)}...\n\nGoal: $${campaign.goalAmount.toLocaleString()}\n\nDonate here: ${campaign.websiteLink || campaign.whatsappLink || window.location.href}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareViaWhatsApp = (campaign: Campaign) => {
    const text = encodeURIComponent(`💝 *${campaign.campaignName}*\n\n${campaign.description.slice(0, 150)}...\n\n🎯 Goal: $${campaign.goalAmount.toLocaleString()}\n\n👉 Donate: ${campaign.websiteLink || campaign.whatsappLink || window.location.href}`);
    window.open(`https://wa.me/?text=${text}`);
  };

  const copyLink = (campaign: Campaign) => {
    const link = campaign.websiteLink || `${window.location.origin}/charity#${campaign.id}`;
    navigator.clipboard.writeText(link);
    setCopiedId(campaign.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isLikedByUser = (campaign: Campaign) => {
    return user && campaign.likedBy?.includes(user.email);
  };

  const displayCampaigns = showArchived ? archived : campaigns;

  return (
    <div>
      <Header user={user} onLogout={handleLogout} />
      <main className="main">
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', color: '#e11d48', marginBottom: '0.5rem' }}>💝 Charity Campaigns</h1>
            <p style={{ color: '#666' }}>Help families and individuals in our community</p>
            <p style={{ color: '#e11d48', fontSize: '1.25rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
              {campaigns.length} Active Campaign{campaigns.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <Link 
              href="/add/charity"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: '#e11d48',
                color: 'white',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 'bold'
              }}
            >
              ➕ Start a Campaign
            </Link>
            <button
              onClick={() => setShowArchived(!showArchived)}
              style={{
                padding: '0.75rem 1.5rem',
                background: showArchived ? '#64748b' : '#f1f5f9',
                color: showArchived ? 'white' : '#475569',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              {showArchived ? '← Active Campaigns' : '📁 View Archive (' + archived.length + ')'}
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div className="spinner"></div>
            </div>
          ) : displayCampaigns.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: '#fef2f2', borderRadius: '12px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💝</div>
              <h3 style={{ color: '#991b1b' }}>
                {showArchived ? 'No archived campaigns' : 'No active campaigns'}
              </h3>
              {!showArchived && (
                <p style={{ color: '#666', marginTop: '0.5rem' }}>Be the first to start a fundraiser!</p>
              )}
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {displayCampaigns.map(campaign => (
                <div
                  key={campaign.id}
                  id={campaign.id}
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                    border: '1px solid #fee2e2'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {campaign.imageUrl && (
                      <div style={{ 
                        height: '200px', 
                        backgroundImage: `url(${campaign.imageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }} />
                    )}
                    <div style={{ padding: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                        <h2 style={{ margin: 0, color: '#1e3a5f', fontSize: '1.25rem' }}>{campaign.campaignName}</h2>
                        {!showArchived && (
                          <span style={{
                            background: getDaysLeft(campaign.expiresAt) <= 1 ? '#fee2e2' : '#dcfce7',
                            color: getDaysLeft(campaign.expiresAt) <= 1 ? '#dc2626' : '#16a34a',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: 'bold'
                          }}>
                            {getDaysLeft(campaign.expiresAt)} days left
                          </span>
                        )}
                      </div>

                      <p style={{ color: '#666', marginBottom: '1rem', lineHeight: '1.6' }}>
                        {campaign.description.length > 300 
                          ? campaign.description.slice(0, 300) + '...' 
                          : campaign.description}
                      </p>

                      <div style={{ 
                        background: '#f8fafc', 
                        padding: '1rem', 
                        borderRadius: '8px',
                        marginBottom: '1rem'
                      }}>
                        <div style={{ fontWeight: 'bold', color: '#1e3a5f', marginBottom: '0.5rem' }}>
                          🎯 Goal: ${campaign.goalAmount?.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>
                          📋 Reference: {campaign.refereeName} {campaign.refereeRole && `(${campaign.refereeRole})`}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                        {campaign.websiteLink && (
                          <a
                            href={campaign.websiteLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              padding: '0.75rem 1.5rem',
                              background: '#e11d48',
                              color: 'white',
                              borderRadius: '8px',
                              textDecoration: 'none',
                              fontWeight: 'bold'
                            }}
                          >
                            💝 Donate Now
                          </a>
                        )}
                        {campaign.whatsappLink && (
                          <a
                            href={campaign.whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              padding: '0.75rem 1.5rem',
                              background: '#25D366',
                              color: 'white',
                              borderRadius: '8px',
                              textDecoration: 'none',
                              fontWeight: 'bold'
                            }}
                          >
                            📱 WhatsApp
                          </a>
                        )}
                      </div>

                      {/* Like & Share Section */}
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        paddingTop: '1rem',
                        borderTop: '1px solid #f1f5f9'
                      }}>
                        {/* Like Button */}
                        <button
                          onClick={() => handleLike(campaign.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            background: isLikedByUser(campaign) ? '#fee2e2' : '#f1f5f9',
                            border: 'none',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            color: isLikedByUser(campaign) ? '#e11d48' : '#666'
                          }}
                        >
                          {isLikedByUser(campaign) ? '❤️' : '🤍'} {campaign.likes || 0}
                        </button>

                        {/* Share Buttons */}
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => shareViaEmail(campaign)}
                            title="Share via Email"
                            style={{
                              padding: '0.5rem',
                              background: '#f1f5f9',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '1.2rem'
                            }}
                          >
                            📧
                          </button>
                          <button
                            onClick={() => shareViaWhatsApp(campaign)}
                            title="Share via WhatsApp"
                            style={{
                              padding: '0.5rem',
                              background: '#dcfce7',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '1.2rem'
                            }}
                          >
                            💬
                          </button>
                          <button
                            onClick={() => copyLink(campaign)}
                            title="Copy Link"
                            style={{
                              padding: '0.5rem',
                              background: copiedId === campaign.id ? '#dcfce7' : '#f1f5f9',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '1.2rem'
                            }}
                          >
                            {copiedId === campaign.id ? '✅' : '🔗'}
                          </button>
                        </div>
                      </div>
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
