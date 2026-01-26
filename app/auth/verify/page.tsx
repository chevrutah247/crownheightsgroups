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
    // Get email from session storage
    const pendingEmail = sessionStorage.getItem('pendingVerification');
    if (pendingEmail) {
      setEmail(pendingEmail);
    } else {
      // No pending verification, redirect to register
      window.location.href = '/auth/register';
    }
    
    // Focus first input
    inputRefs[0].current?.focus();
  }, []);

  useEffect(() => {
    // Countdown timer for resend
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
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
    
    // Auto-submit when complete
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
      
      // Store session token
      localStorage.setItem('session_token', data.token);
      localStorage.setItem('user_name', data.user.name);
      localStorage.setItem('user_email', data.user.email);
      localStorage.setItem('user_role', data.user.role);
      
      // Clear pending verification
      sessionStorage.removeItem('pendingVerification');
      
      // Redirect after short delay
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
      
      setCountdown(60); // 60 second cooldown
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

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <div className="auth-success-icon">✓</div>
          <h1 className="auth-title">Email Verified!</h1>
          <p className="auth-subtitle">
            Your account has been verified successfully.<br />
            Redirecting you to the catalog...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-logo">✉️</div>
        <h1 className="auth-title">Check Your Email</h1>
        <p className="auth-subtitle">
          We sent a verification code to<br />
          <strong>{email}</strong>
        </p>
        
        <div className="verify-form">
          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}
          
          <p className="verify-label">Enter the 6-digit code:</p>
          
          <div className="verify-inputs" onPaste={handlePaste}>
            {[0, 1, 2, 3, 4, 5].map(index => (
              <input
                key={index}
                ref={inputRefs[index]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                className="verify-input"
                value={code[index]}
                onChange={(e) => handleInput(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={loading}
              />
            ))}
          </div>
          
          <button 
            className="auth-btn"
            onClick={handleManualSubmit}
            disabled={loading || code.join('').length !== 6}
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
          
          <div className="resend-section">
            <p>Didn't receive the code?</p>
            <button 
              className="resend-btn"
              onClick={handleResend}
              disabled={resending || countdown > 0}
            >
              {resending ? 'Sending...' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
            </button>
          </div>
        </div>
        
        <p className="auth-footer">
          <Link href="/auth/register" className="auth-link">
            ← Back to Registration
          </Link>
        </p>
      </div>
    </div>
  );
}
