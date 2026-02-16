'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EmergencyBar from '@/components/EmergencyBar';
import Link from 'next/link';

export default function LotteryJoinPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  const [numberChoice, setNumberChoice] = useState<'pick_for_me' | 'my_numbers'>('pick_for_me');

  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    userNumbers: '',
    referralCode: '',
  });

  // Result data
  const [resultData, setResultData] = useState({
    referralCode: '',
    poolWeekEnd: '',
  });

  // Time left
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Check for referral code in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      setFormData(prev => ({ ...prev, referralCode: ref }));
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      // Use America/New_York to handle EST/EDT automatically
      const estStr = now.toLocaleString('en-US', { timeZone: 'America/New_York' });
      const estTime = new Date(estStr);

      let nextThursday = new Date(estStr);
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

  // Load Square Web SDK
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://web.squarecdn.com/v1/square.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      setError('Please agree to the Terms & Conditions');
      return;
    }
    if (!formData.firstName || !formData.lastName || !formData.email) {
      setError('Please fill in all required fields');
      return;
    }
    setError('');
    setStep(2);
    initializeSquare();
  };

  const initializeSquare = async () => {
    try {
      // @ts-ignore
      if (!window.Square) {
        setTimeout(initializeSquare, 500);
        return;
      }

      // @ts-ignore
      const payments = window.Square.payments(
        process.env.NEXT_PUBLIC_SQUARE_APP_ID,
        process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID
      );

      const card = await payments.card();
      await card.attach('#card-container');

      // @ts-ignore
      window.squareCard = card;
    } catch (e) {
      console.error('Square init error:', e);
      setError('Failed to initialize payment. Please refresh the page.');
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      // @ts-ignore
      const card = window.squareCard;
      if (!card) {
        throw new Error('Payment not initialized. Please refresh the page.');
      }

      const result = await card.tokenize();
      if (result.status !== 'OK') {
        throw new Error(result.errors?.[0]?.message || 'Card validation failed');
      }

      // Send to our API
      const response = await fetch('/api/lottery/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId: result.token,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          userNumbers: numberChoice === 'pick_for_me' ? 'PICK_FOR_ME' : formData.userNumbers,
          referralCode: formData.referralCode,
        }),
      });

      // Handle response safely
      let data;
      const text = await response.text();
      try {
        data = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.error('Response parse error:', text);
        throw new Error('Server error. Please try again.');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Payment failed');
      }

      setResultData({
        referralCode: data.user?.referralCode || '',
        poolWeekEnd: data.entry?.poolWeekEnd || '',
      });
      
      // Save email to localStorage for dashboard access
      localStorage.setItem('lottery_email', formData.email.toLowerCase());
      localStorage.setItem('lottery_paid_week', data.entry?.poolWeekEnd || '');
      
      setSuccess(true);

    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '1rem',
    fontSize: '1.1rem',
    borderRadius: '12px',
    border: '2px solid #e5e7eb',
    marginBottom: '1rem',
    boxSizing: 'border-box' as const,
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '600' as const,
    color: '#1e3a5f',
    fontSize: '1.1rem',
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a' }}>
        <EmergencyBar />
        <Header user={null} onLogout={() => {}} />
        
        <main style={{ maxWidth: '600px', margin: '0 auto', padding: '3rem 1rem' }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '3rem',
            textAlign: 'center',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🎉</div>
            <h1 style={{ color: '#22c55e', fontSize: '2rem', marginBottom: '1rem' }}>
              You're In!
            </h1>
            <p style={{ color: '#666', fontSize: '1.2rem', marginBottom: '2rem' }}>
              You have successfully joined this week's lottery pool!
            </p>

            <div style={{
              background: '#f0fdf4',
              border: '2px solid #86efac',
              borderRadius: '16px',
              padding: '1.5rem',
              marginBottom: '2rem'
            }}>
              <p style={{ color: '#166534', fontSize: '1.1rem', margin: 0 }}>
                📧 Confirmation email sent to <strong>{formData.email}</strong>
              </p>
              <p style={{ color: '#166534', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                Check your <strong>SPAM folder</strong> if you don't see it!
              </p>
            </div>

            <div style={{
              background: '#fef3c7',
              border: '2px solid #fcd34d',
              borderRadius: '16px',
              padding: '1.5rem',
              marginBottom: '2rem'
            }}>
              <h3 style={{ color: '#92400e', margin: '0 0 1rem 0' }}>
                🎁 Invite Friends, Get $1 Off!
              </h3>
              <p style={{ color: '#78350f', fontSize: '1rem', marginBottom: '1rem' }}>
                Share your referral link:
              </p>
              <div style={{
                background: 'white',
                padding: '1rem',
                borderRadius: '8px',
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                wordBreak: 'break-all'
              }}>
                {`https://crownheightsgroups.com/lottery/join?ref=${resultData.referralCode}`}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `https://crownheightsgroups.com/lottery/join?ref=${resultData.referralCode}`
                  );
                  alert('Link copied!');
                }}
                style={{
                  marginTop: '1rem',
                  padding: '0.75rem 1.5rem',
                  background: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                📋 Copy Link
              </button>
            </div>

            {/* Share buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  const text = `Join our lottery pool! 🎰 Only $3/week for Mega Millions + Powerball. Join here: https://crownheightsgroups.com/lottery/join${resultData.referralCode ? `?ref=${resultData.referralCode}` : ''}`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                }}
                style={{ padding: '0.75rem 1.5rem', background: '#25D366', color: 'white', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}
              >
                📱 Share on WhatsApp
              </button>
              <button
                onClick={() => {
                  const text = `Join our lottery pool! 🎰 Only $3/week for Mega Millions + Powerball.\nhttps://crownheightsgroups.com/lottery/join${resultData.referralCode ? `?ref=${resultData.referralCode}` : ''}`;
                  navigator.clipboard.writeText(text);
                  alert('Message copied! Paste it anywhere.');
                }}
                style={{ padding: '0.75rem 1.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}
              >
                📋 Copy Share Message
              </button>
            </div>

            <Link href="/lottery/dashboard" style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              textDecoration: 'none'
            }}>
              View Pool Dashboard →
            </Link>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a' }}>
      <EmergencyBar />
      <Header user={null} onLogout={() => {}} />
      
      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem 1rem' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#ffd700', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            🎟️ Join This Week's Pool
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
            Registration closes in: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
          </p>
        </div>

        {/* Progress Steps */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: step >= 1 ? '#ffd700' : '#334155',
            color: step >= 1 ? '#1e3a5f' : '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold'
          }}>1</div>
          <div style={{
            width: '60px',
            height: '4px',
            background: step >= 2 ? '#ffd700' : '#334155',
            alignSelf: 'center'
          }} />
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: step >= 2 ? '#ffd700' : '#334155',
            color: step >= 2 ? '#1e3a5f' : '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold'
          }}>2</div>
        </div>

        {/* Form Card */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '2rem',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
        }}>

          {step === 1 && (
            <form onSubmit={handleStep1Submit}>
              <h2 style={{ color: '#1e3a5f', marginBottom: '1.5rem', textAlign: 'center' }}>
                Step 1: Your Information
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    style={inputStyle}
                    placeholder="John"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    style={inputStyle}
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  style={inputStyle}
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label style={labelStyle}>Phone (optional)</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  style={inputStyle}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label style={labelStyle}>Lottery Numbers</label>
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => { setNumberChoice('pick_for_me'); setFormData(prev => ({ ...prev, userNumbers: '' })); }}
                    style={{
                      flex: 1,
                      padding: '1rem',
                      borderRadius: '12px',
                      border: `2px solid ${numberChoice === 'pick_for_me' ? '#22c55e' : '#e5e7eb'}`,
                      background: numberChoice === 'pick_for_me' ? '#f0fdf4' : 'white',
                      cursor: 'pointer',
                      textAlign: 'center',
                      fontSize: '1rem',
                      fontWeight: numberChoice === 'pick_for_me' ? '700' : '500',
                      color: numberChoice === 'pick_for_me' ? '#166534' : '#666',
                    }}
                  >
                    🎯 Pick for me
                    <div style={{ fontSize: '0.8rem', fontWeight: '400', marginTop: '4px', color: '#666' }}>
                      We'll choose the best numbers
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNumberChoice('my_numbers')}
                    style={{
                      flex: 1,
                      padding: '1rem',
                      borderRadius: '12px',
                      border: `2px solid ${numberChoice === 'my_numbers' ? '#3b82f6' : '#e5e7eb'}`,
                      background: numberChoice === 'my_numbers' ? '#eff6ff' : 'white',
                      cursor: 'pointer',
                      textAlign: 'center',
                      fontSize: '1rem',
                      fontWeight: numberChoice === 'my_numbers' ? '700' : '500',
                      color: numberChoice === 'my_numbers' ? '#1d4ed8' : '#666',
                    }}
                  >
                    ✏️ My numbers
                    <div style={{ fontSize: '0.8rem', fontWeight: '400', marginTop: '4px', color: '#666' }}>
                      Enter your lucky numbers
                    </div>
                  </button>
                </div>
                {numberChoice === 'my_numbers' && (
                  <>
                    <textarea
                      name="userNumbers"
                      value={formData.userNumbers}
                      onChange={handleInputChange}
                      style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                      placeholder="e.g., 7, 14, 21, 35, 42 (Mega: 10)"
                    />
                    <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '-0.5rem' }}>
                      Format: 5 numbers (1-70) + Mega Ball (1-25)
                    </p>
                  </>
                )}
                {numberChoice === 'pick_for_me' && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '0.75rem 1rem', color: '#166534', fontSize: '0.95rem' }}>
                    ✅ Our team will select optimized numbers for your ticket. You'll receive all purchased numbers by email.
                  </div>
                )}
              </div>

              <div>
                <label style={labelStyle}>Referral Code (optional)</label>
                <input
                  type="text"
                  name="referralCode"
                  value={formData.referralCode}
                  onChange={handleInputChange}
                  style={inputStyle}
                  placeholder="Enter code if you have one"
                />
              </div>

              {/* Terms Agreement */}
              <div style={{
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    style={{ width: '24px', height: '24px', marginTop: '2px' }}
                  />
                  <span style={{ color: '#333', fontSize: '1rem', lineHeight: '1.5' }}>
                    I have read and agree to the{' '}
                    <Link href="/lottery/terms" target="_blank" style={{ color: '#3b82f6', fontWeight: 'bold' }}>
                      Terms & Conditions
                    </Link>
                    . I understand that lottery is a game of chance with no guaranteed winnings.
                  </span>
                </label>
              </div>

              {error && (
                <div style={{
                  background: '#fef2f2',
                  border: '2px solid #fecaca',
                  borderRadius: '12px',
                  padding: '1rem',
                  marginBottom: '1rem',
                  color: '#dc2626',
                  textAlign: 'center'
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '1.25rem',
                  background: 'linear-gradient(135deg, #ffd700, #f59e0b)',
                  color: '#1e3a5f',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Continue to Payment →
              </button>
            </form>
          )}

          {step === 2 && (
            <div>
              <h2 style={{ color: '#1e3a5f', marginBottom: '1.5rem', textAlign: 'center' }}>
                Step 2: Payment - $3.00
              </h2>

              <div style={{
                background: '#f0f9ff',
                border: '2px solid #bae6fd',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <p style={{ color: '#0369a1', margin: 0, fontSize: '1rem' }}>
                  <strong>{formData.firstName} {formData.lastName}</strong><br/>
                  {formData.email}
                </p>
              </div>

              <div style={{
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '1.2rem'
                }}>
                  <span>Pool Entry Fee:</span>
                  <strong>$3.00</strong>
                </div>
              </div>

              <label style={labelStyle}>Card Details</label>
              <div 
                id="card-container" 
                style={{
                  minHeight: '100px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '1rem',
                  marginBottom: '1.5rem'
                }}
              />

              {error && (
                <div style={{
                  background: '#fef2f2',
                  border: '2px solid #fecaca',
                  borderRadius: '12px',
                  padding: '1rem',
                  marginBottom: '1rem',
                  color: '#dc2626',
                  textAlign: 'center'
                }}>
                  {error}
                </div>
              )}

              <button
                onClick={handlePayment}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '1.25rem',
                  background: loading ? '#9ca3af' : 'linear-gradient(135deg, #22c55e, #16a34a)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                  cursor: loading ? 'wait' : 'pointer',
                  marginBottom: '1rem'
                }}
              >
                {loading ? '⏳ Processing...' : '🔒 Pay $3.00 Securely'}
              </button>

              <button
                onClick={() => setStep(1)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: 'transparent',
                  color: '#666',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                ← Back to Edit Info
              </button>

              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <img 
                  src="https://cdn.brandfolder.io/KGT2DTA4/at/8vbr8k4mr5xjwk4hxq4t9vs/Square_Logotype_Black.png" 
                  alt="Powered by Square" 
                  style={{ height: '24px', opacity: 0.6 }}
                />
              </div>
            </div>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link href="/lottery" style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
            ← Back to Lottery Info
          </Link>
        </p>
      </main>
      
      <Footer />
    </div>
  );
}
