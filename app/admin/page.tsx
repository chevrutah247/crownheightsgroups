'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Tab = 'suggestions' | 'groups' | 'services' | 'events' | 'campaigns' | 'group-categories' | 'service-categories' | 'locations' | 'users' | 'reports';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('suggestions');
  const [groups, setGroups] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [groupCategories, setGroupCategories] = useState<any[]>([]);
  const [serviceCategories, setServiceCategories] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  
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
      fetch('/api/events').then(r => r.json()).then(d => setEvents(Array.isArray(d) ? d : [])).catch(() => {}),
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
    ]);
    setLoading(false);
  };

  // Open modal for editing/creating
  const openModal = (type: string, item?: any) => {
    setModalType(type);
    setIsNew(!item);
    if (item) {
      setEditingItem({ ...item });
    } else {
      // Default values for new items
      if (type === 'group') setEditingItem({ title: '', description: '', whatsappLinks: [''], categoryId: groupCategories[0]?.id || '1', locationId: locations[0]?.id || '1', language: 'English', isPinned: false });
      if (type === 'service') setEditingItem({ name: '', phone: '', description: '', categoryId: serviceCategories[0]?.id || '1', languages: ['English'], isPinned: false });
      if (type === 'event') setEditingItem({ title: '', description: '', date: '', time: '', location: '', organizer: '', contactPhone: '', link: '' });
      if (type === 'campaign') setEditingItem({ title: '', description: '', goal: 0, raised: 0, donationLink: '', organizer: '', status: 'active' });
      if (type === 'group-category') setEditingItem({ name: '', nameRu: '', icon: '📁', order: groupCategories.length });
      if (type === 'service-category') setEditingItem({ name: '', nameRu: '', icon: '🔧', order: serviceCategories.length });
      if (type === 'location') setEditingItem({ neighborhood: '', city: 'Brooklyn', state: 'NY', country: 'USA', order: locations.length });
    }
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditingItem(null); };

  // Save item
  const handleSave = async () => {
    setSaving(true);
    let endpoint = '';
    let method = isNew ? 'POST' : 'PUT';
    
    if (modalType === 'group') endpoint = '/api/admin/groups';
    if (modalType === 'service') endpoint = '/api/admin/services';
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

  // Delete item
  const handleDelete = async (type: string, id: string) => {
    if (!confirm('Delete this item?')) return;
    let endpoint = '';
    if (type === 'group') endpoint = '/api/admin/groups';
    if (type === 'service') endpoint = '/api/admin/services';
    if (type === 'event') endpoint = '/api/events';
    if (type === 'campaign') endpoint = '/api/campaigns';
    if (type === 'group-category') endpoint = '/api/admin/group-categories';
    if (type === 'service-category') endpoint = '/api/admin/service-categories';
    if (type === 'location') endpoint = '/api/admin/locations';
    
    await fetch(endpoint, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    fetchAll();
  };

  // Approve/Reject suggestions
  const handleApprove = async (type: string, item: any) => {
    await fetch(`/api/suggest-${type}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: item.id, action: 'approve' }) });
    fetchAll();
  };

  const handleReject = async (type: string, id: string) => {
    await fetch(`/api/suggest-${type}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action: 'reject' }) });
    fetchAll();
  };

  // Toggle user admin
  const handleToggleAdmin = async (user: any) => {
    if (!confirm(`${user.role === 'admin' ? 'Remove' : 'Make'} admin?`)) return;
    await fetch('/api/admin/users', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: user.email, role: user.role === 'admin' ? 'user' : 'admin' }) });
    fetchAll();
  };

  // Counts
  const pendingGroups = groupSuggestions.filter(s => s.status === 'pending');
  const pendingServices = serviceSuggestions.filter(s => s.status === 'pending');
  const pendingEvents = eventSuggestions.filter(s => s.status === 'pending');
  const pendingCampaigns = campaignSuggestions.filter(s => s.status === 'pending');
  const pendingLocations = locationSuggestions.filter(s => s.status === 'pending');
  const totalPending = pendingGroups.length + pendingServices.length + pendingEvents.length + pendingCampaigns.length + pendingLocations.length;

  const inputStyle: React.CSSProperties = { width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' };
  const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' };
  const btnPrimary: React.CSSProperties = { padding: '0.75rem 1.5rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
  const btnDanger: React.CSSProperties = { padding: '0.5rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' };
  const btnSuccess: React.CSSProperties = { padding: '0.5rem 1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginRight: '0.5rem' };

  const navItems = [
    { id: 'suggestions' as Tab, label: 'Suggestions', icon: '📬', badge: totalPending },
    { id: 'groups' as Tab, label: 'Groups', icon: '👥' },
    { id: 'services' as Tab, label: 'Services', icon: '🔧' },
    { id: 'events' as Tab, label: 'Events', icon: '📅' },
    { id: 'campaigns' as Tab, label: 'Campaigns', icon: '💝' },
    { id: 'group-categories' as Tab, label: 'Group Categories', icon: '📁' },
    { id: 'service-categories' as Tab, label: 'Service Types', icon: '🏷️' },
    { id: 'locations' as Tab, label: 'Locations', icon: '📍' },
    { id: 'users' as Tab, label: 'Users', icon: '👤' },
    { id: 'reports' as Tab, label: 'Reports', icon: '⚠️', badge: reports.length },
  ];

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
                {item.badge ? <span style={{ marginLeft: 'auto', background: '#ef4444', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem' }}>{item.badge}</span> : null}
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

        {/* GROUPS */}
        {activeTab === 'groups' && (
          <>
            <div className="admin-header"><h1 className="admin-title">Groups ({groups.length})</h1><button style={btnPrimary} onClick={() => openModal('group')}>+ Add Group</button></div>
            <div className="admin-card">
              <table className="admin-table"><thead><tr><th>Pin</th><th>Title</th><th>Category</th><th>Location</th><th>Actions</th></tr></thead>
                <tbody>{groups.map(g => (<tr key={g.id} style={g.isPinned ? {background:'#fef3c7'} : {}}>
                  <td>{g.isPinned ? '⭐' : ''}</td>
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
              <table className="admin-table"><thead><tr><th>Pin</th><th>Name</th><th>Phone</th><th>Category</th><th>Actions</th></tr></thead>
                <tbody>{services.map(s => (<tr key={s.id} style={s.isPinned ? {background:'#fef3c7'} : {}}>
                  <td>{s.isPinned ? '⭐' : ''}</td>
                  <td><strong>{s.name}</strong></td>
                  <td>{s.phone}</td>
                  <td>{serviceCategories.find(c => c.id === s.categoryId)?.name || '-'}</td>
                  <td><button className="action-btn edit" onClick={() => openModal('service', s)}>Edit</button><button className="action-btn delete" onClick={() => handleDelete('service', s.id)}>Delete</button></td>
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
              
              {/* Group fields */}
              {modalType === 'group' && (<>
                <div><label style={labelStyle}>Title *</label><input style={inputStyle} value={editingItem.title||''} onChange={e=>setEditingItem({...editingItem,title:e.target.value})} /></div>
                <div><label style={labelStyle}>Description</label><textarea style={inputStyle} rows={3} value={editingItem.description||''} onChange={e=>setEditingItem({...editingItem,description:e.target.value})} /></div>
                <div><label style={labelStyle}>WhatsApp Links</label>{(editingItem.whatsappLinks||['']).map((link:string,i:number)=>(<div key={i} style={{display:'flex',gap:'0.5rem',marginBottom:'0.5rem'}}><input style={{...inputStyle,flex:1}} value={link} onChange={e=>{const links=[...(editingItem.whatsappLinks||[''])];links[i]=e.target.value;setEditingItem({...editingItem,whatsappLinks:links});}} placeholder="https://chat.whatsapp.com/..." />{(editingItem.whatsappLinks||[]).length>1&&<button onClick={()=>{const links=(editingItem.whatsappLinks||[]).filter((_:any,idx:number)=>idx!==i);setEditingItem({...editingItem,whatsappLinks:links});}} style={{padding:'0.5rem',border:'1px solid #ddd',borderRadius:'4px',cursor:'pointer'}}>✕</button>}</div>))}<button onClick={()=>setEditingItem({...editingItem,whatsappLinks:[...(editingItem.whatsappLinks||['']),'']})}>+ Add Link</button></div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}><div><label style={labelStyle}>Category</label><select style={inputStyle} value={editingItem.categoryId} onChange={e=>setEditingItem({...editingItem,categoryId:e.target.value})}>{groupCategories.map(c=><option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}</select></div><div><label style={labelStyle}>Location</label><select style={inputStyle} value={editingItem.locationId} onChange={e=>setEditingItem({...editingItem,locationId:e.target.value})}>{locations.map(l=><option key={l.id} value={l.id}>{l.neighborhood}</option>)}</select></div></div>
                <div><label><input type="checkbox" checked={editingItem.isPinned||false} onChange={e=>setEditingItem({...editingItem,isPinned:e.target.checked})} /> ⭐ Pin to top</label></div>
              </>)}

              {/* Service fields */}
              {modalType === 'service' && (<>
                <div><label style={labelStyle}>Name *</label><input style={inputStyle} value={editingItem.name||''} onChange={e=>setEditingItem({...editingItem,name:e.target.value})} /></div>
                <div><label style={labelStyle}>Phone *</label><input style={inputStyle} value={editingItem.phone||''} onChange={e=>setEditingItem({...editingItem,phone:e.target.value})} /></div>
                <div><label style={labelStyle}>Description</label><textarea style={inputStyle} rows={3} value={editingItem.description||''} onChange={e=>setEditingItem({...editingItem,description:e.target.value})} /></div>
                <div><label style={labelStyle}>Category</label><select style={inputStyle} value={editingItem.categoryId} onChange={e=>setEditingItem({...editingItem,categoryId:e.target.value})}>{serviceCategories.map(c=><option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}</select></div>
                <div><label><input type="checkbox" checked={editingItem.isPinned||false} onChange={e=>setEditingItem({...editingItem,isPinned:e.target.checked})} /> ⭐ Pin to top</label></div>
              </>)}

              {/* Event fields */}
              {modalType === 'event' && (<>
                <div><label style={labelStyle}>Title *</label><input style={inputStyle} value={editingItem.title||''} onChange={e=>setEditingItem({...editingItem,title:e.target.value})} /></div>
                <div><label style={labelStyle}>Description</label><textarea style={inputStyle} rows={3} value={editingItem.description||''} onChange={e=>setEditingItem({...editingItem,description:e.target.value})} /></div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}><div><label style={labelStyle}>Date *</label><input style={inputStyle} type="date" value={editingItem.date||''} onChange={e=>setEditingItem({...editingItem,date:e.target.value})} /></div><div><label style={labelStyle}>Time</label><input style={inputStyle} value={editingItem.time||''} onChange={e=>setEditingItem({...editingItem,time:e.target.value})} placeholder="7:00 PM" /></div></div>
                <div><label style={labelStyle}>Location</label><input style={inputStyle} value={editingItem.location||''} onChange={e=>setEditingItem({...editingItem,location:e.target.value})} /></div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}><div><label style={labelStyle}>Organizer</label><input style={inputStyle} value={editingItem.organizer||''} onChange={e=>setEditingItem({...editingItem,organizer:e.target.value})} /></div><div><label style={labelStyle}>Contact Phone</label><input style={inputStyle} value={editingItem.contactPhone||''} onChange={e=>setEditingItem({...editingItem,contactPhone:e.target.value})} /></div></div>
              </>)}

              {/* Campaign fields */}
              {modalType === 'campaign' && (<>
                <div><label style={labelStyle}>Title *</label><input style={inputStyle} value={editingItem.title||''} onChange={e=>setEditingItem({...editingItem,title:e.target.value})} /></div>
                <div><label style={labelStyle}>Description</label><textarea style={inputStyle} rows={3} value={editingItem.description||''} onChange={e=>setEditingItem({...editingItem,description:e.target.value})} /></div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}><div><label style={labelStyle}>Goal ($)</label><input style={inputStyle} type="number" value={editingItem.goal||0} onChange={e=>setEditingItem({...editingItem,goal:Number(e.target.value)})} /></div><div><label style={labelStyle}>Raised ($)</label><input style={inputStyle} type="number" value={editingItem.raised||0} onChange={e=>setEditingItem({...editingItem,raised:Number(e.target.value)})} /></div></div>
                <div><label style={labelStyle}>Donation Link</label><input style={inputStyle} value={editingItem.donationLink||''} onChange={e=>setEditingItem({...editingItem,donationLink:e.target.value})} /></div>
                <div><label style={labelStyle}>Status</label><select style={inputStyle} value={editingItem.status||'active'} onChange={e=>setEditingItem({...editingItem,status:e.target.value})}><option value="active">Active</option><option value="completed">Completed</option><option value="paused">Paused</option></select></div>
              </>)}

              {/* Category fields */}
              {(modalType === 'group-category' || modalType === 'service-category') && (<>
                <div><label style={labelStyle}>Icon</label><input style={inputStyle} value={editingItem.icon||''} onChange={e=>setEditingItem({...editingItem,icon:e.target.value})} /></div>
                <div><label style={labelStyle}>Name *</label><input style={inputStyle} value={editingItem.name||''} onChange={e=>setEditingItem({...editingItem,name:e.target.value})} /></div>
                <div><label style={labelStyle}>Russian Name</label><input style={inputStyle} value={editingItem.nameRu||''} onChange={e=>setEditingItem({...editingItem,nameRu:e.target.value})} /></div>
              </>)}

              {/* Location fields */}
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
    </div>
  );
}