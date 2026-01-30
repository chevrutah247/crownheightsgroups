'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Category { id: string; name: string; icon: string; }
interface Location { id: string; neighborhood: string; }

export default function SuggestPage() {
  const [activeTab, setActiveTab] = useState<'group' | 'service'>('group');
  const [categories, setCategories] = useState<Category[]>([]);
  const [serviceCategories, setServiceCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Group form
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [whatsappLink, setWhatsappLink] = useState('');
  const [telegramLink, setTelegramLink] = useState('');
  const [facebookLink, setFacebookLink] = useState('');
  const [websiteLink, setWebsiteLink] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [language, setLanguage] = useState('English');
  
  // Service form
  const [serviceName, setServiceName] = useState('');
  const [servicePhone, setServicePhone] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [serviceCategoryId, setServiceCategoryId] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, serviceCatsRes, locsRes] = await Promise.all([
          fetch('/api/admin/group-categories'),
          fetch('/api/admin/service-categories'),
          fetch('/api/admin/locations')
        ]);
        const cats = await catsRes.json();
        const serviceCats = await serviceCatsRes.json();
        const locs = await locsRes.json();
        
        if (Array.isArray(cats) && cats.length > 0) {
          setCategories(cats);
          setCategoryId(cats[0].id);
        }
        if (Array.isArray(serviceCats) && serviceCats.length > 0) {
          setServiceCategories(serviceCats);
          setServiceCategoryId(serviceCats[0].id);
        }
        if (Array.isArray(locs) && locs.length > 0) {
          setLocations(locs);
          setLocationId(locs[0].id);
        }
      } catch (e) {
        console.error('Failed to fetch data:', e);
      }
    };
    fetchData();
  }, []);

  const handleSubmitGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    if (!groupName.trim()) {
      setError('Group name is required');
      return;
    }
    
    if (!whatsappLink && !telegramLink && !facebookLink && !websiteLink) {
      setError('At least one link is required');
      return;
    }
    
    setLoading(true);
    
    try {
      const userEmail = localStorage.getItem('user_email') || 'anonymous';
      
      const response = await fetch('/api/suggest-group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: groupName,
          description: groupDescription,
          whatsappLink,
          telegramLink,
          facebookLink,
          websiteLink,
          categoryId,
          locationId,
          language,
          submittedBy: userEmail
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit');
      }
      
      setSuccess(true);
      setGroupName('');
      setGroupDescription('');
      setWhatsappLink('');
      setTelegramLink('');
      setFacebookLink('');
      setWebsiteLink('');
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitService = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    if (!serviceName.trim() || !servicePhone.trim()) {
      setError('Name and phone are required');
      return;
    }
    
    setLoading(true);
    
    try {
      const userEmail = localStorage.getItem('user_email') || 'anonymous';
      
      const response = await fetch('/api/suggest-service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: serviceName,
          phone: servicePhone,
          description: serviceDescription,
          categoryId: serviceCategoryId,
          submittedBy: userEmail
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit');
      }
      
      setSuccess(true);
      setServiceName('');
      setServicePhone('');
      setServiceDescription('');
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { width: '100%', padding: '0.875rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' as const };

  return (
    <div>
      <Header user={null} onLogout={() => {}} />
      
      <main className="main" style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem 1rem' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '0.5rem', color: '#1e3a5f' }}>Add a Listing</h1>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '2rem' }}>Share with the community</p>

        {/* Tabs */}
        <div style={{ display: 'flex', marginBottom: '2rem', borderRadius: '12px', overflow: 'hidden', border: '1px solid #ddd' }}>
          <button 
            onClick={() => { setActiveTab('group'); setError(''); setSuccess(false); }}
            style={{ 
              flex: 1, 
              padding: '1rem', 
              border: 'none', 
              background: activeTab === 'group' ? '#2563eb' : 'white',
              color: activeTab === 'group' ? 'white' : '#333',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            👥 Add Group
          </button>
          <button 
            onClick={() => { setActiveTab('service'); setError(''); setSuccess(false); }}
            style={{ 
              flex: 1, 
              padding: '1rem', 
              border: 'none', 
              background: activeTab === 'service' ? '#2563eb' : 'white',
              color: activeTab === 'service' ? 'white' : '#333',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            🔧 Add Service
          </button>
        </div>

        {success && (
          <div style={{ background: '#d1fae5', color: '#065f46', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center' }}>
            ✅ Thank you! Your submission will be reviewed by our team.
          </div>
        )}

        {error && (
          <div style={{ background: '#fee2e2', color: '#dc2626', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {activeTab === 'group' && (
          <form onSubmit={handleSubmitGroup} style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', color: '#1e3a5f' }}>Add a Group</h2>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>Share a WhatsApp, Telegram or other group</p>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Group Name *</label>
              <input style={inputStyle} value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="Enter group name" required />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Description</label>
              <textarea style={{ ...inputStyle, minHeight: '80px' }} value={groupDescription} onChange={e => setGroupDescription(e.target.value)} placeholder="What is this group about?" />
            </div>

            <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 'bold', color: '#166534' }}>🔗 Group Links (at least one required)</label>
              
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.9rem', color: '#666' }}>WhatsApp Link</label>
                <input style={inputStyle} value={whatsappLink} onChange={e => setWhatsappLink(e.target.value)} placeholder="https://chat.whatsapp.com/..." />
              </div>
              
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.9rem', color: '#666' }}>Telegram Link</label>
                <input style={inputStyle} value={telegramLink} onChange={e => setTelegramLink(e.target.value)} placeholder="https://t.me/..." />
              </div>
              
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.9rem', color: '#666' }}>Facebook Link</label>
                <input style={inputStyle} value={facebookLink} onChange={e => setFacebookLink(e.target.value)} placeholder="https://facebook.com/groups/..." />
              </div>
              
              <div>
                <label style={{ fontSize: '0.9rem', color: '#666' }}>Website Link</label>
                <input style={inputStyle} value={websiteLink} onChange={e => setWebsiteLink(e.target.value)} placeholder="https://..." />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Category *</label>
                <select style={inputStyle} value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Language *</label>
                <select style={inputStyle} value={language} onChange={e => setLanguage(e.target.value)}>
                  <option value="English">🇺🇸 English</option>
                  <option value="Russian">🇷🇺 Russian</option>
                  <option value="Hebrew">🇮🇱 Hebrew</option>
                  <option value="Yiddish">יידיש Yiddish</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Location</label>
              <select style={inputStyle} value={locationId} onChange={e => setLocationId(e.target.value)}>
                {locations.map(l => <option key={l.id} value={l.id}>📍 {l.neighborhood}</option>)}
              </select>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                width: '100%', 
                padding: '1rem', 
                background: loading ? '#ccc' : '#25D366', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                fontSize: '1.1rem', 
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Submitting...' : 'Submit Group'}
            </button>
          </form>
        )}

        {activeTab === 'service' && (
          <form onSubmit={handleSubmitService} style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', color: '#1e3a5f' }}>Add a Service</h2>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>Share a local business or professional</p>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Business/Person Name *</label>
              <input style={inputStyle} value={serviceName} onChange={e => setServiceName(e.target.value)} placeholder="Enter name" required />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Phone Number *</label>
              <input style={inputStyle} value={servicePhone} onChange={e => setServicePhone(e.target.value)} placeholder="718-xxx-xxxx" required />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Category *</label>
              <select style={inputStyle} value={serviceCategoryId} onChange={e => setServiceCategoryId(e.target.value)}>
                {serviceCategories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Description</label>
              <textarea style={{ ...inputStyle, minHeight: '80px' }} value={serviceDescription} onChange={e => setServiceDescription(e.target.value)} placeholder="What services do they offer?" />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                width: '100%', 
                padding: '1rem', 
                background: loading ? '#ccc' : '#2563eb', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                fontSize: '1.1rem', 
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Submitting...' : 'Submit Service'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link href="/" style={{ color: '#2563eb' }}>← Back to Home</Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
