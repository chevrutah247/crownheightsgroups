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

// ===== SHIDDUCH BANNER (for /kallah) — Gold & Confetti =====
export function ShidduchBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1a1206 0%, #2d1f0e 40%, #1a1206 100%)',
      borderRadius: 20, padding: '32px 24px', marginBottom: 24, position: 'relative',
      border: '2px solid rgba(212,168,83,0.3)', overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(212,168,83,0.15)',
    }}>
      {/* Confetti / sparkle particles */}
      <style>{`
        @keyframes shidduchFloat { 0%{transform:translateY(0) rotate(0deg);opacity:1} 100%{transform:translateY(-60px) rotate(360deg);opacity:0} }
        @keyframes shidduchShimmer { 0%,100%{opacity:0.3} 50%{opacity:0.8} }
        @keyframes shidduchPulse { 0%,100%{box-shadow:0 0 20px rgba(212,168,83,0.3)} 50%{box-shadow:0 0 40px rgba(212,168,83,0.6)} }
        .confetti-dot { position:absolute; width:6px; height:6px; border-radius:50%; animation: shidduchFloat 3s ease-in infinite; }
        .shimmer-line { position:absolute; width:1px; height:30px; background:linear-gradient(180deg,transparent,rgba(212,168,83,0.4),transparent); animation: shidduchShimmer 2s ease-in-out infinite; }
      `}</style>
      {/* Decorative confetti dots */}
      {[
        { left:'5%',top:'10%',bg:'#d4a853',delay:'0s',dur:'2.5s' },
        { left:'15%',top:'5%',bg:'#e8c97a',delay:'0.5s',dur:'3s' },
        { left:'85%',top:'8%',bg:'#d4a853',delay:'1s',dur:'2.8s' },
        { left:'90%',top:'20%',bg:'#f5edd8',delay:'0.3s',dur:'3.2s' },
        { left:'30%',top:'3%',bg:'#e8b860',delay:'1.5s',dur:'2.6s' },
        { left:'70%',top:'12%',bg:'#d4a853',delay:'0.8s',dur:'3s' },
        { left:'50%',top:'2%',bg:'#f5edd8',delay:'2s',dur:'2.4s' },
        { left:'95%',top:'40%',bg:'#e8c97a',delay:'0.2s',dur:'3.5s' },
      ].map((c,i) => (
        <div key={i} className="confetti-dot" style={{ left:c.left, top:c.top, background:c.bg, animationDelay:c.delay, animationDuration:c.dur }} />
      ))}
      {/* Shimmer lines */}
      {[
        { left:'10%',top:'0',delay:'0s' },
        { left:'25%',top:'5%',delay:'1s' },
        { left:'75%',top:'0',delay:'0.5s' },
        { left:'60%',top:'8%',delay:'1.5s' },
      ].map((s,i) => (
        <div key={i} className="shimmer-line" style={{ left:s.left, top:s.top, animationDelay:s.delay }} />
      ))}

      {/* Ambient glow */}
      <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle, rgba(212,168,83,0.08) 0%, transparent 70%)', pointerEvents:'none' }} />

      <button onClick={() => setDismissed(true)} style={{
        position: 'absolute', top: 12, right: 14, background: 'rgba(212,168,83,0.15)',
        border: '1px solid rgba(212,168,83,0.2)', borderRadius: '50%', width: 30, height: 30, cursor: 'pointer',
        color: 'rgba(212,168,83,0.6)', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2,
      }}>✕</button>

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 16, position: 'relative', zIndex: 1 }}>
        <img src="/images/getashidduch-logo.png" alt="GetAShidduch" style={{ height: 56, margin: '0 auto', filter: 'brightness(1.2)' }} />
      </div>

      {/* Main CTA */}
      <div style={{ textAlign: 'center', marginBottom: 24, position: 'relative', zIndex: 1 }}>
        <h3 style={{
          background: 'linear-gradient(135deg, #d4a853, #e8c97a, #f5edd8, #e8c97a, #d4a853)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          fontSize: 28, fontWeight: 800, margin: '0 0 10px', lineHeight: 1.2,
          fontFamily: 'Georgia, serif',
        }}>
          Ready for Your Shidduch?
        </h3>
        <p style={{ color: 'rgba(245,237,216,0.6)', fontSize: 15, lineHeight: 1.6, maxWidth: 480, margin: '0 auto 20px' }}>
          <strong style={{ color: '#e8c97a' }}>GetAShidduch.org</strong> — a free Jewish matchmaking platform
          with smart compatibility matching. Join hundreds of Jewish singles worldwide.
        </p>
        <a href="https://www.getashidduch.org/en/get-a-shidduch" target="_blank" rel="noopener noreferrer" style={{
          display: 'inline-block', padding: '14px 36px', borderRadius: 14,
          background: 'linear-gradient(135deg, #d4a853, #e8c97a)', color: '#1a1206',
          fontSize: 17, fontWeight: 800, textDecoration: 'none', letterSpacing: 0.5,
          boxShadow: '0 4px 20px rgba(212,168,83,0.4)',
          animation: 'shidduchPulse 2s ease-in-out infinite',
        }}>
          ✨ Find Your Match — It&apos;s Free ✨
        </a>
      </div>

      {/* Two cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, position: 'relative', zIndex: 1 }}>
        <a href="https://www.getashidduch.org/en/stories" target="_blank" rel="noopener noreferrer" style={{
          display: 'block', padding: '18px', borderRadius: 14,
          background: 'rgba(212,168,83,0.06)', border: '1px solid rgba(212,168,83,0.15)',
          textDecoration: 'none', textAlign: 'center',
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>💍</div>
          <div style={{ color: '#e8c97a', fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
            Share Your Story
          </div>
          <div style={{ color: 'rgba(245,237,216,0.45)', fontSize: 12, lineHeight: 1.5 }}>
            Found your match? Inspire others! Your story could help someone find theirs.
          </div>
        </a>

        <a href="https://www.getashidduch.org/en/report" target="_blank" rel="noopener noreferrer" style={{
          display: 'block', padding: '18px', borderRadius: 14,
          background: 'rgba(212,168,83,0.06)', border: '1px solid rgba(212,168,83,0.15)',
          textDecoration: 'none', textAlign: 'center',
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🛡️</div>
          <div style={{ color: '#e8c97a', fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
            Protect the Community
          </div>
          <div style={{ color: 'rgba(245,237,216,0.45)', fontSize: 12, lineHeight: 1.5 }}>
            Know someone problematic? Report confidentially to keep our community safe.
          </div>
        </a>
      </div>

      <p style={{ color: 'rgba(212,168,83,0.25)', fontSize: 11, textAlign: 'center', marginTop: 16, position: 'relative', zIndex: 1 }}>
        A project of Education On The Go Corp · 501(c)(3) · EIN: 92-1172505
      </p>
    </div>
  );
}
