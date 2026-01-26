'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface UserInfo {
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export default function ContactPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('session_token');
      
      if (!token) {
        window.location.href = '/auth/login';
        return;
      }
      
      try {
        const response = await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        
        const data = await response.json();
        
        if (data.valid) {
          setIsAuthenticated(true);
          setUser(data.user);
          // Pre-fill form with user data
          setFormData(prev => ({
            ...prev,
            name: data.user.name,
            email: data.user.email
          }));
        } else {
          localStorage.removeItem('session_token');
          window.location.href = '/auth/login';
        }
      } catch (error) {
        window.location.href = '/auth/login';
      }
    };
    
    checkAuth();
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem('session_token');
    
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    localStorage.removeItem('session_token');
    window.location.href = '/auth/login';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      setSubmitted(true);
    } catch (err) {
      setError('Failed to send message. Please try again or email us directly at contact@edonthego.org');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (isAuthenticated === null) {
    return (
      <div className="auth-container">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header user={user} onLogout={handleLogout} />
      
      <main className="main">
        <div className="page-header">
          <h1 className="page-title">Contact Us</h1>
          <p className="page-subtitle">
            Have questions, feedback, or suggestions? We'd love to hear from you!
          </p>
        </div>
        
        <div className="form-container">
          <div className="form-card">
            {submitted ? (
              <div className="form-success">
                <h3>Message Sent!</h3>
                <p>Thank you for contacting us. We'll get back to you soon.</p>
                <button 
                  className="form-btn" 
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      name: '',
                      email: '',
                      subject: '',
                      message: '',
                    });
                  }}
                  style={{ marginTop: '1rem' }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && (
                  <div style={{ 
                    background: '#fff5f5', 
                    border: '1px solid var(--error)', 
                    color: 'var(--error)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '1rem'
                  }}>
                    {error}
                  </div>
                )}
                
                <div className="form-group">
                  <label className="form-label">
                    Your Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Email Address <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Subject <span className="required">*</span>
                  </label>
                  <select
                    name="subject"
                    className="form-select"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a subject</option>
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Report a Group">Report a Group</option>
                    <option value="Partnership">Partnership Opportunity</option>
                    <option value="Advertising">Advertising</option>
                    <option value="Technical Issue">Technical Issue</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Message <span className="required">*</span>
                  </label>
                  <textarea
                    name="message"
                    className="form-textarea"
                    placeholder="Your message..."
                    value={formData.message}
                    onChange={handleChange}
                    required
                    style={{ minHeight: '150px' }}
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="form-btn"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
                
                <p style={{ 
                  textAlign: 'center', 
                  marginTop: '1.5rem',
                  color: 'var(--text-muted)',
                  fontSize: '0.9rem'
                }}>
                  Or email us directly at{' '}
                  <a href="mailto:contact@edonthego.org" style={{ color: 'var(--primary)' }}>
                    contact@edonthego.org
                  </a>
                </p>
              </form>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}
