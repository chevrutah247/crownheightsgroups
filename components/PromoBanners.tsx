'use client';

import { useState } from 'react';

// ===== LAND DONATION BANNER (for /charity) =====
export function LandDonationBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1a2744 0%, #1f3347 60%, #1a3a4a 100%)',
      borderRadius: 16, padding: '28px 24px', marginBottom: 24, position: 'relative',
      border: '1px solid rgba(200,169,81,0.2)', overflow: 'hidden',
    }}>
      <button onClick={() => setDismissed(true)} style={{
        position: 'absolute', top: 10, right: 12, background: 'rgba(255,255,255,0.1)',
        border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer',
        color: 'rgba(255,255,255,0.5)', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>✕</button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 48, flexShrink: 0 }}>🌲</div>
        <div style={{ flex: 1, minWidth: 250 }}>
          <div style={{
            display: 'inline-block', padding: '3px 10px', borderRadius: 12,
            background: 'rgba(200,169,81,0.15)', color: '#e8b860',
            fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8,
          }}>Tax Deductible Opportunity</div>

          <h3 style={{ color: '#fff', fontSize: 20, fontWeight: 700, margin: '0 0 8px', lineHeight: 1.3 }}>
            Own Unused Land in Upstate New York?
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.6, margin: '0 0 16px' }}>
            Donate your land to <strong style={{ color: '#e8b860' }}>Education On The Go</strong>, a 501(c)(3) nonprofit,
            and receive a <strong style={{ color: '#fff' }}>full tax deduction</strong> on the fair market value.
            Eliminate property taxes, insurance costs, and create a lasting legacy for Jewish education.
          </p>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a href="https://edonthego.org/en/campus" target="_blank" rel="noopener noreferrer" style={{
              display: 'inline-block', padding: '10px 20px', borderRadius: 10,
              background: 'linear-gradient(135deg, #d4a853, #b38728)', color: '#1a1612',
              fontSize: 14, fontWeight: 700, textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(212,168,83,0.3)',
            }}>
              Learn More →
            </a>
            <a href="https://edonthego.org/en/campus/guide" target="_blank" rel="noopener noreferrer" style={{
              display: 'inline-block', padding: '10px 20px', borderRadius: 10,
              border: '1px solid rgba(200,169,81,0.3)', color: '#e8b860',
              fontSize: 14, fontWeight: 600, textDecoration: 'none',
            }}>
              Read Full Guide
            </a>
          </div>

          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 12 }}>
            Education On The Go Corp · 501(c)(3) · EIN: 92-1172505
          </p>
        </div>
      </div>
    </div>
  );
}

// ===== SHIDDUCH BANNER (for /kallah) =====
export function ShidduchBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e3a5f 0%, #1a2744 100%)',
      borderRadius: 16, padding: '24px', marginBottom: 24, position: 'relative',
      border: '1px solid rgba(37,99,235,0.2)',
    }}>
      <button onClick={() => setDismissed(true)} style={{
        position: 'absolute', top: 10, right: 12, background: 'rgba(255,255,255,0.1)',
        border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer',
        color: 'rgba(255,255,255,0.5)', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>✕</button>

      {/* Main Shidduch CTA */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 42, marginBottom: 8 }}>💕</div>
        <h3 style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: '0 0 8px' }}>
          Looking for Your Bashert?
        </h3>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.6, maxWidth: 500, margin: '0 auto 16px' }}>
          <strong style={{ color: '#93c5fd' }}>GetAShidduch.org</strong> — a free Jewish matchmaking platform
          with smart compatibility matching. Join hundreds of Jewish singles worldwide.
        </p>
        <a href="https://www.getashidduch.org/en/get-a-shidduch" target="_blank" rel="noopener noreferrer" style={{
          display: 'inline-block', padding: '12px 28px', borderRadius: 12,
          background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff',
          fontSize: 16, fontWeight: 700, textDecoration: 'none',
          boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
        }}>
          Create Free Profile →
        </a>
      </div>

      {/* Two additional CTAs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* Stories */}
        <a href="https://www.getashidduch.org/en/stories" target="_blank" rel="noopener noreferrer" style={{
          display: 'block', padding: '16px', borderRadius: 12,
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          textDecoration: 'none', textAlign: 'center', transition: 'background 0.2s',
        }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>📖</div>
          <div style={{ color: '#fff', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
            Share Your Story
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, lineHeight: 1.4 }}>
            Inspire others! Tell us how you found your match — your story could help someone find theirs.
          </div>
        </a>

        {/* Report */}
        <a href="https://www.getashidduch.org/en/report" target="_blank" rel="noopener noreferrer" style={{
          display: 'block', padding: '16px', borderRadius: 12,
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          textDecoration: 'none', textAlign: 'center', transition: 'background 0.2s',
        }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>🛡️</div>
          <div style={{ color: '#fff', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
            Protect the Community
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, lineHeight: 1.4 }}>
            Know someone who shouldn't be dating? Report to our confidential blacklist to keep others safe.
          </div>
        </a>
      </div>

      <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, textAlign: 'center', marginTop: 14 }}>
        A project of Education On The Go Corp · 501(c)(3) · EIN: 92-1172505
      </p>
    </div>
  );
}
