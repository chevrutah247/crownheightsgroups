'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EmergencyBar from '@/components/EmergencyBar';

export default function LotteryPage() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Countdown to Thursday 10 PM EST
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const estOffset = -5 * 60; // EST is UTC-5
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const estTime = new Date(utc + (estOffset * 60000));
      
      // Find next Thursday 10 PM
      let nextThursday = new Date(estTime);
      nextThursday.setHours(22, 0, 0, 0);
      
      const daysUntilThursday = (4 - estTime.getDay() + 7) % 7;
      if (daysUntilThursday === 0 && estTime.getHours() >= 22) {
        nextThursday.setDate(nextThursday.getDate() + 7);
      } else {
        nextThursday.setDate(nextThursday.getDate() + daysUntilThursday);
      }
      
      const diff = nextThursday.getTime() - estTime.getTime();
      
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  const timerBoxStyle = {
    background: 'rgba(255, 215, 0, 0.1)',
    border: '2px solid rgba(255, 215, 0, 0.3)',
    borderRadius: '12px',
    padding: '1rem 1.5rem',
    textAlign: 'center' as const,
    minWidth: '80px'
  };

  const timerNumberStyle = {
    fontSize: '2.5rem',
    fontWeight: 'bold' as const,
    color: '#ffd700',
    lineHeight: 1
  };

  const timerLabelStyle = {
    fontSize: '0.75rem',
    color: '#94a3b8',
    textTransform: 'uppercase' as const,
    marginTop: '0.25rem'
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)' }}>
      <EmergencyBar />
      <Header user={null} onLogout={() => {}} />
      
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
        
        {/* Hero Section */}
        <section style={{ textAlign: 'center', marginBottom: '3rem' }}>
          
          {/* Lottery Logos */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: '1rem', 
            marginBottom: '1.5rem',
            flexWrap: 'wrap'
          }}>
            <span style={{ 
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', 
              color: '#1a1a2e', 
              padding: '0.75rem 1.5rem', 
              borderRadius: '10px', 
              fontWeight: 'bold', 
              fontSize: '1.1rem',
              fontStyle: 'italic',
              letterSpacing: '1px',
              boxShadow: '0 4px 12px rgba(255,215,0,0.4)'
            }}>MEGA MILLIONS</span>
            <span style={{ color: '#ffd700', fontSize: '2rem', fontWeight: 'bold' }}>+</span>
            <span style={{ 
              background: 'linear-gradient(135deg, #E31837 0%, #C41230 100%)', 
              color: 'white', 
              padding: '0.75rem 1.5rem', 
              borderRadius: '10px', 
              fontWeight: 'bold', 
              fontSize: '1.1rem',
              fontStyle: 'italic',
              letterSpacing: '1px',
              boxShadow: '0 4px 12px rgba(227,24,55,0.4)'
            }}>POWERBALL</span>
          </div>

          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #ffd700, #f59e0b)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1rem'
          }}>
            WIN TOGETHER
          </h1>
          
          <p style={{ color: '#94a3b8', fontSize: '1.25rem', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
            Join our community lottery pool. More tickets, better odds, shared winnings!
          </p>

          {/* Price Badge */}
          <div style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            borderRadius: '50px',
            padding: '1rem 2.5rem',
            marginBottom: '2rem'
          }}>
            <span style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>Only $3 / week</span>
          </div>

          {/* Countdown Timer */}
          <div style={{ marginBottom: '2rem' }}>
            <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>⏰ Registration closes in:</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={timerBoxStyle}>
                <div style={timerNumberStyle}>{String(timeLeft.days).padStart(2, '0')}</div>
                <div style={timerLabelStyle}>Days</div>
              </div>
              <div style={timerBoxStyle}>
                <div style={timerNumberStyle}>{String(timeLeft.hours).padStart(2, '0')}</div>
                <div style={timerLabelStyle}>Hours</div>
              </div>
              <div style={timerBoxStyle}>
                <div style={timerNumberStyle}>{String(timeLeft.minutes).padStart(2, '0')}</div>
                <div style={timerLabelStyle}>Minutes</div>
              </div>
              <div style={timerBoxStyle}>
                <div style={timerNumberStyle}>{String(timeLeft.seconds).padStart(2, '0')}</div>
                <div style={timerLabelStyle}>Seconds</div>
              </div>
            </div>
          </div>

          {/* Hidden participants - only visible after joining */}
          <div style={{
            background: 'rgba(255, 215, 0, 0.1)',
            border: '2px solid rgba(255, 215, 0, 0.3)',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '2rem',
            maxWidth: '400px',
            margin: '0 auto 2rem auto'
          }}>
            <p style={{ color: '#ffd700', fontSize: '1.2rem', margin: 0 }}>
              🔒 <strong>Join to see</strong> current participants
            </p>
            <p style={{ color: '#94a3b8', fontSize: '1rem', margin: '0.5rem 0 0 0' }}>
              Pool info visible after payment
            </p>
          </div>

          {/* CTA Button */}
          <Link href="/lottery/join" style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #ffd700, #f59e0b)',
            color: '#1e3a5f',
            padding: '1.25rem 3rem',
            borderRadius: '50px',
            fontSize: '1.3rem',
            fontWeight: 'bold',
            textDecoration: 'none',
            boxShadow: '0 4px 20px rgba(255, 215, 0, 0.3)',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}>
            🎟️ JOIN THIS WEEK'S POOL
          </Link>
        </section>

        {/* How It Works */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ color: 'white', textAlign: 'center', marginBottom: '2rem', fontSize: '1.75rem' }}>
            How It Works
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {[
              { step: '1', icon: '📝', title: 'Register & Pay $3', desc: 'Sign up and make your weekly contribution via secure payment' },
              { step: '2', icon: '🎫', title: 'We Buy Numbers', desc: 'Every Friday we purchase Mega Millions & Powerball entries for the pool' },
              { step: '3', icon: '💰', title: 'Share Winnings', desc: 'Any winnings are split equally among all participants' }
            ].map(item => (
              <div key={item.step} style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                padding: '2rem',
                textAlign: 'center',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #ffd700, #f59e0b)',
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#1e3a5f'
                }}>
                  {item.step}
                </div>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{item.icon}</div>
                <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>{item.title}</h3>
                <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ color: 'white', textAlign: 'center', marginBottom: '2rem', fontSize: '1.75rem' }}>
            Why Join Our Pool?
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {[
              { icon: '📈', title: 'Better Odds', desc: 'More tickets = more chances to win' },
              { icon: '💵', title: 'Affordable', desc: 'Just $3 per week' },
              { icon: '👥', title: 'Community', desc: 'Win together with neighbors' },
              { icon: '📸', title: 'Transparent', desc: 'All numbers emailed to you' },
              { icon: '🔒', title: 'Secure', desc: 'Payments via Square' },
              { icon: '📜', title: 'Legal', desc: 'Official LLC, clear terms' }
            ].map(item => (
              <div key={item.title} style={{
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '12px',
                padding: '1.25rem',
                textAlign: 'center',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{item.icon}</div>
                <h4 style={{ color: '#ffd700', margin: '0 0 0.25rem 0', fontSize: '1rem' }}>{item.title}</h4>
                <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.85rem' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Referral Section */}
        <section style={{
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(22, 163, 74, 0.2))',
          borderRadius: '20px',
          padding: '2rem',
          textAlign: 'center',
          marginBottom: '3rem',
          border: '2px solid rgba(34, 197, 94, 0.3)'
        }}>
          <h3 style={{ color: '#22c55e', marginBottom: '1rem', fontSize: '1.5rem' }}>
            🎁 Invite Friends, Get $1 Off!
          </h3>
          <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
            Share your referral link after joining. For each friend who joins, you get $1 credit toward next week's entry!
          </p>
          <Link href="/lottery/join" style={{
            display: 'inline-block',
            background: '#22c55e',
            color: 'white',
            padding: '0.75rem 2rem',
            borderRadius: '25px',
            textDecoration: 'none',
            fontWeight: 'bold'
          }}>
            Join to Get Your Referral Link
          </Link>
        </section>

        {/* FAQ */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ color: 'white', textAlign: 'center', marginBottom: '2rem', fontSize: '1.75rem' }}>
            Frequently Asked Questions
          </h2>
          
          {[
            { q: 'What lotteries do we play?', a: 'We play both Mega Millions (Tuesday & Friday drawings) and Powerball (Monday, Wednesday & Saturday drawings).' },
            { q: 'How are winnings distributed?', a: 'All winnings are split equally among participants. Under $50 goes back into tickets. Larger amounts are distributed within 14-30 days.' },
            { q: 'When do I need to join by?', a: 'Registration closes every Thursday at 10:00 PM EST. Tickets are purchased Friday morning.' },
            { q: 'How will I know the numbers?', a: "After entries are purchased, you'll receive an email with all the numbers we're playing that week." },
            { q: 'Is this legal?', a: 'Yes! Lottery pools are legal. We operate as Medinat Hesed LLC with clear terms and conditions.' },
            { q: 'What payment methods are accepted?', a: 'We accept all major credit/debit cards through Square secure payment.' }
          ].map((item, i) => (
            <div key={i} style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '12px',
              padding: '1.25rem',
              marginBottom: '0.75rem',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <h4 style={{ color: '#ffd700', margin: '0 0 0.5rem 0' }}>{item.q}</h4>
              <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>{item.a}</p>
            </div>
          ))}
        </section>

        {/* Terms Link */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/lottery/terms" style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            📜 Read Full Terms & Conditions
          </Link>
        </div>

        {/* Final CTA */}
        <section style={{ textAlign: 'center', paddingBottom: '2rem' }}>
          <Link href="/lottery/join" style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #ffd700, #f59e0b)',
            color: '#1e3a5f',
            padding: '1.25rem 3rem',
            borderRadius: '50px',
            fontSize: '1.3rem',
            fontWeight: 'bold',
            textDecoration: 'none',
            boxShadow: '0 4px 20px rgba(255, 215, 0, 0.3)'
          }}>
            🎟️ JOIN NOW - Only $3
          </Link>
        </section>

      </main>
      
      <Footer />
    </div>
  );
}
