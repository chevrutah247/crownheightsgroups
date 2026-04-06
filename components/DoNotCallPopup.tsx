'use client';

import { useState, useEffect } from 'react';

export default function DoNotCallPopup() {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Show after 5 seconds, but only once per 7 days
    const lastShown = localStorage.getItem('donotcall-popup-shown');
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    if (lastShown && Date.now() - parseInt(lastShown) < sevenDays) return;

    const timer = setTimeout(() => setShow(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  function handleClose() {
    setShow(false);
    localStorage.setItem('donotcall-popup-shown', Date.now().toString());
  }

  async function handleShare() {
    const text = '📵 Tired of spam calls? Register your number at DoNotCall.gov — within 31 days telemarketers are legally required to stop calling you. It\'s a free official service by the FTC. 👉 https://www.donotcall.gov/';
    if (navigator.share) {
      try { await navigator.share({ title: 'Do Not Call Registry', text }); } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      {/* Backdrop */}
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        onClick={handleClose}
      />

      {/* Card */}
      <div style={{
        position: 'relative', width: '100%', maxWidth: 480,
        background: '#fff', borderRadius: 20, overflow: 'hidden',
        boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
        animation: 'popupSlideUp 0.4s ease-out',
      }}>
        {/* Top accent */}
        <div style={{
          background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)',
          padding: '24px 24px 20px', textAlign: 'center', position: 'relative',
        }}>
          <button
            onClick={handleClose}
            style={{
              position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.2)',
              border: 'none', borderRadius: '50%', width: 32, height: 32,
              cursor: 'pointer', color: '#fff', fontSize: 18, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            ✕
          </button>
          <div style={{ fontSize: 48, marginBottom: 8 }}>📵</div>
          <h2 style={{
            color: '#fff', fontSize: 22, fontWeight: 800, margin: 0, lineHeight: 1.2,
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}>
            Tired of SCAMMERS<br />and Spam Calls?
          </h2>
        </div>

        {/* Content */}
        <div style={{ padding: '20px 24px 24px' }}>
          <p style={{
            fontSize: 15, lineHeight: 1.6, color: '#374151', margin: '0 0 16px',
            fontFamily: 'system-ui, sans-serif',
          }}>
            The <strong style={{ color: '#111' }}>Do Not Call Registry</strong> is an{' '}
            <strong>official free service</strong> by the Federal Trade Commission (FTC).
            Register your phone number, and within <strong>31 days</strong> telemarketers are{' '}
            <strong>legally required</strong> to stop calling you.
          </p>

          {/* Trust badges */}
          <div style={{
            display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap',
          }}>
            {[
              { icon: '🏛️', text: 'U.S. Government' },
              { icon: '🆓', text: '100% Free' },
              { icon: '🔒', text: 'Safe & Legal' },
              { icon: '⏱️', text: 'Results in 31 Days' },
            ].map((badge, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '4px 10px', background: '#f0fdf4', borderRadius: 8,
                fontSize: 12, color: '#166534', fontWeight: 500,
                border: '1px solid #bbf7d0',
              }}>
                <span>{badge.icon}</span>
                <span>{badge.text}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <a
            href="https://www.donotcall.gov/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block', width: '100%', padding: '14px 20px',
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
              color: '#fff', border: 'none', borderRadius: 12,
              fontSize: 16, fontWeight: 700, textAlign: 'center',
              textDecoration: 'none', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(22,163,74,0.3)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            🛡️ Register Your Number at DoNotCall.gov
          </a>

          {/* Share */}
          <button
            onClick={handleShare}
            style={{
              display: 'block', width: '100%', padding: '12px 20px', marginTop: 10,
              background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb',
              borderRadius: 12, fontSize: 14, fontWeight: 600,
              cursor: 'pointer', textAlign: 'center',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#e5e7eb'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#f3f4f6'; }}
          >
            {copied ? '✅ Link Copied!' : '📤 Share with Friends'}
          </button>

          {/* Disclaimer */}
          <p style={{
            fontSize: 11, color: '#9ca3af', textAlign: 'center', margin: '12px 0 0',
            lineHeight: 1.4,
          }}>
            This service does not block calls from charities, political campaigns,
            or surveys. You can also file complaints about illegal robocalls on the same website.
          </p>
        </div>

        <style>{`
          @keyframes popupSlideUp {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
}
