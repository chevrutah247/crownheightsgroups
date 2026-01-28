'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { categories } from '@/lib/data';

interface UserInfo {
  name: string;
  email: string;
  role: 'user' | 'admin';
}

interface Location {
  id: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
  zipCode?: string;
  status: string;
  order?: number;
}

export default function SuggestPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestNewLocation, setSuggestNewLocation] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  
  // Cascading selection state
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    whatsappLink: '',
    categoryId: '',
    locationId: '',
    newNeighborhood: '',
    newCity: '',
    newState: '',
    newCountry: 'USA',
    newZipCode: '',
    description: '',
    contactEmail: '',
  });

  // Load locations from API
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await fetch('/api/admin/locations');
        const data = await res.json();
        if (Array.isArray(data)) {
          setLocations(data.filter((l: Location) => l.status === 'approved'));
        }
      } catch (error) {
        console.error('Failed to load locations:', error);
      } finally {
        setLocationsLoading(false);
      }
    };
    fetchLocations();
  }, []);

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
    
    try {
      // If suggesting new location, submit it first
      if (suggestNewLocation && formData.newNeighborhood) {
        await fetch('/api/location-suggestions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            neighborhood: formData.newNeighborhood,
            city: formData.newCity,
            state: formData.newState,
            country: formData.newCountry,
            zipCode: formData.newZipCode,
            suggestedBy: user?.email || 'anonymous'
          })
        });
      }
      
      // Submit group suggestion
      await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'group',
          payload: {
            title: formData.title,
            whatsappLink: formData.whatsappLink,
            categoryId: formData.categoryId,
            locationId: suggestNewLocation ? 'pending' : formData.locationId,
            description: formData.description,
            newLocation: suggestNewLocation ? {
              neighborhood: formData.newNeighborhood,
              city: formData.newCity,
              state: formData.newState,
              country: formData.newCountry,
              zipCode: formData.newZipCode,
            } : null
          },
          contactEmail: formData.contactEmail,
          suggestedBy: user?.email || 'anonymous'
        })
      });
      
      setSubmitted(true);
    } catch (error) {
      console.error('Submit error:', error);
      alert('Error submitting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Get unique values for cascading dropdowns
  const countries = Array.from(new Set(locations.map(l => l.country))).sort();
  const states = Array.from(new Set(locations.filter(l => l.country === selectedCountry).map(l => l.state))).filter(Boolean).sort();
  const cities = Array.from(new Set(locations.filter(l => l.country === selectedCountry && (!selectedState || l.state === selectedState)).map(l => l.city))).filter(Boolean).sort();
  const filteredLocations = locations.filter(l => {
    if (selectedCountry && l.country !== selectedCountry) return false;
    if (selectedState && l.state !== selectedState) return false;
    if (selectedCity && l.city !== selectedCity) return false;
    return true;
  }).sort((a, b) => (a.order || 0) - (b.order || 0));

  const resetFilters = () => {
    setSelectedCountry('');
    setSelectedState('');
    setSelectedCity('');
    setFormData(prev => ({ ...prev, locationId: '' }));
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
          <h1 className="page-title">Suggest a Group</h1>
          <p className="page-subtitle">
            Know a great WhatsApp group? Share it with the community!
          </p>
        </div>
        
        <div className="form-container">
          <div className="form-card">
            {submitted ? (
              <div className="form-success">
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                <h3>Thank you for your suggestion!</h3>
                <p>We'll review it and add it to the directory if approved.</p>
                {suggestNewLocation && (
                  <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                    Your new location suggestion will also be reviewed.
                  </p>
                )}
                <button 
                  className="form-btn" 
                  onClick={() => {
                    setSubmitted(false);
                    setSuggestNewLocation(false);
                    resetFilters();
                    setFormData({
                      title: '',
                      whatsappLink: '',
                      categoryId: '',
                      locationId: '',
                      newNeighborhood: '',
                      newCity: '',
                      newState: '',
                      newCountry: 'USA',
                      newZipCode: '',
                      description: '',
                      contactEmail: user?.email || '',
                    });
                  }}
                  style={{ marginTop: '1.5rem' }}
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
                    Location <span className="required">*</span>
                  </label>
                  
                  {locationsLoading ? (
                    <p style={{ color: '#666' }}>Loading locations...</p>
                  ) : !suggestNewLocation ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {/* Country filter */}
                      <select
                        className="form-select"
                        value={selectedCountry}
                        onChange={(e) => {
                          setSelectedCountry(e.target.value);
                          setSelectedState('');
                          setSelectedCity('');
                          setFormData(prev => ({ ...prev, locationId: '' }));
                        }}
                      >
                        <option value="">🌍 All Countries</option>
                        {countries.map(country => (
                          <option key={country} value={country}>{country}</option>
                        ))}
                      </select>
                      
                      {/* State filter (if country selected and has states) */}
                      {selectedCountry && states.length > 0 && (
                        <select
                          className="form-select"
                          value={selectedState}
                          onChange={(e) => {
                            setSelectedState(e.target.value);
                            setSelectedCity('');
                            setFormData(prev => ({ ...prev, locationId: '' }));
                          }}
                        >
                          <option value="">📍 All States/Regions</option>
                          {states.map(state => (
                            <option key={state} value={state}>{state}</option>
                          ))}
                        </select>
                      )}
                      
                      {/* City filter (if applicable) */}
                      {selectedCountry && cities.length > 1 && (
                        <select
                          className="form-select"
                          value={selectedCity}
                          onChange={(e) => {
                            setSelectedCity(e.target.value);
                            setFormData(prev => ({ ...prev, locationId: '' }));
                          }}
                        >
                          <option value="">🏙️ All Cities</option>
                          {cities.map(city => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                      )}
                      
                      {/* Neighborhood selection */}
                      <select
                        name="locationId"
                        className="form-select"
                        value={formData.locationId}
                        onChange={handleChange}
                        required={!suggestNewLocation}
                      >
                        <option value="">Select a neighborhood</option>
                        {filteredLocations.map(loc => (
                          <option key={loc.id} value={loc.id}>
                            {loc.neighborhood}{loc.city ? `, ${loc.city}` : ''}{loc.state ? `, ${loc.state}` : ''}
                          </option>
                        ))}
                      </select>
                      
                      {selectedCountry && (
                        <button
                          type="button"
                          onClick={resetFilters}
                          style={{ 
                            background: 'none', 
                            border: 'none', 
                            color: '#666',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            padding: 0,
                            fontSize: '0.85rem',
                            textAlign: 'left'
                          }}
                        >
                          Clear filters
                        </button>
                      )}
                      
                      <button
                        type="button"
                        style={{ 
                          background: '#f0f9ff', 
                          border: '1px dashed #2563eb', 
                          color: '#2563eb',
                          cursor: 'pointer',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          marginTop: '0.5rem',
                          fontWeight: '500'
                        }}
                        onClick={() => setSuggestNewLocation(true)}
                      >
                        ➕ Don't see your location? Suggest a new one
                      </button>
                    </div>
                  ) : (
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '0.75rem',
                      background: '#f0fdf4',
                      padding: '1rem',
                      borderRadius: '8px',
                      border: '1px solid #86efac'
                    }}>
                      <p style={{ margin: 0, fontWeight: 'bold', color: '#166534' }}>
                        📍 Suggest New Location
                      </p>
                      
                      <div>
                        <label style={{ fontSize: '0.85rem', color: '#666' }}>Neighborhood *</label>
                        <input
                          type="text"
                          name="newNeighborhood"
                          className="form-input"
                          placeholder="e.g., Crown Heights"
                          value={formData.newNeighborhood}
                          onChange={handleChange}
                          required={suggestNewLocation}
                        />
                      </div>
                      
                      <div>
                        <label style={{ fontSize: '0.85rem', color: '#666' }}>City *</label>
                        <input
                          type="text"
                          name="newCity"
                          className="form-input"
                          placeholder="e.g., Brooklyn"
                          value={formData.newCity}
                          onChange={handleChange}
                          required={suggestNewLocation}
                        />
                      </div>
                      
                      <div>
                        <label style={{ fontSize: '0.85rem', color: '#666' }}>State/Region</label>
                        <input
                          type="text"
                          name="newState"
                          className="form-input"
                          placeholder="e.g., NY"
                          value={formData.newState}
                          onChange={handleChange}
                        />
                      </div>
                      
                      <div>
                        <label style={{ fontSize: '0.85rem', color: '#666' }}>Country *</label>
                        <select
                          name="newCountry"
                          className="form-select"
                          value={formData.newCountry}
                          onChange={handleChange}
                        >
                          <option value="USA">🇺🇸 USA</option>
                          <option value="Israel">🇮🇱 Israel</option>
                          <option value="Canada">🇨🇦 Canada</option>
                          <option value="UK">🇬🇧 UK</option>
                          <option value="Australia">🇦🇺 Australia</option>
                          <option value="Other">🌍 Other</option>
                        </select>
                      </div>
                      
                      <div>
                        <label style={{ fontSize: '0.85rem', color: '#666' }}>ZIP Code (optional)</label>
                        <input
                          type="text"
                          name="newZipCode"
                          className="form-input"
                          placeholder="e.g., 11213"
                          value={formData.newZipCode}
                          onChange={handleChange}
                        />
                      </div>
                      
                      <button
                        type="button"
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          color: '#2563eb',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          padding: 0,
                          textAlign: 'left'
                        }}
                        onClick={() => setSuggestNewLocation(false)}
                      >
                        ← Choose from existing locations
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
                    rows={3}
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
                  style={{ marginTop: '0.5rem' }}
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
