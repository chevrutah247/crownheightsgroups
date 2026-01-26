'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { categories, locations } from '@/lib/data';

interface UserInfo {
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export default function SuggestPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestNewLocation, setSuggestNewLocation] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    whatsappLink: '',
    categoryId: '',
    locationId: '',
    newNeighborhood: '',
    newCity: '',
    newState: '',
    newCountry: 'USA',
    description: '',
    contactEmail: '',
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
          // Pre-fill contact email
          setFormData(prev => ({
            ...prev,
            contactEmail: data.user.email
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
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In production, this would POST to /api/suggestions
    console.log('Suggestion submitted:', formData);
    
    setSubmitted(true);
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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

  const approvedLocations = locations.filter(l => l.status === 'approved');

  return (
    <>
      <Header user={user} onLogout={handleLogout} />
      
      <main className="main">
        <div className="page-header">
          <h1 className="page-title">Suggest a Group</h1>
          <p className="page-subtitle">
            Know a great WhatsApp group? Share it with the community!
          </p>
        </div>
        
        <div className="form-container">
          <div className="form-card">
            {submitted ? (
              <div className="form-success">
                <h3>Thank you for your suggestion!</h3>
                <p>We'll review it and add it to the directory if approved.</p>
                <button 
                  className="form-btn" 
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      title: '',
                      whatsappLink: '',
                      categoryId: '',
                      locationId: '',
                      newNeighborhood: '',
                      newCity: '',
                      newState: '',
                      newCountry: 'USA',
                      description: '',
                      contactEmail: '',
                    });
                  }}
                  style={{ marginTop: '1rem' }}
                >
                  Suggest Another Group
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">
                    Group Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    className="form-input"
                    placeholder="e.g., Crown Heights Moms"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    WhatsApp Link <span className="required">*</span>
                  </label>
                  <input
                    type="url"
                    name="whatsappLink"
                    className="form-input"
                    placeholder="https://chat.whatsapp.com/..."
                    value={formData.whatsappLink}
                    onChange={handleChange}
                    required
                  />
                  <p className="form-hint">
                    The invite link to join the group
                  </p>
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Category <span className="required">*</span>
                  </label>
                  <select
                    name="categoryId"
                    className="form-select"
                    value={formData.categoryId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Neighborhood <span className="required">*</span>
                  </label>
                  {!suggestNewLocation ? (
                    <>
                      <select
                        name="locationId"
                        className="form-select"
                        value={formData.locationId}
                        onChange={handleChange}
                        required={!suggestNewLocation}
                      >
                        <option value="">Select a neighborhood</option>
                        {approvedLocations.map(loc => (
                          <option key={loc.id} value={loc.id}>
                            {loc.neighborhood}, {loc.city}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="form-hint"
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          color: 'var(--primary)',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          padding: 0,
                          marginTop: '0.5rem'
                        }}
                        onClick={() => setSuggestNewLocation(true)}
                      >
                        Don't see your neighborhood? Suggest a new one
                      </button>
                    </>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <input
                        type="text"
                        name="newNeighborhood"
                        className="form-input"
                        placeholder="Neighborhood name"
                        value={formData.newNeighborhood}
                        onChange={handleChange}
                        required={suggestNewLocation}
                      />
                      <input
                        type="text"
                        name="newCity"
                        className="form-input"
                        placeholder="City"
                        value={formData.newCity}
                        onChange={handleChange}
                        required={suggestNewLocation}
                      />
                      <input
                        type="text"
                        name="newState"
                        className="form-input"
                        placeholder="State"
                        value={formData.newState}
                        onChange={handleChange}
                        required={suggestNewLocation}
                      />
                      <select
                        name="newCountry"
                        className="form-select"
                        value={formData.newCountry}
                        onChange={handleChange}
                      >
                        <option value="USA">USA</option>
                        <option value="Israel">Israel</option>
                        <option value="Canada">Canada</option>
                        <option value="UK">UK</option>
                        <option value="Other">Other</option>
                      </select>
                      <button
                        type="button"
                        className="form-hint"
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          color: 'var(--primary)',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          padding: 0
                        }}
                        onClick={() => setSuggestNewLocation(false)}
                      >
                        Choose from existing neighborhoods
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Description <span className="required">*</span>
                  </label>
                  <textarea
                    name="description"
                    className="form-textarea"
                    placeholder="What is this group about?"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Your Email (optional)</label>
                  <input
                    type="email"
                    name="contactEmail"
                    className="form-input"
                    placeholder="your@email.com"
                    value={formData.contactEmail}
                    onChange={handleChange}
                  />
                  <p className="form-hint">
                    We'll notify you when your suggestion is reviewed
                  </p>
                </div>
                
                <button 
                  type="submit" 
                  className="form-btn"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit Suggestion'}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}
