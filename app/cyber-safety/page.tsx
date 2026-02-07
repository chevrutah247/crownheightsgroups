'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EmergencyBar from '@/components/EmergencyBar';

interface RSSItem {
  title: string;
  link: string;
  date: string;
  category?: string;
}

export default function CyberSafetyPage() {
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [news, setNews] = useState<RSSItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch('/api/cyber-news');
        const data = await res.json();
        if (data.items) setNews(data.items);
      } catch (error) {
        console.error('Failed to fetch news:', error);
      } finally {
        setNewsLoading(false);
      }
    };
    fetchNews();
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setSubscribeStatus('loading');
    try {
      const res = await fetch('/api/cyber-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (res.ok) {
        setSubscribeStatus('success');
        setEmail('');
      } else {
        setSubscribeStatus('error');
      }
    } catch {
      setSubscribeStatus('error');
    }
  };

  const sectionStyle = {
    background: 'white',
    borderRadius: '20px',
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
  };

  const stepStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1.5rem',
    padding: '1.5rem',
    background: '#f8fafc',
    borderRadius: '16px',
    marginBottom: '1rem'
  };

  const stepNumberStyle = {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.75rem',
    fontWeight: 'bold',
    flexShrink: 0
  };

  const buttonStyle = (color: string) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    padding: '1.25rem 2rem',
    background: color,
    color: 'white',
    borderRadius: '16px',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '1.25rem',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    marginTop: '1rem'
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>
      <EmergencyBar />
      <Header user={null} onLogout={() => {}} />
      
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        
        {/* Hero Section with Banner */}
        <div style={{ 
          borderRadius: '24px', 
          overflow: 'hidden',
          marginBottom: '2rem',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)'
        }}>
          {/* Banner Image */}
          <img 
            src="/images/cyber-safety-banner.png" 
            alt="Cyber Safety Center - Protect Yourself from Scammers"
            style={{ 
              width: '100%', 
              height: 'auto',
              maxHeight: '400px',
              objectFit: 'cover',
              display: 'block'
            }}
          />
          
          {/* Text Overlay Below Image */}
          <div style={{ 
            background: 'linear-gradient(135deg, #1e3a5f 0%, #3b82f6 100%)', 
            padding: '2rem', 
            textAlign: 'center',
            color: 'white'
          }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Cyber Safety Center
            </h1>
            <p style={{ fontSize: '1.5rem', opacity: 0.9, margin: 0 }}>
              Simple steps to protect yourself from scammers
            </p>
            <p style={{ fontSize: '1.1rem', opacity: 0.7, marginTop: '0.5rem' }}>
              CrownHeightsGroups.com
            </p>
          </div>
        </div>

        <style>{`
          @media (max-width: 900px) {
            .cyber-grid { grid-template-columns: 1fr !important; }
            .cyber-sidebar { order: -1; }
          }
        `}</style>

        <div className="cyber-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(300px, 350px)', gap: '2rem', alignItems: 'start' }}>
          
          {/* Main Content */}
          <div>
            
            {/* SECTION 1: Check Email Leaks */}
            <div style={sectionStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '3rem' }}>📧</span>
                <div>
                  <h2 style={{ color: '#dc2626', margin: 0, fontSize: '2rem' }}>
                    Step 1: Check for Email Leaks
                  </h2>
                  <p style={{ color: '#666', margin: '0.25rem 0 0 0', fontSize: '1.1rem' }}>
                    Find out if your email was stolen by hackers
                  </p>
                </div>
              </div>
              
              <div style={{ 
                background: '#fef2f2', 
                border: '2px solid #fecaca', 
                borderRadius: '16px', 
                padding: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                <p style={{ margin: 0, fontSize: '1.25rem', color: '#991b1b', lineHeight: '1.6' }}>
                  ⚠️ <strong>Important!</strong> Hackers regularly breach websites and steal email addresses with passwords. 
                  If your email is in a breach database — <strong>change your password immediately!</strong>
                </p>
              </div>

              <div style={stepStyle}>
                <div style={stepNumberStyle}>1</div>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.4rem', color: '#1e3a5f' }}>
                    Open the checking website
                  </h3>
                  <p style={{ margin: 0, color: '#666', fontSize: '1.1rem', lineHeight: '1.6' }}>
                    Click the green button below. It will open <strong>HaveIBeenPwned</strong> — 
                    a trusted service from a well-known security expert.
                  </p>
                </div>
              </div>

              <div style={stepStyle}>
                <div style={stepNumberStyle}>2</div>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.4rem', color: '#1e3a5f' }}>
                    Enter your email
                  </h3>
                  <p style={{ margin: 0, color: '#666', fontSize: '1.1rem', lineHeight: '1.6' }}>
                    Type your email address in the field and click the <strong>"pwned?"</strong> button
                  </p>
                </div>
              </div>

              <div style={stepStyle}>
                <div style={stepNumberStyle}>3</div>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.4rem', color: '#1e3a5f' }}>
                    Check the result
                  </h3>
                  <p style={{ margin: 0, color: '#666', fontSize: '1.1rem', lineHeight: '1.6' }}>
                    🟢 <strong>Green background</strong> = Your email was not found in breaches. Great!<br/>
                    🔴 <strong>Red background</strong> = Your email was stolen! <strong>Change your password NOW!</strong>
                  </p>
                </div>
              </div>

              <a 
                href="https://haveibeenpwned.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                style={buttonStyle('linear-gradient(135deg, #059669, #047857)')}
              >
                📧 Check My Email
              </a>
            </div>

            {/* SECTION 2: Change Password */}
            <div style={sectionStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '3rem' }}>🔑</span>
                <div>
                  <h2 style={{ color: '#f59e0b', margin: 0, fontSize: '2rem' }}>
                    Step 2: Change Your Password
                  </h2>
                  <p style={{ color: '#666', margin: '0.25rem 0 0 0', fontSize: '1.1rem' }}>
                    If your email was breached — change your password immediately!
                  </p>
                </div>
              </div>
              
              <div style={{ 
                background: '#fef3c7', 
                border: '2px solid #fcd34d', 
                borderRadius: '16px', 
                padding: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{ margin: '0 0 1rem 0', color: '#92400e', fontSize: '1.3rem' }}>
                  💡 How to create a strong password:
                </h3>
                <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#78350f', fontSize: '1.15rem', lineHeight: '2' }}>
                  <li>At least <strong>12 characters</strong></li>
                  <li>Use <strong>UPPERCASE</strong> and <strong>lowercase</strong> letters</li>
                  <li>Add <strong>numbers</strong> (e.g.: 7, 42, 2024)</li>
                  <li>Add <strong>symbols</strong> (e.g.: !, @, #, $)</li>
                  <li>❌ DON'T use names, birthdays, or "123456"</li>
                </ul>
              </div>

              <div style={{ 
                background: '#f0fdf4', 
                border: '2px solid #86efac', 
                borderRadius: '16px', 
                padding: '1.5rem'
              }}>
                <h3 style={{ margin: '0 0 0.75rem 0', color: '#166534', fontSize: '1.3rem' }}>
                  ✅ Example of a good password:
                </h3>
                <code style={{ 
                  display: 'block',
                  background: '#dcfce7', 
                  padding: '1rem', 
                  borderRadius: '8px', 
                  fontSize: '1.5rem',
                  fontFamily: 'monospace',
                  color: '#15803d',
                  letterSpacing: '2px'
                }}>
                  Shabbat$Shalom2024!
                </code>
                <p style={{ margin: '0.75rem 0 0 0', color: '#166534', fontSize: '1rem' }}>
                  This password has 19 characters, uppercase and lowercase letters, numbers, and symbols.
                </p>
              </div>
            </div>

            {/* SECTION 3: Scan Computer */}
            <div style={sectionStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '3rem' }}>🖥️</span>
                <div>
                  <h2 style={{ color: '#3b82f6', margin: 0, fontSize: '2rem' }}>
                    Step 3: Scan Your Computer for Viruses
                  </h2>
                  <p style={{ color: '#666', margin: '0.25rem 0 0 0', fontSize: '1.1rem' }}>
                    Use built-in and free tools to check for malware
                  </p>
                </div>
              </div>

              {/* Windows MRT */}
              <div style={{ 
                background: '#eff6ff', 
                border: '2px solid #93c5fd', 
                borderRadius: '16px', 
                padding: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{ margin: '0 0 1rem 0', color: '#1d4ed8', fontSize: '1.5rem' }}>
                  🛠️ Option 1: Windows Built-in Tool (MRT)
                </h3>
                <p style={{ margin: '0 0 1rem 0', color: '#666', fontSize: '1.1rem', lineHeight: '1.6' }}>
                  Every Windows computer has a <strong>free built-in tool</strong> to remove viruses. 
                  Microsoft updates it every month automatically.
                </p>
                
                <div style={{ background: 'white', borderRadius: '12px', padding: '1.25rem' }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: '#1e3a5f', fontSize: '1.2rem' }}>
                    📋 Instructions:
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.15rem' }}>
                      <span style={{ 
                        width: '36px', height: '36px', borderRadius: '50%', 
                        background: '#3b82f6', color: 'white', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 'bold', flexShrink: 0
                      }}>1</span>
                      <span>Press <strong style={{ background: '#e5e7eb', padding: '4px 8px', borderRadius: '4px' }}>Win + R</strong> keys together</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.15rem' }}>
                      <span style={{ 
                        width: '36px', height: '36px', borderRadius: '50%', 
                        background: '#3b82f6', color: 'white', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 'bold', flexShrink: 0
                      }}>2</span>
                      <span>Type <code style={{ background: '#1e3a5f', color: 'white', padding: '4px 12px', borderRadius: '4px', fontSize: '1.25rem' }}>mrt</code> and press Enter</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.15rem' }}>
                      <span style={{ 
                        width: '36px', height: '36px', borderRadius: '50%', 
                        background: '#3b82f6', color: 'white', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 'bold', flexShrink: 0
                      }}>3</span>
                      <span>Select <strong>"Full scan"</strong> option</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.15rem' }}>
                      <span style={{ 
                        width: '36px', height: '36px', borderRadius: '50%', 
                        background: '#3b82f6', color: 'white', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 'bold', flexShrink: 0
                      }}>4</span>
                      <span>Wait for scan to complete (20-60 minutes)</span>
                    </div>
                  </div>
                </div>
                
                <p style={{ margin: '1rem 0 0 0', color: '#059669', fontSize: '1.1rem', fontWeight: '500' }}>
                  ⏰ Recommended: Run once a month!
                </p>
              </div>

              {/* Dr.Web CureIt */}
              <div style={{ 
                background: '#f0fdf4', 
                border: '2px solid #86efac', 
                borderRadius: '16px', 
                padding: '1.5rem'
              }}>
                <h3 style={{ margin: '0 0 1rem 0', color: '#166534', fontSize: '1.5rem' }}>
                  🩺 Option 2: Dr.Web CureIt! (Free)
                </h3>
                <p style={{ margin: '0 0 1rem 0', color: '#666', fontSize: '1.1rem', lineHeight: '1.6' }}>
                  A <strong>free antivirus scanner</strong> from the trusted Dr.Web company. 
                  No installation needed — just download and run it.
                </p>
                
                <div style={{ background: 'white', borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem' }}>
                  <h4 style={{ margin: '0 0 0.75rem 0', color: '#1e3a5f', fontSize: '1.1rem' }}>
                    ✅ Benefits:
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#666', fontSize: '1.1rem', lineHeight: '1.8' }}>
                    <li>No installation required</li>
                    <li>Works alongside your regular antivirus</li>
                    <li>Finds viruses that others miss</li>
                    <li>Completely free for home use</li>
                  </ul>
                </div>

                <a 
                  href="https://free.drweb.com/download+cureit+free/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={buttonStyle('linear-gradient(135deg, #22c55e, #16a34a)')}
                >
                  ⬇️ Download Dr.Web CureIt!
                </a>
              </div>
            </div>

            {/* SECTION 4: Check Links */}
            <div style={sectionStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '3rem' }}>🔗</span>
                <div>
                  <h2 style={{ color: '#7c3aed', margin: 0, fontSize: '2rem' }}>
                    Step 4: Check Suspicious Links
                  </h2>
                  <p style={{ color: '#666', margin: '0.25rem 0 0 0', fontSize: '1.1rem' }}>
                    Before you click — verify it's safe!
                  </p>
                </div>
              </div>

              <div style={{ 
                background: '#faf5ff', 
                border: '2px solid #c4b5fd', 
                borderRadius: '16px', 
                padding: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                <p style={{ margin: '0 0 1rem 0', color: '#5b21b6', fontSize: '1.2rem', lineHeight: '1.6' }}>
                  🚨 <strong>Scammers often send dangerous links</strong> through WhatsApp, email, and text messages. 
                  Before clicking any link — check it on VirusTotal!
                </p>
                
                <div style={{ background: 'white', borderRadius: '12px', padding: '1.25rem' }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: '#1e3a5f', fontSize: '1.2rem' }}>
                    📋 How to check a link:
                  </h4>
                  <ol style={{ margin: 0, paddingLeft: '1.5rem', color: '#666', fontSize: '1.1rem', lineHeight: '2' }}>
                    <li><strong>Copy</strong> the suspicious link (don't click it!)</li>
                    <li>Open <strong>VirusTotal.com</strong></li>
                    <li>Paste the link and click <strong>Search</strong></li>
                    <li>If you see ❌ red marks — <strong>don't open it!</strong></li>
                  </ol>
                </div>
              </div>

              <a 
                href="https://www.virustotal.com/gui/home/url" 
                target="_blank" 
                rel="noopener noreferrer"
                style={buttonStyle('linear-gradient(135deg, #7c3aed, #5b21b6)')}
              >
                🔍 Check a Link on VirusTotal
              </a>
            </div>

            {/* SECTION 5: Stop Spam Calls */}
            <div style={sectionStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '3rem' }}>📵</span>
                <div>
                  <h2 style={{ color: '#0891b2', margin: 0, fontSize: '2rem' }}>
                    Bonus: Reduce Spam Calls
                  </h2>
                  <p style={{ color: '#666', margin: '0.25rem 0 0 0', fontSize: '1.1rem' }}>
                    Register your number on the "Do Not Call" list
                  </p>
                </div>
              </div>

              <p style={{ margin: '0 0 1.5rem 0', color: '#666', fontSize: '1.15rem', lineHeight: '1.6' }}>
                Register your phone number on the official <strong>Do Not Call Registry</strong>. 
                It's <strong>free</strong> and will reduce the number of telemarketing calls. 
                Registration lasts forever.
              </p>

              <a 
                href="https://www.donotcall.gov/" 
                target="_blank" 
                rel="noopener noreferrer"
                style={buttonStyle('linear-gradient(135deg, #0891b2, #0e7490)')}
              >
                📵 Register on DoNotCall.gov
              </a>
            </div>

          </div>

          {/* Sidebar */}
          <div className="cyber-sidebar">
            
            {/* Subscribe to Reminders */}
            <div style={{ 
              ...sectionStyle, 
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              border: '3px solid #f59e0b',
              position: 'sticky',
              top: '1rem'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '3rem' }}>🔔</span>
                <h3 style={{ color: '#92400e', margin: '0.5rem 0', fontSize: '1.4rem' }}>
                  Monthly Reminders
                </h3>
                <p style={{ color: '#78350f', margin: 0, fontSize: '1rem' }}>
                  Get an email every 30 days reminding you to check your security
                </p>
              </div>

              {subscribeStatus === 'success' ? (
                <div style={{ 
                  background: '#dcfce7', 
                  borderRadius: '12px', 
                  padding: '1.5rem', 
                  textAlign: 'center' 
                }}>
                  <span style={{ fontSize: '3rem' }}>✅</span>
                  <p style={{ color: '#166534', fontSize: '1.1rem', margin: '0.5rem 0 0 0', fontWeight: '500' }}>
                    You're subscribed! First email comes in 30 days.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubscribe}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email..."
                    required
                    style={{
                      width: '100%',
                      padding: '1rem',
                      fontSize: '1.1rem',
                      borderRadius: '12px',
                      border: '2px solid #fcd34d',
                      marginBottom: '0.75rem',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="submit"
                    disabled={subscribeStatus === 'loading'}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      background: subscribeStatus === 'loading' ? '#9ca3af' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: subscribeStatus === 'loading' ? 'wait' : 'pointer'
                    }}
                  >
                    {subscribeStatus === 'loading' ? '⏳ Subscribing...' : '🔔 Subscribe'}
                  </button>
                  {subscribeStatus === 'error' && (
                    <p style={{ color: '#dc2626', fontSize: '0.95rem', margin: '0.5rem 0 0 0', textAlign: 'center' }}>
                      Error. Please try again.
                    </p>
                  )}
                </form>
              )}

              <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.5)', borderRadius: '12px' }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#78350f' }}>
                  📧 Every 30 days you'll get a reminder to:
                </p>
                <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.25rem', fontSize: '0.9rem', color: '#92400e' }}>
                  <li>Check email for breaches</li>
                  <li>Change password if needed</li>
                  <li>Run virus scan</li>
                </ul>
              </div>
            </div>

            {/* Cyber News */}
            <div style={sectionStyle}>
              <h3 style={{ color: '#1e3a5f', margin: '0 0 1rem 0', fontSize: '1.3rem' }}>
                🚨 FBI Scam Alerts
              </h3>
              <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Latest warnings from IC3 (Internet Crime Complaint Center)
              </p>
              
              {newsLoading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                  ⏳ Loading news...
                </div>
              ) : news.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {news.slice(0, 6).map((item, i) => (
                    <a
                      key={i}
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'block',
                        padding: '0.75rem',
                        background: '#fef2f2',
                        borderRadius: '10px',
                        textDecoration: 'none',
                        borderLeft: '4px solid #dc2626'
                      }}
                    >
                      <div style={{ color: '#1e3a5f', fontSize: '0.95rem', fontWeight: '500', lineHeight: '1.4' }}>
                        {item.title}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                        <span style={{ color: '#dc2626', fontSize: '0.75rem', fontWeight: 'bold' }}>
                          {item.category || 'FBI'}
                        </span>
                        <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>
                          {item.date}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#666', fontSize: '0.95rem' }}>
                  News temporarily unavailable
                </p>
              )}

              <a 
                href="https://www.ic3.gov/PSA" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  marginTop: '1rem',
                  padding: '0.75rem',
                  background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                  color: 'white',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: '0.95rem'
                }}
              >
                🚨 All IC3 Alerts
              </a>
              
              <a 
                href="https://www.ic3.gov/CrimeInfo/ElderFraud" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  marginTop: '0.5rem',
                  padding: '0.75rem',
                  background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                  color: 'white',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: '0.95rem'
                }}
              >
                👴 Elder Fraud Info
              </a>
            </div>

            {/* Quick Links */}
            <div style={sectionStyle}>
              <h3 style={{ color: '#1e3a5f', margin: '0 0 1rem 0', fontSize: '1.2rem' }}>
                🔗 Quick Links
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <a href="https://haveibeenpwned.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#dc2626', fontSize: '1rem', padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb', textDecoration: 'none' }}>
                  📧 Check email breaches
                </a>
                <a href="https://www.virustotal.com/gui/home/upload" target="_blank" rel="noopener noreferrer" style={{ color: '#059669', fontSize: '1rem', padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb', textDecoration: 'none' }}>
                  🔍 Scan a file
                </a>
                <a href="https://www.virustotal.com/gui/home/url" target="_blank" rel="noopener noreferrer" style={{ color: '#7c3aed', fontSize: '1rem', padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb', textDecoration: 'none' }}>
                  🔗 Check a link
                </a>
                <a href="https://free.drweb.com/download+cureit+free/" target="_blank" rel="noopener noreferrer" style={{ color: '#22c55e', fontSize: '1rem', padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb', textDecoration: 'none' }}>
                  🩺 Dr.Web CureIt!
                </a>
                <a href="https://www.donotcall.gov/" target="_blank" rel="noopener noreferrer" style={{ color: '#0891b2', fontSize: '1rem', padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb', textDecoration: 'none' }}>
                  📵 Do Not Call Registry
                </a>
                <a href="https://www.ic3.gov/" target="_blank" rel="noopener noreferrer" style={{ color: '#1e3a5f', fontSize: '1rem', padding: '0.5rem 0', textDecoration: 'none' }}>
                  🏛️ IC3 - Report a scam
                </a>
              </div>
            </div>
          </div>
        </div>

      </main>
      
      <Footer />
    </div>
  );
}
