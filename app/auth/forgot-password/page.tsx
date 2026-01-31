'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<'email' | 'code' | 'success'>('email');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    setError('');
    if (!email) { setError('Please enter your email'); return; }
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Failed to send code');
        setLoading(false);
        return;
      }
      
      setStep('code');
      setLoading(false);
    } catch (err) {
      setError('Network error');
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError('');
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Failed to reset password');
        setLoading(false);
        return;
      }
      
      setStep('success');
      setLoading(false);
    } catch (err) {
      setError('Network error');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{step === 'success' ? '✅' : '🔐'}</div>
          <h1 style={{ color: '#1e3a5f', marginBottom: '0.25rem', fontSize: '1.5rem' }}>
            {step === 'success' ? 'Password Reset!' : 'Reset Password'}
          </h1>
          <p style={{ color: '#666', fontSize: '0.95rem' }}>
            {step === 'email' && 'Enter your email to receive a reset code'}
            {step === 'code' && 'Enter the code sent to your email'}
            {step === 'success' && 'Your password has been changed'}
          </p>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>
        )}

        {step === 'email' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" style={{ width: '100%', padding: '0.875rem', border: '2px solid #ddd', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' }} />
            </div>
            <button type="button" onClick={handleSendCode} disabled={loading} style={{ width: '100%', padding: '1rem', background: loading ? '#93c5fd' : '#2563eb', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>{loading ? 'Sending...' : 'Send Reset Code'}</button>
          </div>
        )}

        {step === 'code' && (
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>Reset Code</label>
              <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter 6-digit code" maxLength={6} style={{ width: '100%', padding: '0.875rem', border: '2px solid #ddd', borderRadius: '8px', fontSize: '1.2rem', textAlign: 'center', letterSpacing: '0.5rem', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>New Password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 6 characters" style={{ width: '100%', padding: '0.875rem', border: '2px solid #ddd', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>Confirm Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat password" style={{ width: '100%', padding: '0.875rem', border: '2px solid #ddd', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' }} />
            </div>
            <button type="button" onClick={handleResetPassword} disabled={loading} style={{ width: '100%', padding: '1rem', background: loading ? '#6ee7b7' : '#10b981', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>{loading ? 'Resetting...' : 'Reset Password'}</button>
          </div>
        )}

        {step === 'success' && (
          <Link href="/auth/login" style={{ display: 'block', width: '100%', padding: '1rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold', textAlign: 'center', textDecoration: 'none' }}>Go to Login</Link>
        )}

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <Link href="/auth/login" style={{ color: '#2563eb', textDecoration: 'none' }}>← Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
