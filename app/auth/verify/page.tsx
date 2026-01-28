'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function VerifyPage() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    const pendingEmail = sessionStorage.getItem('pendingVerification');
    if (pendingEmail) {
      setEmail(pendingEmail);
    } else {
      window.location.href = '/auth/register';
    }
    
    inputRefs[0].current?.focus();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleInput = (index: number, value: string) => {
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');
    
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
    
    if (index === 5 && value) {
      const fullCode = newCode.join('');
      if (fullCode.length === 6) {
        handleVerify(fullCode);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const newCode = pastedData.split('');
      setCode(newCode);
      inputRefs[5].current?.focus();
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (verificationCode: string) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }
      
      setSuccess(true);
      
      localStorage.setItem('session_token', data.token);
      localStorage.setItem('user_name', data.user.name);
      localStorage.setItem('user_email', data.user.email);
      localStorage.setItem('user_role', data.user.role);
      
      sessionStorage.removeItem('pendingVerification');
      
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Verification failed');
      setCode(['', '', '', '', '', '']);
      inputRefs[0].current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    
    setResending(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend code');
      }
      
      setCountdown(60);
    } catch (err: any) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  const handleManualSubmit = () => {
    const fullCode = code.join('');
    if (fullCode.length === 6) {
      handleVerify(fullCode);
    } else {
      setError('Please enter the complete 6-digit code');
    }
  };

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)',
    padding: '1rem',
  };

  const cardStyle: React.CSSProperties = {
    background: 'white',
    borderRadius: '16px',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    textAlign: 'center',
  };

  const inputStyle: React.CSSProperties = {
    width: '48px',
    height: '56px',
    textAlign: 'center',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    border: '2px solid #ddd',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    padding: '1rem',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading || code.join('').length !== 6 ? 0.7 : 1,
    marginTop: '1.5rem',
  };

  if (success) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
          <h1 style={{ color: '#1e3a5f', marginBottom: '0.5rem' }}>Email Verified!</h1>
          <p style={{ color: '#666' }}>
            Your account has been verified successfully.<br />
            Redirecting you to the catalog...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✉️</div>
        <h1 style={{ color: '#1e3a5f', marginBottom: '0.5rem', fontSize: '1.5rem' }}>
          Check Your Email
        </h1>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          We sent a verification code to<br />
          <strong style={{ color: '#1e3a5f' }}>{email}</strong>
        </p>
        
        {error && (
          <div style={{ 
            background: '#fee2e2', 
            color: '#dc2626', 
            padding: '0.75rem', 
            borderRadius: '8px', 
            marginBottom: '1rem' 
          }}>
            {error}
          </div>
        )}
        
        <p style={{ color: '#333', marginBottom: '0.75rem', fontWeight: '500' }}>
          Enter the 6-digit code:
        </p>
        
        <div 
          style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '0.5rem' }}
          onPaste={handlePaste}
        >
          {[0, 1, 2, 3, 4, 5].map(index => (
            <input
              key={index}
              ref={inputRefs[index]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              style={{
                ...inputStyle,
                borderColor: code[index] ? '#10b981' : '#ddd',
              }}
              value={code[index]}
              onChange={(e) => handleInput(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              disabled={loading}
            />
          ))}
        </div>
        
        <button 
          style={buttonStyle}
          onClick={handleManualSubmit}
          disabled={loading || code.join('').length !== 6}
        >
          {loading ? 'Verifying...' : 'Verify Email'}
        </button>
        
        <div style={{ marginTop: '1.5rem' }}>
          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            Didn't receive the code?
          </p>
          <button 
            onClick={handleResend}
            disabled={resending || countdown > 0}
            style={{
              background: 'none',
              border: '1px solid #ddd',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              color: countdown > 0 ? '#999' : '#2563eb',
              cursor: countdown > 0 ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem',
            }}
          >
            {resending ? 'Sending...' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
          </button>
        </div>
        
        <div style={{ marginTop: '1.5rem' }}>
          <Link href="/auth/register" style={{ color: '#2563eb', textDecoration: 'none', fontSize: '0.9rem' }}>
            ← Back to Registration
          </Link>
        </div>
      </div>
    </div>
  );
}
