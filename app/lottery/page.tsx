'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EmergencyBar from '@/components/EmergencyBar';
import Link from 'next/link';

export default function LotteryPage() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [participantsCount, setParticipantsCount] = useState(0);

  // Calculate time until Thursday 10:00 PM EST
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const estOffset = -5 * 60; // EST offset in minutes
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const estTime = new Date(utc + (estOffset * 60000));
      
      // Find next Thursday 10:00 PM EST
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

  // Fetch participants count
  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const res = await fetch('/api/lottery/current-pool');
        const data = await res.json();
        if (data.count) setParticipantsCount(data.count);
      } catch (error) {
        console.error('Failed to fetch participants:', error);
      }
    };
    fetchParticipants();
    const interval = setInterval(fetchParticipants, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div style={{
      background: 'linear-gradient(135deg, #1e3a5f, #2d4a6f)',
      borderRadius: '16px',
      padding: '1.5rem 2rem',
      textAlign: 'center',
      minWidth: '100px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
    }}>
      <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#ffd700' }}>
        {value.toString().padStart(2, '0')}
      </div>
      <div style={{ fontSize: '1rem', color: '#94a3b8', textTransform: 'uppercase' }}>
        {label}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a' }}>
      <EmergencyBar />
      <Header user={null} onLogout={() => {}} />
      
      <main>
        {/* Hero Section */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 50%, #1e1b4b 100%)',
          padding: '4rem 1rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background decorations */}
          <div style={{
            position: 'absolute',
            top: '10%',
            left: '5%',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ffd700, #f59e0b)',
            opacity: 0.3,
            filter: 'blur(20px)'
          }} />
          <div style={{
            position: 'absolute',
            bottom: '20%',
            right: '10%',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            opacity: 0.2,
            filter: 'blur(30px)'
          }} />

          <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
            {/* Main Headline */}
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '4rem' }}>🎰</span>
            </div>
            <h1 style={{
              fontSize: '3.5rem',
              fontWeight: 'bold',
              color: '#ffd700',
              marginBottom: '1rem',
              textShadow: '0 4px 20px rgba(255, 215, 0, 0.3)'
            }}>
              WIN TOGETHER
            </h1>
            <p style={{
              fontSize: '1.5rem',
              color: '#e2e8f0',
              marginBottom: '2rem',
              maxWidth: '600px',
              margin: '0 auto 2rem auto'
            }}>
              Join our community lottery pool. More tickets, better odds, shared winnings!
            </p>

            {/* Price Badge */}
            <div style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              padding: '1rem 2rem',
              borderRadius: '50px',
              marginBottom: '3rem'
            }}>
              <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>
                Only $3 / week
              </span>
            </div>

            {/* Countdown Timer */}
            <div style={{ marginBottom: '2rem' }}>
              <p style={{ color: '#94a3b8', fontSize: '1.2rem', marginBottom: '1rem' }}>
                ⏰ Registration closes in:
              </p>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '1rem',
                flexWrap: 'wrap'
              }}>
                <TimeBlock value={timeLeft.days} label="Days" />
                <TimeBlock value={timeLeft.hours} label="Hours" />
                <TimeBlock value={timeLeft.minutes} label="Minutes" />
                <TimeBlock value={timeLeft.seconds} label="Seconds" />
              </div>
            </div>

            {/* Participants Counter */}
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
                👥 <strong>{participantsCount}</strong> participants this week
              </p>
              <p style={{ color: '#94a3b8', fontSize: '1rem', margin: '0.5rem 0 0 0' }}>
                Pool Total: <strong style={{ color: '#22c55e' }}>${participantsCount * 3}</strong>
              </p>
            </div>

            {/* CTA Button */}
            <Link href="/lottery/join" style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #ffd700, #f59e0b)',
              color: '#1e3a5f',
              padding: '1.5rem 3rem',
              borderRadius: '16px',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              textDecoration: 'none',
              boxShadow: '0 8px 30px rgba(255, 215, 0, 0.4)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}>
              🎟️ JOIN THIS WEEK'S POOL →
            </Link>
          </div>
        </div>

        {/* How It Works Section */}
        <div style={{
          background: '#1e293b',
          padding: '4rem 1rem'
        }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{
              textAlign: 'center',
              fontSize: '2.5rem',
              color: 'white',
              marginBottom: '3rem'
            }}>
              How It Works
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem'
            }}>
              {/* Step 1 */}
              <div style={{
                background: '#0f172a',
                borderRadius: '20px',
                padding: '2rem',
                textAlign: 'center',
                border: '2px solid #334155'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem auto',
                  fontSize: '2.5rem'
                }}>
                  1️⃣
                </div>
                <h3 style={{ color: '#ffd700', fontSize: '1.5rem', marginBottom: '1rem' }}>
                  Register & Pay $3
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: '1.6' }}>
                  Sign up with your name and email. Pay securely via PayPal or Square.
                </p>
              </div>

              {/* Step 2 */}
              <div style={{
                background: '#0f172a',
                borderRadius: '20px',
                padding: '2rem',
                textAlign: 'center',
                border: '2px solid #334155'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem auto',
                  fontSize: '2.5rem'
                }}>
                  2️⃣
                </div>
                <h3 style={{ color: '#ffd700', fontSize: '1.5rem', marginBottom: '1rem' }}>
                  We Buy Tickets
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: '1.6' }}>
                  Every Friday, we purchase Mega Millions & Powerball tickets. You get the numbers via email.
                </p>
              </div>

              {/* Step 3 */}
              <div style={{
                background: '#0f172a',
                borderRadius: '20px',
                padding: '2rem',
                textAlign: 'center',
                border: '2px solid #334155'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem auto',
                  fontSize: '2.5rem'
                }}>
                  3️⃣
                </div>
                <h3 style={{ color: '#ffd700', fontSize: '1.5rem', marginBottom: '1rem' }}>
                  Share Winnings
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: '1.6' }}>
                  Any prize is split equally among all pool members. Fair & transparent!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div style={{
          background: '#0f172a',
          padding: '4rem 1rem'
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{
              textAlign: 'center',
              fontSize: '2.5rem',
              color: 'white',
              marginBottom: '3rem'
            }}>
              Why Join Our Pool?
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {[
                { icon: '🎯', title: 'Better Odds', desc: 'More tickets = more chances to win' },
                { icon: '💰', title: 'Affordable', desc: 'Only $3 per week - skip one coffee!' },
                { icon: '🤝', title: 'Community', desc: 'Win together with your neighbors' },
                { icon: '📧', title: 'Transparent', desc: 'Receive all ticket numbers by email' },
                { icon: '🔒', title: 'Secure', desc: 'Safe payments via PayPal & Square' },
                { icon: '📜', title: 'Legal Agreement', desc: 'Clear terms protect all members' }
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem',
                  background: '#1e293b',
                  padding: '1.5rem 2rem',
                  borderRadius: '16px',
                  border: '1px solid #334155'
                }}>
                  <span style={{ fontSize: '2.5rem' }}>{item.icon}</span>
                  <div>
                    <h3 style={{ color: '#ffd700', fontSize: '1.3rem', margin: '0 0 0.25rem 0' }}>
                      {item.title}
                    </h3>
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem', margin: 0 }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Referral Section */}
        <div style={{
          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
          padding: '3rem 1rem',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2rem', color: 'white', marginBottom: '1rem' }}>
              🎁 Invite Friends, Get $1 Credit!
            </h2>
            <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.9)', marginBottom: '1.5rem' }}>
              Share your referral link. When a friend joins and pays, you get $1 off your next entry!
            </p>
            <Link href="/lottery/join" style={{
              display: 'inline-block',
              background: 'white',
              color: '#16a34a',
              padding: '1rem 2rem',
              borderRadius: '12px',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              textDecoration: 'none'
            }}>
              Join & Get Your Referral Link →
            </Link>
          </div>
        </div>

        {/* FAQ Section */}
        <div style={{
          background: '#1e293b',
          padding: '4rem 1rem'
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{
              textAlign: 'center',
              fontSize: '2.5rem',
              color: 'white',
              marginBottom: '3rem'
            }}>
              Frequently Asked Questions
            </h2>

            {[
              { q: 'What lotteries do you play?', a: 'We participate in Mega Millions and Powerball - the biggest jackpots in America!' },
              { q: 'When do you buy tickets?', a: 'Tickets are purchased every Friday after the pool closes Thursday at 10:00 PM EST.' },
              { q: 'How do I know you bought the tickets?', a: 'All participants receive an email with photos of the purchased tickets and all numbers.' },
              { q: 'What happens if we win?', a: 'Winnings are split equally among all pool members for that week, after applicable taxes.' },
              { q: 'What if we win a small amount?', a: 'Winnings under $50 are reinvested to buy more tickets for the next drawing.' },
              { q: 'Is this legal?', a: 'Yes! Lottery pools are legal in the United States. All participants sign a clear agreement.' }
            ].map((item, i) => (
              <div key={i} style={{
                background: '#0f172a',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '1rem',
                border: '1px solid #334155'
              }}>
                <h3 style={{ color: '#ffd700', fontSize: '1.2rem', margin: '0 0 0.75rem 0' }}>
                  {item.q}
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '1.1rem', margin: 0, lineHeight: '1.6' }}>
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)',
          padding: '4rem 1rem',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '2.5rem', color: '#ffd700', marginBottom: '1rem' }}>
            Ready to Win Together?
          </h2>
          <p style={{ fontSize: '1.3rem', color: '#e2e8f0', marginBottom: '2rem' }}>
            Join this week's pool before Thursday 10:00 PM EST!
          </p>
          <Link href="/lottery/join" style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #ffd700, #f59e0b)',
            color: '#1e3a5f',
            padding: '1.5rem 3rem',
            borderRadius: '16px',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            textDecoration: 'none',
            boxShadow: '0 8px 30px rgba(255, 215, 0, 0.4)'
          }}>
            🎟️ JOIN NOW - $3 →
          </Link>
          <p style={{ marginTop: '1.5rem' }}>
            <Link href="/lottery/terms" style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
              📜 Read Terms & Conditions
            </Link>
          </p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
