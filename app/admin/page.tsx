'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Tab = 'suggestions' | 'groups' | 'services' | 'businesses' | 'events' | 'campaigns' | 'lottery' | 'group-categories' | 'service-categories' | 'locations' | 'users' | 'reports';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('suggestions');
  const [groups, setGroups] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [groupCategories, setGroupCategories] = useState<any[]>([]);
  const [serviceCategories, setServiceCategories] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [imagePreview, setImagePreview] = useState<string>('');
  
  // Lottery state
  const [lotteryParticipants, setLotteryParticipants] = useState<any[]>([]);
  const [lotteryPoolWeek, setLotteryPoolWeek] = useState<any>(null);
  const [adminNumbers, setAdminNumbers] = useState('');
  const [sendingEmails, setSendingEmails] = useState(false);
  const [lotteryMessage, setLotteryMessage] = useState('');
  const [lotteryHistory, setLotteryHistory] = useState<any[]>([]);
  const [selectedHistoryWeek, setSelectedHistoryWeek] = useState<any>(null);
  const [historyParticipants, setHistoryParticipants] = useState<any[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  
  const [groupSuggestions, setGroupSuggestions] = useState<any[]>([]);
  const [serviceSuggestions, setServiceSuggestions] = useState<any[]>([]);
  const [eventSuggestions, setEventSuggestions] = useState<any[]>([]);
  const [campaignSuggestions, setCampaignSuggestions] = useState<any[]>([]);
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([
      fetch('/api/admin/groups').then(r => r.json()).then(d => setGroups(Array.isArray(d) ? d : [])).catch(() => {}),
      fetch('/api/admin/services').then(r => r.json()).then(d => setServices(Array.isArray(d) ? d : [])).catch(() => {}),
      fetch('/api/events?all=true').then(r => r.json()).then(d => setEvents(Array.isArray(d) ? d : [])).catch(() => {}),
      fetch('/api/campaigns').then(r => r.json()).then(d => setCampaigns(Array.isArray(d) ? d : [])).catch(() => {}),
      fetch('/api/admin/users').then(r => r.json()).then(d => setUsers(Array.isArray(d) ? d : [])).catch(() => {}),
      fetch('/api/admin/group-categories').then(r => r.json()).then(d => setGroupCategories(Array.isArray(d) ? d : [])).catch(() => {}),
      fetch('/api/admin/service-categories').then(r => r.json()).then(d => setServiceCategories(Array.isArray(d) ? d : [])).catch(() => {}),
      fetch('/api/admin/locations').then(r => r.json()).then(d => setLocations(Array.isArray(d) ? d : [])).catch(() => {}),
      fetch('/api/reports').then(r => r.json()).then(d => setReports(Array.isArray(d) ? d : [])).catch(() => {}),
      fetch('/api/suggest-group').then(r => r.json()).then(d => setGroupSuggestions(Array.isArray(d) ? d : [])).catch(() => {}),
      fetch('/api/suggest-service').then(r => r.json()).then(d => setServiceSuggestions(Array.isArray(d) ? d : [])).catch(() => {}),
      fetch('/api/suggest-event').then(r => r.json()).then(d => setEventSuggestions(Array.isArray(d) ? d : [])).catch(() => {}),
      fetch('/api/suggest-campaign').then(r => r.json()).then(d => setCampaignSuggestions(Array.isArray(d) ? d : [])).catch(() => {}),
      fetch('/api/location-suggestions').then(r => r.json()).then(d => setLocationSuggestions(Array.isArray(d) ? d : [])).catch(() => {}),
      fetch('/api/business').then(r => r.json()).then(d => setBusinesses(Array.isArray(d) ? d : [])).catch(() => {}),
      // Fetch lottery data
      fetch('/api/lottery/admin/current-pool').then(r => r.json()).then(d => {
        if (d.poolWeek) {
          setLotteryPoolWeek(d.poolWeek);
          setAdminNumbers(d.poolWeek.admin_numbers || '');
        }
        if (d.participants) setLotteryParticipants(d.participants);
      }).catch(() => {}),
      // Fetch lottery history
      fetch('/api/lottery/admin/history').then(r => r.json()).then(d => {
        if (d.weeks) setLotteryHistory(d.weeks);
      }).catch(() => {}),
    ]);
    setLoading(false);
  };

  // Lottery functions
  const saveLotteryNumbers = async () => {
    try {
      const res = await fetch('/api/lottery/admin/save-numbers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poolWeekId: lotteryPoolWeek?.id, adminNumbers }),
      });
      if (res.ok) {
        setLotteryMessage('✅ Numbers saved!');
        setTimeout(() => setLotteryMessage(''), 3000);
      }
    } catch (error) {
      setLotteryMessage('❌ Error saving numbers');
    }
  };

  const sendLotteryNumbersEmail = async () => {
    if (!confirm('Send numbers to all participants?')) return;
    setSendingEmails(true);
    setLotteryMessage('');
    try {
      const res = await fetch('/api/lottery/admin/send-numbers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poolWeekId: lotteryPoolWeek?.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setLotteryMessage(`✅ Numbers sent to ${data.sent} participants!`);
        fetchAll();
      } else {
        setLotteryMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setLotteryMessage('❌ Error sending emails');
    } finally {
      setSendingEmails(false);
    }
  };

  // View history week details
  const viewHistoryWeek = async (week: any) => {
    try {
      const res = await fetch(`/api/lottery/admin/history?poolWeekId=${week.id}`);
      const data = await res.json();
      if (res.ok) {
        setSelectedHistoryWeek(data.poolWeek);
        setHistoryParticipants(data.participants || []);
        setShowHistoryModal(true);
      }
    } catch (error) {
      console.error('Error fetching week details:', error);
    }
  };

  // Open modal for editing/creating
  const openModal = (type: string, item?: any) => {
    setModalType(type);
    setIsNew(!item);
    if (item) {
      setEditingItem({ ...item });
      if (item.imageUrl || item.logoUrl) {
        setImagePreview(item.imageUrl || item.logoUrl);
      }
    } else {
      if (type === 'group') setEditingItem({ title: '', description: '', whatsappLinks: [''], categoryId: groupCategories[0]?.id || '1', locationId: locations[0]?.id || '1', language: 'English', isPinned: false });
      if (type === 'service') setEditingItem({ name: '', phone: '', description: '', categoryId: serviceCategories[0]?.id || '1', languages: ['English'], isPinned: false, address: '', website: '', email: '', imageUrl: '' });
      if (type === 'event') setEditingItem({ title: '', description: '', date: '', time: '', location: '', organizer: '', contactPhone: '', link: '' });
      if (type === 'campaign') setEditingItem({ title: '', description: '', goal: 0, raised: 0, donationLink: '', organizer: '', status: 'active' });
      if (type === 'group-category') setEditingItem({ name: '', nameRu: '', icon: '📁', order: groupCategories.length });
      if (type === 'service-category') setEditingItem({ name: '', nameRu: '', icon: '🔧', order: serviceCategories.length });
      if (type === 'location') setEditingItem({ neighborhood: '', city: 'Brooklyn', state: 'NY', country: 'USA', order: locations.length });
    }
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditingItem(null); setImagePreview(''); };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 2 * 1024 * 1024) { alert('Image must be less than 2MB'); return; }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target?.result as string;
        setImagePreview(base64);
        setEditingItem((prev: any) => ({...prev, imageUrl: base64}));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { alert('Image must be less than 2MB'); return; }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target?.result as string;
        setImagePreview(base64);
        setEditingItem({...editingItem, imageUrl: base64});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    let endpoint = '';
    let method = isNew ? 'POST' : 'PUT';
    
    if (modalType === 'group') endpoint = '/api/admin/groups';
    if (modalType === 'service') endpoint = '/api/admin/services';
    if (modalType === 'business') endpoint = '/api/business';
    if (modalType === 'event') endpoint = '/api/events';
    if (modalType === 'campaign') endpoint = '/api/campaigns';
    if (modalType === 'group-category') endpoint = '/api/admin/group-categories';
    if (modalType === 'service-category') endpoint = '/api/admin/service-categories';
    if (modalType === 'location') endpoint = '/api/admin/locations';
    
    await fetch(endpoint, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingItem) });
    await fetchAll();
    closeModal();
    setSaving(false);
  };

  const handleDelete = async (type: string, id: string) => {
    if (!confirm('Delete this item?')) return;
    let endpoint = '';
    if (type === 'group') endpoint = '/api/admin/groups';
    if (type === 'service') endpoint = '/api/admin/services';
    if (type === 'business') endpoint = '/api/business';
    if (type === 'event') endpoint = '/api/events';
    if (type === 'campaign') endpoint = '/api/campaigns';
    if (type === 'group-category') endpoint = '/api/admin/group-categories';
    if (type === 'service-category') endpoint = '/api/admin/service-categories';
    if (type === 'location') endpoint = '/api/admin/locations';
    
    await fetch(endpoint, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    fetchAll();
  };

  const handleApprove = async (type: string, item: any) => {
    await fetch(`/api/suggest-${type}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: item.id, action: 'approve' }) });
    fetchAll();
  };

  const handleReject = async (type: string, id: string) => {
    await fetch(`/api/suggest-${type}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action: 'reject' }) });
    fetchAll();
  };

  const handleRestoreGroup = async (group: any) => {
    await fetch('/api/admin/groups', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...group, status: 'approved', brokenAt: null, brokenLink: null }) });
    fetchAll();
  };

  const handleToggleAdmin = async (user: any) => {
    if (!confirm(`${user.role === 'admin' ? 'Remove' : 'Make'} admin?`)) return;
    await fetch('/api/admin/users', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: user.email, role: user.role === 'admin' ? 'user' : 'admin' }) });
    fetchAll();
  };

  const pendingGroups = groupSuggestions.filter(s => s.status === 'pending');
  const pendingServices = serviceSuggestions.filter(s => s.status === 'pending');
  const pendingEvents = eventSuggestions.filter(s => s.status === 'pending');
  const pendingCampaigns = campaignSuggestions.filter(s => s.status === 'pending');
  const pendingLocations = locationSuggestions.filter(s => s.status === 'pending');
  const brokenGroups = groups.filter(g => g.status === 'broken');
  const totalPending = pendingGroups.length + pendingServices.length + pendingEvents.length + pendingCampaigns.length + pendingLocations.length;

  const inputStyle: React.CSSProperties = { width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' };
  const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' };
  const btnPrimary: React.CSSProperties = { padding: '0.75rem 1.5rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
  const btnDanger: React.CSSProperties = { padding: '0.5rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' };
  const btnSuccess: React.CSSProperties = { padding: '0.5rem 1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginRight: '0.5rem' };

  const navItems = [
    { id: 'suggestions' as Tab, label: 'Suggestions', icon: '📬', badge: totalPending },
    { id: 'groups' as Tab, label: 'Groups', icon: '👥', badge: brokenGroups.length > 0 ? brokenGroups.length : undefined },
    { id: 'services' as Tab, label: 'Services', icon: '🔧' },
    { id: 'businesses' as Tab, label: 'Businesses', icon: '🏪' },
    { id: 'events' as Tab, label: 'Events', icon: '📅' },
    { id: 'campaigns' as Tab, label: 'Campaigns', icon: '💝' },
    { id: 'lottery' as Tab, label: 'Lottery Pool', icon: '🎰', badge: lotteryParticipants.length > 0 ? lotteryParticipants.length : undefined },
    { id: 'group-categories' as Tab, label: 'Group Categories', icon: '📁' },
    { id: 'service-categories' as Tab, label: 'Service Types', icon: '🏷️' },
    { id: 'locations' as Tab, label: 'Locations', icon: '📍' },
    { id: 'users' as Tab, label: 'Users', icon: '👤' },
    { id: 'reports' as Tab, label: 'Reports', icon: '⚠️', badge: reports.length },
  ];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
    });
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header"><h2 className="admin-sidebar-title">Admin Panel</h2></div>
        <nav>
          <ul className="admin-nav">
            {navItems.map(item => (
              <li key={item.id} className={'admin-nav-item ' + (activeTab === item.id ? 'active' : '')} onClick={() => setActiveTab(item.id)}>
                <span>{item.icon}</span><span>{item.label}</span>
                {item.badge ? <span style={{ marginLeft: 'auto', background: item.id === 'lottery' ? '#ffd700' : '#ef4444', color: item.id === 'lottery' ? '#1e3a5f' : 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 'bold' }}>{item.badge}</span> : null}
              </li>
            ))}
            <li className="admin-nav-item" style={{ marginTop: '2rem' }}>
              <Link href="/" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><span>🏠</span><span>Back to Site</span></Link>
            </li>
          </ul>
        </nav>
      </aside>

      <main className="admin-content">
        {/* SUGGESTIONS */}
        {activeTab === 'suggestions' && (
          <>
            <div className="admin-header"><h1 className="admin-title">Pending Suggestions ({totalPending})</h1></div>
            {totalPending === 0 ? <div className="admin-card"><p>No pending suggestions ✅</p></div> : (
              <>
                {pendingGroups.length > 0 && <div className="admin-card" style={{marginBottom:'1rem'}}><h3>👥 Groups ({pendingGroups.length})</h3>{pendingGroups.map(s=>(<div key={s.id} style={{padding:'1rem',border:'1px solid #ddd',borderRadius:'8px',marginTop:'0.5rem',background:'#fffbeb'}}><strong>{s.title}</strong><br/><small>{s.description?.substring(0,100)}</small><br/><small>By: {s.submittedBy}</small><div style={{marginTop:'0.5rem'}}><button onClick={()=>handleApprove('group',s)} style={btnSuccess}>✅ Approve</button><button onClick={()=>handleReject('group',s.id)} style={btnDanger}>❌ Reject</button></div></div>))}</div>}
                {pendingServices.length > 0 && <div className="admin-card" style={{marginBottom:'1rem'}}><h3>🔧 Services ({pendingServices.length})</h3>{pendingServices.map(s=>(<div key={s.id} style={{padding:'1rem',border:'1px solid #ddd',borderRadius:'8px',marginTop:'0.5rem',background:'#fffbeb'}}><strong>{s.name}</strong> - {s.phone}<br/><small>By: {s.submittedBy}</small><div style={{marginTop:'0.5rem'}}><button onClick={()=>handleApprove('service',s)} style={btnSuccess}>✅ Approve</button><button onClick={()=>handleReject('service',s.id)} style={btnDanger}>❌ Reject</button></div></div>))}</div>}
                {pendingEvents.length > 0 && <div className="admin-card" style={{marginBottom:'1rem'}}><h3>📅 Events ({pendingEvents.length})</h3>{pendingEvents.map(s=>(<div key={s.id} style={{padding:'1rem',border:'1px solid #ddd',borderRadius:'8px',marginTop:'0.5rem',background:'#fffbeb'}}><strong>{s.title}</strong> - {s.date}<br/><small>{s.description?.substring(0,100)}</small><br/><small>By: {s.submittedBy}</small><div style={{marginTop:'0.5rem'}}><button onClick={()=>handleApprove('event',s)} style={btnSuccess}>✅ Approve</button><button onClick={()=>handleReject('event',s.id)} style={btnDanger}>❌ Reject</button></div></div>))}</div>}
                {pendingCampaigns.length > 0 && <div className="admin-card" style={{marginBottom:'1rem'}}><h3>💝 Campaigns ({pendingCampaigns.length})</h3>{pendingCampaigns.map(s=>(<div key={s.id} style={{padding:'1rem',border:'1px solid #ddd',borderRadius:'8px',marginTop:'0.5rem',background:'#fffbeb'}}><strong>{s.title}</strong> - Goal: ${s.goal}<br/><small>{s.description?.substring(0,100)}</small><br/><small>By: {s.submittedBy}</small><div style={{marginTop:'0.5rem'}}><button onClick={()=>handleApprove('campaign',s)} style={btnSuccess}>✅ Approve</button><button onClick={()=>handleReject('campaign',s.id)} style={btnDanger}>❌ Reject</button></div></div>))}</div>}
                {pendingLocations.length > 0 && <div className="admin-card" style={{marginBottom:'1rem'}}><h3>📍 Locations ({pendingLocations.length})</h3>{pendingLocations.map(s=>(<div key={s.id} style={{padding:'1rem',border:'1px solid #ddd',borderRadius:'8px',marginTop:'0.5rem',background:'#fffbeb'}}><strong>{s.neighborhood}</strong> - {s.city}<br/><small>By: {s.suggestedBy}</small><div style={{marginTop:'0.5rem'}}><button onClick={()=>handleApprove('location',s)} style={btnSuccess}>✅ Approve</button><button onClick={()=>handleReject('location',s.id)} style={btnDanger}>❌ Reject</button></div></div>))}</div>}
              </>
            )}
          </>
        )}

        {/* LOTTERY POOL */}
        {activeTab === 'lottery' && (
          <>
            <div className="admin-header">
              <h1 className="admin-title">🎰 Lottery Pool</h1>
              <Link href="/lottery" target="_blank" style={{ padding: '0.5rem 1rem', background: '#e5e7eb', borderRadius: '8px', textDecoration: 'none', color: '#333' }}>
                View Public Page →
              </Link>
            </div>

            {lotteryMessage && (
              <div style={{ background: lotteryMessage.includes('✅') ? '#dcfce7' : '#fef2f2', border: `1px solid ${lotteryMessage.includes('✅') ? '#86efac' : '#fecaca'}`, borderRadius: '8px', padding: '1rem', marginBottom: '1rem', color: lotteryMessage.includes('✅') ? '#166534' : '#dc2626' }}>
                {lotteryMessage}
              </div>
            )}

            {/* Pool Week Stats */}
            <div className="admin-card" style={{ marginBottom: '1rem' }}>
              <h3 style={{ margin: '0 0 1rem 0' }}>Current Pool Week</h3>
              {lotteryPoolWeek ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                  <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>Status</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: lotteryPoolWeek.status === 'open' ? '#22c55e' : '#f59e0b' }}>{lotteryPoolWeek.status?.toUpperCase()}</div>
                  </div>
                  <div style={{ background: '#fef3c7', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>Participants</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#92400e' }}>{lotteryPoolWeek.total_participants || 0}</div>
                  </div>
                  <div style={{ background: '#dcfce7', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>Pool Total</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#166534' }}>${(lotteryPoolWeek.total_amount || 0).toFixed(2)}</div>
                  </div>
                  <div style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>Closes</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>{lotteryPoolWeek.week_end ? formatDate(lotteryPoolWeek.week_end) : '-'}</div>
                  </div>
                </div>
              ) : (
                <p style={{ color: '#666' }}>No active pool week</p>
              )}
            </div>

            {/* Enter Numbers */}
            <div className="admin-card" style={{ marginBottom: '1rem' }}>
              <h3 style={{ margin: '0 0 1rem 0' }}>🎱 Enter Lottery Numbers</h3>
              <p style={{ color: '#666', marginBottom: '1rem', fontSize: '0.9rem' }}>Enter all lottery numbers you purchased. These will be emailed to all participants.</p>
              <textarea
                value={adminNumbers}
                onChange={(e) => setAdminNumbers(e.target.value)}
                placeholder={`Mega Millions:\n02 - 15 - 34 - 48 - 67 (Mega: 12)\n05 - 22 - 33 - 45 - 70 (Mega: 08)\n\nPowerball:\n10 - 24 - 35 - 52 - 61 (PB: 05)`}
                style={{ width: '100%', minHeight: '150px', padding: '1rem', fontFamily: 'monospace', fontSize: '0.95rem', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '1rem' }}
              />
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button onClick={saveLotteryNumbers} style={{ ...btnPrimary, background: '#3b82f6' }}>💾 Save Numbers</button>
                <button onClick={sendLotteryNumbersEmail} disabled={sendingEmails || !adminNumbers} style={{ ...btnPrimary, background: sendingEmails ? '#9ca3af' : '#22c55e', cursor: sendingEmails ? 'wait' : 'pointer' }}>
                  {sendingEmails ? '⏳ Sending...' : '📧 Send to All Participants'}
                </button>
              </div>
            </div>

            {/* Participants List */}
            <div className="admin-card" style={{ marginBottom: '1rem' }}>
              <h3 style={{ margin: '0 0 1rem 0' }}>👥 This Week's Participants ({lotteryParticipants.length})</h3>
              {lotteryParticipants.length === 0 ? (
                <p style={{ color: '#666' }}>No participants yet this week.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Their Numbers</th>
                        <th>Paid</th>
                        <th>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lotteryParticipants.map((p, i) => (
                        <tr key={p.id}>
                          <td>{i + 1}</td>
                          <td><strong>{p.first_name} {p.last_name}</strong></td>
                          <td>{p.email}</td>
                          <td>{p.phone || '-'}</td>
                          <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{p.user_numbers ? JSON.parse(p.user_numbers) : '-'}</td>
                          <td style={{ color: '#22c55e', fontWeight: 'bold' }}>${(p.amount_paid || 0).toFixed(2)}</td>
                          <td style={{ fontSize: '0.85rem' }}>{formatDate(p.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ background: '#f3f4f6', fontWeight: 'bold' }}>
                        <td colSpan={5}>Total</td>
                        <td style={{ color: '#22c55e' }}>${lotteryParticipants.reduce((sum, p) => sum + (p.amount_paid || 0), 0).toFixed(2)}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>

            {/* HISTORY SECTION */}
            <div className="admin-card" style={{ marginTop: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1rem 0' }}>📜 Pool History (All Weeks)</h3>
              {lotteryHistory.length === 0 ? (
                <p style={{ color: '#666' }}>No history yet.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Week</th>
                        <th>Status</th>
                        <th>Participants</th>
                        <th>Total</th>
                        <th>Numbers</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lotteryHistory.map((week) => (
                        <tr key={week.id} style={{ background: week.id === lotteryPoolWeek?.id ? '#fef3c7' : 'transparent' }}>
                          <td>
                            <strong>{new Date(week.week_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</strong>
                            <span style={{ color: '#666' }}> - </span>
                            <strong>{new Date(week.week_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
                            {week.id === lotteryPoolWeek?.id && <span style={{ marginLeft: '0.5rem', background: '#22c55e', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem' }}>CURRENT</span>}
                          </td>
                          <td>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '0.8rem',
                              background: week.status === 'open' ? '#dcfce7' : week.status === 'numbers_sent' ? '#dbeafe' : '#f3f4f6',
                              color: week.status === 'open' ? '#166534' : week.status === 'numbers_sent' ? '#1d4ed8' : '#666'
                            }}>
                              {week.status?.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ fontWeight: 'bold' }}>{week.total_participants || 0}</td>
                          <td style={{ color: '#22c55e', fontWeight: 'bold' }}>${(week.total_amount || 0).toFixed(2)}</td>
                          <td>{week.admin_numbers ? '✅' : '—'}</td>
                          <td>
                            <button 
                              onClick={() => viewHistoryWeek(week)}
                              style={{ padding: '0.4rem 0.8rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
                            >
                              👁️ View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* GROUPS */}
        {activeTab === 'groups' && (
          <>
            <div className="admin-header"><h1 className="admin-title">Groups ({groups.length})</h1><button style={btnPrimary} onClick={() => openModal('group')}>+ Add Group</button></div>
            
            {brokenGroups.length > 0 && (
              <div className="admin-card" style={{ marginBottom: '1rem', background: '#fef2f2', border: '1px solid #fecaca' }}>
                <h3 style={{ color: '#dc2626', margin: '0 0 1rem 0' }}>⚠️ Broken Links ({brokenGroups.length})</h3>
                <p style={{ color: '#991b1b', fontSize: '0.9rem', marginBottom: '1rem' }}>These groups have non-working WhatsApp links and are hidden from the site.</p>
                {brokenGroups.map(g => (
                  <div key={g.id} style={{ padding: '1rem', background: 'white', borderRadius: '8px', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <strong>{g.title}</strong>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>Broken: {g.brokenAt?.split('T')[0]}</div>
                      <code style={{ fontSize: '0.75rem', background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>{g.brokenLink}</code>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleRestoreGroup(g)} style={{ ...btnSuccess, padding: '0.4rem 0.8rem' }}>✅ Restore</button>
                      <button onClick={() => openModal('group', g)} style={{ padding: '0.4rem 0.8rem', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>✏️ Edit</button>
                      <button onClick={() => handleDelete('group', g.id)} style={{ ...btnDanger, padding: '0.4rem 0.8rem' }}>🗑️ Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="admin-card">
              <table className="admin-table"><thead><tr><th>Pin</th><th>📷</th><th>Title</th><th>Category</th><th>Location</th><th>Actions</th></tr></thead>
                <tbody>{groups.map(g => (<tr key={g.id} style={g.isPinned ? {background:'#fef3c7'} : {}}>
                  <td>{g.isPinned ? '⭐' : ''}</td>
                  <td>{g.imageUrl ? '✅' : '—'}</td>
                  <td><strong>{g.title}</strong></td>
                  <td>{groupCategories.find(c => c.id === g.categoryId)?.name || '-'}</td>
                  <td>{locations.find(l => l.id === g.locationId)?.neighborhood || '-'}</td>
                  <td><button className="action-btn edit" onClick={() => openModal('group', g)}>Edit</button><button className="action-btn delete" onClick={() => handleDelete('group', g.id)}>Delete</button></td>
                </tr>))}</tbody>
              </table>
            </div>
          </>
        )}

        {/* SERVICES */}
        {activeTab === 'services' && (
          <>
            <div className="admin-header"><h1 className="admin-title">Services ({services.length})</h1><button style={btnPrimary} onClick={() => openModal('service')}>+ Add Service</button></div>
            <div className="admin-card">
              <table className="admin-table"><thead><tr><th>Pin</th><th>📷</th><th>Name</th><th>Phone</th><th>Category</th><th>Actions</th></tr></thead>
                <tbody>{services.map(s => (<tr key={s.id} style={s.isPinned ? {background:'#fef3c7'} : {}}>
                  <td>{s.isPinned ? '⭐' : ''}</td>
                  <td>{(s.imageUrl || s.logoUrl) ? <img src={s.imageUrl || s.logoUrl} alt="" style={{width:'40px',height:'40px',objectFit:'cover',borderRadius:'4px'}} /> : '—'}</td>
                  <td><strong>{s.name}</strong></td>
                  <td>{s.phone}</td>
                  <td>{serviceCategories.find(c => c.id === s.categoryId)?.name || '-'}</td>
                  <td><button className="action-btn edit" onClick={() => openModal('service', s)}>Edit</button><button className="action-btn delete" onClick={() => handleDelete('service', s.id)}>Delete</button></td>
                </tr>))}</tbody>
              </table>
            </div>
          </>
        )}

        {/* BUSINESSES */}
        {activeTab === 'businesses' && (
          <>
            <div className="admin-header"><h1 className="admin-title">Businesses ({businesses.length})</h1><button style={btnPrimary} onClick={() => openModal('business')}>+ Add Business</button></div>
            <div className="admin-card">
              <table className="admin-table"><thead><tr><th>📷</th><th>Name</th><th>Category</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>{businesses.map(b => (<tr key={b.id} style={b.status === 'pending' ? {background:'#fef3c7'} : {}}>
                  <td>{b.logoUrl ? '✅' : '—'}</td>
                  <td><strong>{b.businessName}</strong><br/><small style={{color:'#666'}}>{b.phone}</small></td>
                  <td>{b.category}</td>
                  <td><span style={{padding:'4px 8px',borderRadius:'4px',background:b.status==='approved'?'#dcfce7':b.status==='pending'?'#fef3c7':'#fee2e2',color:b.status==='approved'?'#166534':b.status==='pending'?'#92400e':'#dc2626',fontSize:'0.8rem'}}>{b.status}</span></td>
                  <td>
                    {b.status === 'pending' && <button className="action-btn" style={{background:'#10b981',color:'white',marginRight:'0.25rem'}} onClick={async()=>{await fetch('/api/business',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({...b,status:'approved'})});fetchAll();}}>✅</button>}
                    <button className="action-btn edit" onClick={() => openModal('business', b)}>Edit</button>
                    <button className="action-btn delete" onClick={() => handleDelete('business', b.id)}>Delete</button>
                  </td>
                </tr>))}</tbody>
              </table>
            </div>
          </>
        )}

        {/* EVENTS */}
        {activeTab === 'events' && (
          <>
            <div className="admin-header"><h1 className="admin-title">Events ({events.length})</h1><button style={btnPrimary} onClick={() => openModal('event')}>+ Add Event</button></div>
            <div className="admin-card">
              <table className="admin-table"><thead><tr><th>Title</th><th>Date</th><th>Location</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>{events.map(e => {
                  const isExpired = e.date && new Date(e.date) < new Date();
                  return (<tr key={e.id} style={isExpired ? {opacity:0.5,background:'#f3f4f6'} : {}}>
                    <td><strong>{e.title}</strong></td>
                    <td>{e.date} {e.time}</td>
                    <td>{e.location}</td>
                    <td>{isExpired ? <span style={{color:'#ef4444'}}>Expired</span> : <span style={{color:'#10b981'}}>Active</span>}</td>
                    <td><button className="action-btn edit" onClick={() => openModal('event', e)}>Edit</button><button className="action-btn delete" onClick={() => handleDelete('event', e.id)}>Delete</button></td>
                  </tr>);
                })}</tbody>
              </table>
            </div>
          </>
        )}

        {/* CAMPAIGNS */}
        {activeTab === 'campaigns' && (
          <>
            <div className="admin-header"><h1 className="admin-title">Campaigns ({campaigns.length})</h1><button style={btnPrimary} onClick={() => openModal('campaign')}>+ Add Campaign</button></div>
            <div className="admin-card">
              <table className="admin-table"><thead><tr><th>Title</th><th>Goal</th><th>Raised</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>{campaigns.map(c => (<tr key={c.id}>
                  <td><strong>{c.title}</strong></td>
                  <td>${c.goal}</td>
                  <td>${c.raised || 0}</td>
                  <td><span style={{padding:'4px 8px',borderRadius:'4px',background:c.status==='active'?'#d1fae5':'#fee2e2'}}>{c.status}</span></td>
                  <td><button className="action-btn edit" onClick={() => openModal('campaign', c)}>Edit</button><button className="action-btn delete" onClick={() => handleDelete('campaign', c.id)}>Delete</button></td>
                </tr>))}</tbody>
              </table>
            </div>
          </>
        )}

        {/* GROUP CATEGORIES */}
        {activeTab === 'group-categories' && (
          <>
            <div className="admin-header"><h1 className="admin-title">Group Categories ({groupCategories.length})</h1><button style={btnPrimary} onClick={() => openModal('group-category')}>+ Add Category</button></div>
            <div className="admin-card">
              <table className="admin-table"><thead><tr><th>Icon</th><th>Name</th><th>Russian</th><th>Groups</th><th>Actions</th></tr></thead>
                <tbody>{groupCategories.sort((a,b)=>(a.order||0)-(b.order||0)).map(c => (<tr key={c.id}>
                  <td style={{fontSize:'1.5rem'}}>{c.icon}</td>
                  <td><strong>{c.name}</strong></td>
                  <td>{c.nameRu || '-'}</td>
                  <td>{groups.filter(g => g.categoryId === c.id).length}</td>
                  <td><button className="action-btn edit" onClick={() => openModal('group-category', c)}>Edit</button><button className="action-btn delete" onClick={() => handleDelete('group-category', c.id)}>Delete</button></td>
                </tr>))}</tbody>
              </table>
            </div>
          </>
        )}

        {/* SERVICE CATEGORIES */}
        {activeTab === 'service-categories' && (
          <>
            <div className="admin-header"><h1 className="admin-title">Service Types ({serviceCategories.length})</h1><button style={btnPrimary} onClick={() => openModal('service-category')}>+ Add Type</button></div>
            <div className="admin-card">
              <table className="admin-table"><thead><tr><th>Icon</th><th>Name</th><th>Russian</th><th>Services</th><th>Actions</th></tr></thead>
                <tbody>{serviceCategories.sort((a,b)=>(a.order||0)-(b.order||0)).map(c => (<tr key={c.id}>
                  <td style={{fontSize:'1.5rem'}}>{c.icon}</td>
                  <td><strong>{c.name}</strong></td>
                  <td>{c.nameRu || '-'}</td>
                  <td>{services.filter(s => s.categoryId === c.id).length}</td>
                  <td><button className="action-btn edit" onClick={() => openModal('service-category', c)}>Edit</button><button className="action-btn delete" onClick={() => handleDelete('service-category', c.id)}>Delete</button></td>
                </tr>))}</tbody>
              </table>
            </div>
          </>
        )}

        {/* LOCATIONS */}
        {activeTab === 'locations' && (
          <>
            <div className="admin-header"><h1 className="admin-title">Locations ({locations.length})</h1><button style={btnPrimary} onClick={() => openModal('location')}>+ Add Location</button></div>
            <div className="admin-card">
              <table className="admin-table"><thead><tr><th>Neighborhood</th><th>City</th><th>State</th><th>Groups</th><th>Actions</th></tr></thead>
                <tbody>{locations.map(l => (<tr key={l.id}>
                  <td><strong>{l.neighborhood}</strong></td>
                  <td>{l.city}</td>
                  <td>{l.state}</td>
                  <td>{groups.filter(g => g.locationId === l.id).length}</td>
                  <td><button className="action-btn edit" onClick={() => openModal('location', l)}>Edit</button><button className="action-btn delete" onClick={() => handleDelete('location', l.id)}>Delete</button></td>
                </tr>))}</tbody>
              </table>
            </div>
          </>
        )}

        {/* USERS */}
        {activeTab === 'users' && (
          <>
            <div className="admin-header"><h1 className="admin-title">Users ({users.length})</h1></div>
            <div className="admin-card">
              <table className="admin-table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
                <tbody>{users.map(u => (<tr key={u.email} style={u.role==='admin'?{background:'#dbeafe'}:{}}>
                  <td><strong>{u.name}</strong></td>
                  <td>{u.email}</td>
                  <td><span style={{padding:'4px 8px',borderRadius:'4px',background:u.role==='admin'?'#2563eb':'#e5e7eb',color:u.role==='admin'?'white':'#333'}}>{u.role==='admin'?'👑 Admin':'User'}</span></td>
                  <td><button className="action-btn edit" onClick={() => handleToggleAdmin(u)}>{u.role==='admin'?'Remove Admin':'Make Admin'}</button></td>
                </tr>))}</tbody>
              </table>
            </div>
          </>
        )}

        {/* REPORTS */}
        {activeTab === 'reports' && (
          <>
            <div className="admin-header"><h1 className="admin-title">Reports ({reports.length})</h1></div>
            <div className="admin-card">
              {reports.length === 0 ? <p style={{color:'#666'}}>No reports yet</p> : (
                <table className="admin-table"><thead><tr><th>Group</th><th>Reason</th><th>Reported By</th><th>Date</th></tr></thead>
                  <tbody>{reports.map((r:any) => (<tr key={r.id}>
                    <td>{groups.find(g => g.id === r.groupId)?.title || 'Unknown'}</td>
                    <td>{r.reason}</td>
                    <td>{r.userEmail}</td>
                    <td>{r.createdAt?.split('T')[0]}</td>
                  </tr>))}</tbody>
                </table>
              )}
            </div>
          </>
        )}
      </main>

      {/* MODAL */}
      {showModal && editingItem && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
          <div style={{background:'white',borderRadius:'12px',padding:'2rem',width:'90%',maxWidth:'600px',maxHeight:'90vh',overflow:'auto'}}>
            <h2>{isNew ? 'Add' : 'Edit'} {modalType.replace('-', ' ')}</h2>
            <div style={{display:'flex',flexDirection:'column',gap:'1rem',marginTop:'1rem'}}>
              
              {modalType === 'group' && (<>
                <div><label style={labelStyle}>Title *</label><input style={inputStyle} value={editingItem.title||''} onChange={e=>setEditingItem({...editingItem,title:e.target.value})} /></div>
                <div><label style={labelStyle}>Description</label><textarea style={inputStyle} rows={3} value={editingItem.description||''} onChange={e=>setEditingItem({...editingItem,description:e.target.value})} /></div>
                <div><label style={labelStyle}>WhatsApp Links</label>{(editingItem.whatsappLinks||['']).map((link:string,i:number)=>(<div key={i} style={{display:'flex',gap:'0.5rem',marginBottom:'0.5rem'}}><input style={{...inputStyle,flex:1}} value={link} onChange={e=>{const links=[...(editingItem.whatsappLinks||[''])];links[i]=e.target.value;setEditingItem({...editingItem,whatsappLinks:links});}} placeholder="https://chat.whatsapp.com/..." />{(editingItem.whatsappLinks||[]).length>1&&<button onClick={()=>{const links=(editingItem.whatsappLinks||[]).filter((_:any,idx:number)=>idx!==i);setEditingItem({...editingItem,whatsappLinks:links});}} style={{padding:'0.5rem',border:'1px solid #ddd',borderRadius:'4px',cursor:'pointer'}}>✕</button>}</div>))}<button onClick={()=>setEditingItem({...editingItem,whatsappLinks:[...(editingItem.whatsappLinks||['']),'']})}>+ Add Link</button></div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}><div><label style={labelStyle}>Category</label><select style={inputStyle} value={editingItem.categoryId} onChange={e=>setEditingItem({...editingItem,categoryId:e.target.value})}>{groupCategories.map(c=><option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}</select></div><div><label style={labelStyle}>Location</label><select style={inputStyle} value={editingItem.locationId} onChange={e=>setEditingItem({...editingItem,locationId:e.target.value})}>{locations.map(l=><option key={l.id} value={l.id}>{l.neighborhood}</option>)}</select></div></div>
                <div><label style={labelStyle}>📷 Group Image</label><div onDragOver={handleDragOver} onDrop={handleDrop} style={{border:'2px dashed #ddd',borderRadius:'8px',padding:'1rem',textAlign:'center',background:'#fafafa'}}>{(imagePreview || editingItem.imageUrl) ? (<div><img src={imagePreview || editingItem.imageUrl} alt='Preview' style={{maxWidth:'100%',maxHeight:'150px',borderRadius:'8px'}} /><br/><button type='button' onClick={()=>{setImagePreview('');setEditingItem({...editingItem,imageUrl:''});}} style={{marginTop:'0.5rem',padding:'0.25rem 0.75rem',background:'#fee2e2',color:'#dc2626',border:'none',borderRadius:'4px',cursor:'pointer'}}>✕ Remove</button></div>) : (<label style={{cursor:'pointer',display:'block'}}><input type='file' accept='image/*' onChange={handleImageUpload} style={{display:'none'}} /><span style={{color:'#666'}}>📎 Click or drag image here</span></label>)}</div></div>
                <div><label><input type="checkbox" checked={editingItem.isPinned||false} onChange={e=>setEditingItem({...editingItem,isPinned:e.target.checked})} /> ⭐ Pin to top</label></div>
              </>)}

              {modalType === 'service' && (<>
                <div><label style={labelStyle}>Name *</label><input style={inputStyle} value={editingItem.name||''} onChange={e=>setEditingItem({...editingItem,name:e.target.value})} /></div>
                <div><label style={labelStyle}>Phone *</label><input style={inputStyle} value={editingItem.phone||''} onChange={e=>setEditingItem({...editingItem,phone:e.target.value})} /></div>
                <div><label style={labelStyle}>Description</label><textarea style={inputStyle} rows={3} value={editingItem.description||''} onChange={e=>setEditingItem({...editingItem,description:e.target.value})} /></div>
                <div><label style={labelStyle}>Category</label><select style={inputStyle} value={editingItem.categoryId} onChange={e=>setEditingItem({...editingItem,categoryId:e.target.value})}>{serviceCategories.map(c=><option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}</select></div>
                <div><label style={labelStyle}>📍 Address</label><input style={inputStyle} value={editingItem.address||''} onChange={e=>setEditingItem({...editingItem,address:e.target.value})} /></div>
                <div><label style={labelStyle}>✉️ Email</label><input style={inputStyle} type="email" value={editingItem.email||''} onChange={e=>setEditingItem({...editingItem,email:e.target.value})} /></div>
                <div><label style={labelStyle}>🌐 Website</label><input style={inputStyle} value={editingItem.website||''} onChange={e=>setEditingItem({...editingItem,website:e.target.value})} /></div>
                <div><label style={labelStyle}>📷 Logo</label><div onDragOver={handleDragOver} onDrop={handleDrop} style={{border:'2px dashed #ddd',borderRadius:'8px',padding:'1rem',textAlign:'center',background:'#fafafa'}}>{(imagePreview || editingItem.imageUrl || editingItem.logoUrl) ? (<div><img src={imagePreview || editingItem.imageUrl || editingItem.logoUrl} alt='Preview' style={{maxWidth:'100%',maxHeight:'150px',borderRadius:'8px'}} /><br/><button type='button' onClick={()=>{setImagePreview('');setEditingItem({...editingItem,imageUrl:'',logoUrl:''});}} style={{marginTop:'0.5rem',padding:'0.25rem 0.75rem',background:'#fee2e2',color:'#dc2626',border:'none',borderRadius:'4px',cursor:'pointer'}}>✕ Remove</button></div>) : (<label style={{cursor:'pointer',display:'block'}}><input type='file' accept='image/*' onChange={handleImageUpload} style={{display:'none'}} /><span style={{color:'#666'}}>📎 Click or drag image</span></label>)}</div></div>
                <div><label><input type="checkbox" checked={editingItem.isPinned||false} onChange={e=>setEditingItem({...editingItem,isPinned:e.target.checked})} /> ⭐ Pin to top</label></div>
              </>)}

              {modalType === 'business' && (<>
                <div><label style={labelStyle}>Business Name *</label><input style={inputStyle} value={editingItem.businessName||''} onChange={e=>setEditingItem({...editingItem,businessName:e.target.value})} /></div>
                <div><label style={labelStyle}>Phone *</label><input style={inputStyle} value={editingItem.phone||''} onChange={e=>setEditingItem({...editingItem,phone:e.target.value})} /></div>
                <div><label style={labelStyle}>Email</label><input style={inputStyle} type="email" value={editingItem.email||''} onChange={e=>setEditingItem({...editingItem,email:e.target.value})} /></div>
                <div><label style={labelStyle}>Description</label><textarea style={inputStyle} rows={3} value={editingItem.description||''} onChange={e=>setEditingItem({...editingItem,description:e.target.value})} /></div>
                <div><label style={labelStyle}>Category</label><input style={inputStyle} value={editingItem.category||''} onChange={e=>setEditingItem({...editingItem,category:e.target.value})} /></div>
                <div><label style={labelStyle}>Website</label><input style={inputStyle} value={editingItem.website||''} onChange={e=>setEditingItem({...editingItem,website:e.target.value})} /></div>
                <div><label style={labelStyle}>📷 Logo</label><div onDragOver={handleDragOver} onDrop={handleDrop} style={{border:'2px dashed #ddd',borderRadius:'8px',padding:'1rem',textAlign:'center',background:'#fafafa'}}>{(imagePreview || editingItem.logoUrl) ? (<div><img src={imagePreview || editingItem.logoUrl} alt='Preview' style={{maxWidth:'100%',maxHeight:'150px',borderRadius:'8px'}} /><br/><button type='button' onClick={()=>{setImagePreview('');setEditingItem({...editingItem,logoUrl:''});}} style={{marginTop:'0.5rem',padding:'0.25rem 0.75rem',background:'#fee2e2',color:'#dc2626',border:'none',borderRadius:'4px',cursor:'pointer'}}>✕ Remove</button></div>) : (<label style={{cursor:'pointer',display:'block'}}><input type='file' accept='image/*' onChange={handleImageUpload} style={{display:'none'}} /><span style={{color:'#666'}}>📎 Click or drag image</span></label>)}</div></div>
                <div><label style={labelStyle}>Status</label><select style={inputStyle} value={editingItem.status||'pending'} onChange={e=>setEditingItem({...editingItem,status:e.target.value})}><option value="pending">Pending</option><option value="approved">Approved</option></select></div>
              </>)}

              {modalType === 'event' && (<>
                <div><label style={labelStyle}>Title *</label><input style={inputStyle} value={editingItem.title||''} onChange={e=>setEditingItem({...editingItem,title:e.target.value})} /></div>
                <div><label style={labelStyle}>Description</label><textarea style={inputStyle} rows={3} value={editingItem.description||''} onChange={e=>setEditingItem({...editingItem,description:e.target.value})} /></div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}><div><label style={labelStyle}>Date *</label><input style={inputStyle} type="date" value={editingItem.date||''} onChange={e=>setEditingItem({...editingItem,date:e.target.value})} /></div><div><label style={labelStyle}>Time</label><input style={inputStyle} value={editingItem.time||''} onChange={e=>setEditingItem({...editingItem,time:e.target.value})} placeholder="7:00 PM" /></div></div>
                <div><label style={labelStyle}>Location</label><input style={inputStyle} value={editingItem.location||''} onChange={e=>setEditingItem({...editingItem,location:e.target.value})} /></div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}><div><label style={labelStyle}>Organizer</label><input style={inputStyle} value={editingItem.organizer||''} onChange={e=>setEditingItem({...editingItem,organizer:e.target.value})} /></div><div><label style={labelStyle}>Contact Phone</label><input style={inputStyle} value={editingItem.contactPhone||''} onChange={e=>setEditingItem({...editingItem,contactPhone:e.target.value})} /></div></div>
              </>)}

              {modalType === 'campaign' && (<>
                <div><label style={labelStyle}>Title *</label><input style={inputStyle} value={editingItem.title||''} onChange={e=>setEditingItem({...editingItem,title:e.target.value})} /></div>
                <div><label style={labelStyle}>Description</label><textarea style={inputStyle} rows={3} value={editingItem.description||''} onChange={e=>setEditingItem({...editingItem,description:e.target.value})} /></div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}><div><label style={labelStyle}>Goal ($)</label><input style={inputStyle} type="number" value={editingItem.goal||0} onChange={e=>setEditingItem({...editingItem,goal:Number(e.target.value)})} /></div><div><label style={labelStyle}>Raised ($)</label><input style={inputStyle} type="number" value={editingItem.raised||0} onChange={e=>setEditingItem({...editingItem,raised:Number(e.target.value)})} /></div></div>
                <div><label style={labelStyle}>Donation Link</label><input style={inputStyle} value={editingItem.donationLink||''} onChange={e=>setEditingItem({...editingItem,donationLink:e.target.value})} /></div>
                <div><label style={labelStyle}>Status</label><select style={inputStyle} value={editingItem.status||'active'} onChange={e=>setEditingItem({...editingItem,status:e.target.value})}><option value="active">Active</option><option value="completed">Completed</option><option value="paused">Paused</option></select></div>
              </>)}

              {(modalType === 'group-category' || modalType === 'service-category') && (<>
                <div><label style={labelStyle}>Icon</label><input style={inputStyle} value={editingItem.icon||''} onChange={e=>setEditingItem({...editingItem,icon:e.target.value})} /></div>
                <div><label style={labelStyle}>Name *</label><input style={inputStyle} value={editingItem.name||''} onChange={e=>setEditingItem({...editingItem,name:e.target.value})} /></div>
                <div><label style={labelStyle}>Russian Name</label><input style={inputStyle} value={editingItem.nameRu||''} onChange={e=>setEditingItem({...editingItem,nameRu:e.target.value})} /></div>
              </>)}

              {modalType === 'location' && (<>
                <div><label style={labelStyle}>Neighborhood *</label><input style={inputStyle} value={editingItem.neighborhood||''} onChange={e=>setEditingItem({...editingItem,neighborhood:e.target.value})} /></div>
                <div><label style={labelStyle}>City</label><input style={inputStyle} value={editingItem.city||''} onChange={e=>setEditingItem({...editingItem,city:e.target.value})} /></div>
                <div><label style={labelStyle}>State</label><input style={inputStyle} value={editingItem.state||''} onChange={e=>setEditingItem({...editingItem,state:e.target.value})} /></div>
              </>)}

            </div>
            <div style={{display:'flex',gap:'1rem',marginTop:'1.5rem'}}>
              <button onClick={closeModal} style={{flex:1,padding:'0.75rem',border:'1px solid #ddd',borderRadius:'8px',background:'white',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{...btnPrimary,flex:1,opacity:saving?0.7:1}}>{saving?'Saving...':'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* LOTTERY HISTORY MODAL */}
      {showHistoryModal && selectedHistoryWeek && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
          <div style={{background:'white',borderRadius:'12px',padding:'2rem',width:'95%',maxWidth:'900px',maxHeight:'90vh',overflow:'auto'}}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>
                📜 Pool Week: {new Date(selectedHistoryWeek.week_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(selectedHistoryWeek.week_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </h2>
              <button onClick={() => setShowHistoryModal(false)} style={{ padding: '0.5rem 1rem', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', background: 'white' }}>✕ Close</button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>Status</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#22c55e' }}>{selectedHistoryWeek.status?.toUpperCase()}</div>
              </div>
              <div style={{ background: '#fef3c7', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>Participants</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#92400e' }}>{historyParticipants.length}</div>
              </div>
              <div style={{ background: '#dcfce7', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>Total</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#166534' }}>${historyParticipants.reduce((sum, p) => sum + (p.amount_paid || 0), 0).toFixed(2)}</div>
              </div>
            </div>

            {/* Numbers */}
            {selectedHistoryWeek.admin_numbers && (
              <div style={{ background: '#fef3c7', border: '2px solid #fcd34d', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <h3 style={{ color: '#92400e', margin: '0 0 1rem 0' }}>🎱 Lottery Numbers</h3>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.95rem', background: 'white', padding: '1rem', borderRadius: '8px' }}>{selectedHistoryWeek.admin_numbers}</pre>
              </div>
            )}

            {/* Participants Table */}
            <div>
              <h3 style={{ margin: '0 0 1rem 0' }}>👥 Participants</h3>
              {historyParticipants.length === 0 ? (
                <p style={{ color: '#666' }}>No participants in this week.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Their Numbers</th>
                        <th>Paid</th>
                        <th>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyParticipants.map((p, i) => (
                        <tr key={p.id}>
                          <td>{i + 1}</td>
                          <td><strong>{p.first_name} {p.last_name}</strong></td>
                          <td>{p.email}</td>
                          <td>{p.phone || '-'}</td>
                          <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{p.user_numbers ? JSON.parse(p.user_numbers) : '-'}</td>
                          <td style={{ color: '#22c55e', fontWeight: 'bold' }}>${(p.amount_paid || 0).toFixed(2)}</td>
                          <td style={{ fontSize: '0.85rem' }}>{formatDate(p.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Export Button */}
            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <button 
                onClick={() => {
                  const data = historyParticipants.map((p, i) => 
                    `${i+1}. ${p.first_name} ${p.last_name} | ${p.email} | ${p.phone || '-'} | $${p.amount_paid}`
                  ).join('\n');
                  const full = `Week: ${new Date(selectedHistoryWeek.week_start).toLocaleDateString()} - ${new Date(selectedHistoryWeek.week_end).toLocaleDateString()}\n\nNumbers:\n${selectedHistoryWeek.admin_numbers || 'Not set'}\n\nParticipants:\n${data}`;
                  navigator.clipboard.writeText(full);
                  alert('Copied to clipboard!');
                }}
                style={{ padding: '0.75rem 1.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                📋 Copy All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
