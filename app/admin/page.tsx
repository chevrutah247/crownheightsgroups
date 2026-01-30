'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Tab = 'dashboard' | 'groups' | 'users' | 'services' | 'group-categories' | 'service-categories' | 'locations' | 'suggestions' | 'reports';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [groups, setGroups] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [groupCategories, setGroupCategories] = useState<any[]>([]);
  const [serviceCategories, setServiceCategories] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [groupSuggestions, setGroupSuggestions] = useState<any[]>([]);
  const [serviceSuggestions, setServiceSuggestions] = useState<any[]>([]);
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [editingGroup, setEditingGroup] = useState<any>(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [isNewGroup, setIsNewGroup] = useState(false);
  const [groupError, setGroupError] = useState('');
  const [suggestedTitle, setSuggestedTitle] = useState('');
  
  const [editingService, setEditingService] = useState<any>(null);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [isNewService, setIsNewService] = useState(false);

  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [categoryType, setCategoryType] = useState<'group' | 'service'>('group');

  const [editingLocation, setEditingLocation] = useState<any>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [isNewLocation, setIsNewLocation] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    await Promise.all([
      fetchGroups(), fetchUsers(), fetchServices(),
      fetchGroupCategories(), fetchServiceCategories(), fetchLocations(),
      fetchGroupSuggestions(), fetchServiceSuggestions(), fetchLocationSuggestions(), fetchReports()
    ]);
    setLoading(false);
  };

  const fetchGroups = async () => { try { const r = await fetch('/api/admin/groups'); const d = await r.json(); setGroups(Array.isArray(d) ? d : []); } catch (e) {} };
  const fetchUsers = async () => { try { const r = await fetch('/api/admin/users'); const d = await r.json(); setUsers(Array.isArray(d) ? d : []); } catch (e) {} };
  const fetchServices = async () => { try { const r = await fetch('/api/admin/services'); const d = await r.json(); setServices(Array.isArray(d) ? d : []); } catch (e) {} };
  const fetchGroupCategories = async () => { try { const r = await fetch('/api/admin/group-categories'); const d = await r.json(); setGroupCategories(Array.isArray(d) ? d : []); } catch (e) {} };
  const fetchServiceCategories = async () => { try { const r = await fetch('/api/admin/service-categories'); const d = await r.json(); setServiceCategories(Array.isArray(d) ? d : []); } catch (e) {} };
  const fetchLocations = async () => { try { const r = await fetch('/api/admin/locations'); const d = await r.json(); setLocations(Array.isArray(d) ? d : []); } catch (e) {} };
  const fetchGroupSuggestions = async () => { try { const r = await fetch('/api/suggest-group'); const d = await r.json(); setGroupSuggestions(Array.isArray(d) ? d : []); } catch (e) {} };
  const fetchServiceSuggestions = async () => { try { const r = await fetch('/api/suggest-service'); const d = await r.json(); setServiceSuggestions(Array.isArray(d) ? d : []); } catch (e) {} };
  const fetchLocationSuggestions = async () => { try { const r = await fetch('/api/location-suggestions'); const d = await r.json(); setLocationSuggestions(Array.isArray(d) ? d : []); } catch (e) {} };
  const fetchReports = async () => { try { const r = await fetch('/api/reports'); const d = await r.json(); setReports(Array.isArray(d) ? d : []); } catch (e) {} };

  const handleToggleAdmin = async (u: any) => { if (!confirm('Change role?')) return; await fetch('/api/admin/users', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: u.email, role: u.role === 'admin' ? 'user' : 'admin' }) }); fetchUsers(); };
  const handleDeleteUser = async (email: string) => { if (!confirm('Delete?')) return; await fetch('/api/admin/users', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) }); fetchUsers(); };

  const handleNewGroup = () => { setEditingGroup({ id: '', title: '', description: '', whatsappLinks: [''], telegramLink: '', facebookLink: '', twitterLink: '', websiteLink: '', categoryId: groupCategories[0]?.id || '1', locationId: locations[0]?.id || '1', language: 'English', status: 'approved', clicksCount: 0 }); setIsNewGroup(true); setGroupError(''); setSuggestedTitle(''); setShowGroupModal(true); };
  const handleEditGroup = (g: any) => { setEditingGroup({ ...g, whatsappLinks: g.whatsappLinks || (g.whatsappLink ? [g.whatsappLink] : ['']) }); setIsNewGroup(false); setGroupError(''); setSuggestedTitle(''); setShowGroupModal(true); };
  const handleSaveGroup = async () => { if (!editingGroup?.title) return alert('Title required'); setSaving(true); const res = await fetch('/api/admin/groups', { method: isNewGroup ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...editingGroup, whatsappLinks: (editingGroup.whatsappLinks || []).filter((l: string) => l && l.trim()) }) }); const data = await res.json(); if (!res.ok) { if (data.suggestedTitle) { setSuggestedTitle(data.suggestedTitle); } setGroupError(data.error || 'Error'); setSaving(false); return; } await fetchGroups(); setShowGroupModal(false); setSaving(false); };
  const handleDeleteGroup = async (id: string) => { if (!confirm('Delete?')) return; await fetch('/api/admin/groups', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }); fetchGroups(); };
  const handleTogglePin = async (g: any) => { await fetch('/api/admin/groups', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...g, isPinned: !g.isPinned }) }); fetchGroups(); };

  const handleNewService = () => { setEditingService({ id: '', name: '', phone: '', categoryId: serviceCategories[0]?.id || '1', description: '', languages: ['English'], status: 'approved' }); setIsNewService(true); setShowServiceModal(true); };
  const handleEditService = (s: any) => { setEditingService({ ...s }); setIsNewService(false); setShowServiceModal(true); };
  const handleSaveService = async () => { if (!editingService?.name || !editingService?.phone) return alert('Name & Phone required'); setSaving(true); await fetch('/api/admin/services', { method: isNewService ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingService) }); await fetchServices(); setShowServiceModal(false); setSaving(false); };
  const handleDeleteService = async (id: string) => { if (!confirm('Delete?')) return; await fetch('/api/admin/services', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }); fetchServices(); };
  const handleToggleServicePin = async (s: any) => { await fetch('/api/admin/services', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...s, isPinned: !s.isPinned }) }); fetchServices(); };

  const handleNewCategory = (type: 'group' | 'service') => { setCategoryType(type); setEditingCategory({ id: '', name: '', nameRu: '', slug: '', icon: '📁', order: 0 }); setIsNewCategory(true); setShowCategoryModal(true); };
  const handleEditCategory = (c: any, type: 'group' | 'service') => { setCategoryType(type); setEditingCategory({ ...c }); setIsNewCategory(false); setShowCategoryModal(true); };
  const handleSaveCategory = async () => { if (!editingCategory?.name) return alert('Name required'); setSaving(true); const endpoint = categoryType === 'service' ? '/api/admin/service-categories' : '/api/admin/group-categories'; await fetch(endpoint, { method: isNewCategory ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingCategory) }); if (categoryType === 'service') await fetchServiceCategories(); else await fetchGroupCategories(); setShowCategoryModal(false); setSaving(false); };
  const handleDeleteCategory = async (id: string, type: 'group' | 'service') => { const items = type === 'service' ? services : groups; if (items.some((i: any) => i.categoryId === id)) return alert('Cannot delete - has items'); if (!confirm('Delete?')) return; const endpoint = type === 'service' ? '/api/admin/service-categories' : '/api/admin/group-categories'; await fetch(endpoint, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }); if (type === 'service') fetchServiceCategories(); else fetchGroupCategories(); };

  const handleNewLocation = () => { setEditingLocation({ id: '', neighborhood: '', city: '', state: '', country: 'USA', status: 'approved', order: locations.length + 1 }); setIsNewLocation(true); setShowLocationModal(true); };
  const handleEditLocation = (l: any) => { setEditingLocation({ ...l }); setIsNewLocation(false); setShowLocationModal(true); };
  const handleSaveLocation = async () => { if (!editingLocation?.neighborhood) return alert('Neighborhood required'); setSaving(true); await fetch('/api/admin/locations', { method: isNewLocation ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingLocation) }); await fetchLocations(); setShowLocationModal(false); setSaving(false); };
  const handleDeleteLocation = async (id: string) => { if (groups.some((g: any) => g.locationId === id)) return alert('Cannot delete - has groups'); if (!confirm('Delete?')) return; await fetch('/api/admin/locations', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }); fetchLocations(); };

  // Approve/Reject suggestions
  const handleApproveGroupSuggestion = async (s: any) => { await fetch('/api/suggest-group', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: s.id, action: 'approve' }) }); fetchGroupSuggestions(); fetchGroups(); };
  const handleRejectGroupSuggestion = async (id: string) => { await fetch('/api/suggest-group', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action: 'reject' }) }); fetchGroupSuggestions(); };
  
  const handleApproveServiceSuggestion = async (s: any) => { await fetch('/api/suggest-service', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: s.id, action: 'approve' }) }); fetchServiceSuggestions(); fetchServices(); };
  const handleRejectServiceSuggestion = async (id: string) => { await fetch('/api/suggest-service', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action: 'reject' }) }); fetchServiceSuggestions(); };

  const handleApproveLocationSuggestion = async (s: any) => { await fetch('/api/location-suggestions', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: s.id, action: 'approve' }) }); fetchLocationSuggestions(); fetchLocations(); };
  const handleRejectLocationSuggestion = async (id: string) => { await fetch('/api/location-suggestions', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action: 'reject' }) }); fetchLocationSuggestions(); };

  const pendingGroupSuggestions = groupSuggestions.filter(s => s.status === 'pending');
  const pendingServiceSuggestions = serviceSuggestions.filter(s => s.status === 'pending');
  const pendingLocationSuggestions = locationSuggestions.filter(s => s.status === 'pending');
  const pendingCount = pendingGroupSuggestions.length + pendingServiceSuggestions.length + pendingLocationSuggestions.length;

  const navItems = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: '📊' },
    { id: 'groups' as Tab, label: 'Groups', icon: '👥' },
    { id: 'group-categories' as Tab, label: 'Group Categories', icon: '📁' },
    { id: 'locations' as Tab, label: 'Locations', icon: '📍' },
    { id: 'services' as Tab, label: 'Services', icon: '🔧' },
    { id: 'service-categories' as Tab, label: 'Service Types', icon: '🏷️' },
    { id: 'users' as Tab, label: 'Users', icon: '👤' },
    { id: 'suggestions' as Tab, label: 'Suggestions', icon: '📬', badge: pendingCount },
    { id: 'reports' as Tab, label: 'Reports', icon: '⚠️', badge: reports.length },
  ];

  const inputStyle = { padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', width: '100%', boxSizing: 'border-box' as const, fontSize: '0.95rem' };
  const labelStyle = { fontWeight: 'bold' as const, display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' };
  const btnStyle = (d: boolean) => ({ flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', background: d ? '#ccc' : '#2563eb', color: 'white', cursor: d ? 'not-allowed' : 'pointer', fontWeight: 'bold' as const });

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
            <li className="admin-nav-item" style={{ marginTop: 'auto' }}>
              <Link href="/" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><span>🏠</span><span>Back to Site</span></Link>
            </li>
          </ul>
        </nav>
      </aside>

      <main className="admin-content">
        {activeTab === 'dashboard' && (
          <>
            <div className="admin-header"><h1 className="admin-title">Dashboard</h1></div>
            <div className="stats-grid">
              <div className="stat-card"><p className="stat-label">Groups</p><p className="stat-value">{groups.length}</p></div>
              <div className="stat-card"><p className="stat-label">Services</p><p className="stat-value">{services.length}</p></div>
              <div className="stat-card"><p className="stat-label">Users</p><p className="stat-value">{users.length}</p></div>
              <div className="stat-card"><p className="stat-label">Pending</p><p className="stat-value" style={{ color: '#ef4444' }}>{pendingCount}</p></div>
            </div>
          </>
        )}

        {activeTab === 'groups' && (
          <>
            <div className="admin-header"><h1 className="admin-title">Groups ({groups.length})</h1><button className="admin-btn" onClick={handleNewGroup}>+ Add</button></div>
            <div className="admin-card">
              <table className="admin-table">
                <thead><tr><th>Pin</th><th>Title</th><th>Category</th><th>Location</th><th>Actions</th></tr></thead>
                <tbody>
                  {groups.map((g: any) => {
                    const cat = groupCategories.find((c: any) => c.id === g.categoryId);
                    const loc = locations.find((l: any) => l.id === g.locationId);
                    return (
                      <tr key={g.id} style={{ background: g.isPinned ? '#fef3c7' : 'white' }}>
                        <td><button onClick={() => handleTogglePin(g)} style={{ background: g.isPinned ? '#f59e0b' : '#e5e7eb', border: 'none', borderRadius: '4px', padding: '6px 10px', cursor: 'pointer' }}>{g.isPinned ? '⭐' : '☆'}</button></td>
                        <td><strong>{g.title}</strong></td>
                        <td>{cat?.icon} {cat?.name || 'Unknown'}</td>
                        <td>📍 {loc?.neighborhood || 'Unknown'}</td>
                        <td><button className="action-btn edit" onClick={() => handleEditGroup(g)}>Edit</button><button className="action-btn delete" onClick={() => handleDeleteGroup(g.id)}>Delete</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'locations' && (
          <>
            <div className="admin-header"><h1 className="admin-title">Locations ({locations.length})</h1><button className="admin-btn" onClick={handleNewLocation}>+ Add</button></div>
            <div className="admin-card">
              <table className="admin-table">
                <thead><tr><th>Neighborhood</th><th>City</th><th>Groups</th><th>Actions</th></tr></thead>
                <tbody>
                  {locations.sort((a: any, b: any) => (a.order || 0) - (b.order || 0)).map((l: any) => (
                    <tr key={l.id}>
                      <td><strong>{l.neighborhood}</strong></td>
                      <td>{l.city}{l.state ? ', ' + l.state : ''}</td>
                      <td>{groups.filter((g: any) => g.locationId === l.id).length}</td>
                      <td><button className="action-btn edit" onClick={() => handleEditLocation(l)}>Edit</button><button className="action-btn delete" onClick={() => handleDeleteLocation(l.id)}>Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'group-categories' && (
          <>
            <div className="admin-header"><h1 className="admin-title">Group Categories ({groupCategories.length})</h1><button className="admin-btn" onClick={() => handleNewCategory('group')}>+ Add</button></div>
            <div className="admin-card">
              <table className="admin-table">
                <thead><tr><th>Icon</th><th>Name</th><th>Russian</th><th>Groups</th><th>Actions</th></tr></thead>
                <tbody>
                  {groupCategories.sort((a: any, b: any) => (a.order || 0) - (b.order || 0)).map((c: any) => (
                    <tr key={c.id}><td style={{ fontSize: '1.5rem' }}>{c.icon}</td><td><strong>{c.name}</strong></td><td>{c.nameRu || '-'}</td><td>{groups.filter((g: any) => g.categoryId === c.id).length}</td><td><button className="action-btn edit" onClick={() => handleEditCategory(c, 'group')}>Edit</button><button className="action-btn delete" onClick={() => handleDeleteCategory(c.id, 'group')}>Delete</button></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'services' && (
          <>
            <div className="admin-header"><h1 className="admin-title">Services ({services.length})</h1><button className="admin-btn" onClick={handleNewService}>+ Add</button></div>
            <div className="admin-card">
              <table className="admin-table">
                <thead><tr><th>Pin</th><th>Name</th><th>Category</th><th>Phone</th><th>Actions</th></tr></thead>
                <tbody>
                  {services.map((s: any) => {
                    const cat = serviceCategories.find((c: any) => c.id === s.categoryId);
                    return (
                      <tr key={s.id} style={s.isPinned ? { background: '#fef3c7' } : {}}>
                        <td><button onClick={() => handleToggleServicePin(s)} style={{ background: s.isPinned ? '#f59e0b' : '#e5e7eb', border: 'none', borderRadius: '4px', padding: '6px 10px', cursor: 'pointer' }}>{s.isPinned ? '⭐' : '☆'}</button></td>
                        <td><strong>{s.name}</strong></td><td>{cat?.icon} {cat?.name}</td><td>{s.phone}</td>
                        <td><button className="action-btn edit" onClick={() => handleEditService(s)}>Edit</button><button className="action-btn delete" onClick={() => handleDeleteService(s.id)}>Delete</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'service-categories' && (
          <>
            <div className="admin-header"><h1 className="admin-title">Service Types ({serviceCategories.length})</h1><button className="admin-btn" onClick={() => handleNewCategory('service')}>+ Add</button></div>
            <div className="admin-card">
              <table className="admin-table">
                <thead><tr><th>Icon</th><th>Name</th><th>Russian</th><th>Services</th><th>Actions</th></tr></thead>
                <tbody>
                  {serviceCategories.sort((a: any, b: any) => (a.order || 0) - (b.order || 0)).map((c: any) => (
                    <tr key={c.id}><td style={{ fontSize: '1.5rem' }}>{c.icon}</td><td><strong>{c.name}</strong></td><td>{c.nameRu || '-'}</td><td>{services.filter((s: any) => s.categoryId === c.id).length}</td><td><button className="action-btn edit" onClick={() => handleEditCategory(c, 'service')}>Edit</button><button className="action-btn delete" onClick={() => handleDeleteCategory(c.id, 'service')}>Delete</button></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <>
            <div className="admin-header"><h1 className="admin-title">Users ({users.length})</h1></div>
            <div className="admin-card">
              <table className="admin-table">
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
                <tbody>
                  {users.map((u: any) => (
                    <tr key={u.email} style={u.role === 'admin' ? { background: '#dbeafe' } : {}}>
                      <td><strong>{u.name}</strong></td><td>{u.email}</td>
                      <td><span style={{ padding: '4px 8px', borderRadius: '4px', background: u.role === 'admin' ? '#2563eb' : '#e5e7eb', color: u.role === 'admin' ? 'white' : '#333' }}>{u.role === 'admin' ? '👑 Admin' : 'User'}</span></td>
                      <td><button className="action-btn edit" onClick={() => handleToggleAdmin(u)}>{u.role === 'admin' ? 'Remove Admin' : 'Make Admin'}</button><button className="action-btn delete" onClick={() => handleDeleteUser(u.email)}>Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'suggestions' && (
          <>
            <div className="admin-header"><h1 className="admin-title">Pending Suggestions</h1></div>
            
            {/* Group Suggestions */}
            <div className="admin-card" style={{ marginBottom: '1rem' }}>
              <h3>👥 Group Suggestions ({pendingGroupSuggestions.length})</h3>
              {pendingGroupSuggestions.length === 0 ? <p style={{ color: '#666' }}>No pending</p> : (
                <table className="admin-table">
                  <thead><tr><th>Title</th><th>Links</th><th>By</th><th>Actions</th></tr></thead>
                  <tbody>
                    {pendingGroupSuggestions.map((s: any) => (
                      <tr key={s.id}>
                        <td><strong>{s.title}</strong><br/><small style={{color:'#666'}}>{s.description?.substring(0,50)}...</small></td>
                        <td>
                          {s.whatsappLink && <span>💬</span>}
                          {s.telegramLink && <span>✈️</span>}
                          {s.facebookLink && <span>📘</span>}
                        </td>
                        <td>{s.submittedBy}</td>
                        <td>
                          <button className="action-btn edit" onClick={() => handleApproveGroupSuggestion(s)}>✅ Approve</button>
                          <button className="action-btn delete" onClick={() => handleRejectGroupSuggestion(s.id)}>❌ Reject</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Service Suggestions */}
            <div className="admin-card" style={{ marginBottom: '1rem' }}>
              <h3>🔧 Service Suggestions ({pendingServiceSuggestions.length})</h3>
              {pendingServiceSuggestions.length === 0 ? <p style={{ color: '#666' }}>No pending</p> : (
                <table className="admin-table">
                  <thead><tr><th>Name</th><th>Phone</th><th>By</th><th>Actions</th></tr></thead>
                  <tbody>
                    {pendingServiceSuggestions.map((s: any) => (
                      <tr key={s.id}>
                        <td><strong>{s.name}</strong></td>
                        <td>{s.phone}</td>
                        <td>{s.submittedBy}</td>
                        <td>
                          <button className="action-btn edit" onClick={() => handleApproveServiceSuggestion(s)}>✅ Approve</button>
                          <button className="action-btn delete" onClick={() => handleRejectServiceSuggestion(s.id)}>❌ Reject</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Location Suggestions */}
            <div className="admin-card">
              <h3>📍 Location Suggestions ({pendingLocationSuggestions.length})</h3>
              {pendingLocationSuggestions.length === 0 ? <p style={{ color: '#666' }}>No pending</p> : (
                <table className="admin-table">
                  <thead><tr><th>Neighborhood</th><th>City</th><th>By</th><th>Actions</th></tr></thead>
                  <tbody>
                    {pendingLocationSuggestions.map((s: any) => (
                      <tr key={s.id}>
                        <td><strong>{s.neighborhood}</strong></td>
                        <td>{s.city}</td>
                        <td>{s.suggestedBy}</td>
                        <td>
                          <button className="action-btn edit" onClick={() => handleApproveLocationSuggestion(s)}>✅ Approve</button>
                          <button className="action-btn delete" onClick={() => handleRejectLocationSuggestion(s.id)}>❌ Reject</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {activeTab === 'reports' && (
          <>
            <div className="admin-header"><h1 className="admin-title">Reports ({reports.length})</h1></div>
            <div className="admin-card">
              {reports.length === 0 ? <p style={{ color: '#666' }}>No reports</p> : (
                <table className="admin-table">
                  <thead><tr><th>Group</th><th>By</th><th>Reports</th></tr></thead>
                  <tbody>
                    {Object.entries(reports.reduce((acc: any, r: any) => { acc[r.groupId] = acc[r.groupId] || []; acc[r.groupId].push(r); return acc; }, {})).map(([groupId, groupReports]: [string, any]) => {
                      const group = groups.find((g: any) => g.id === groupId);
                      return (
                        <tr key={groupId} style={groupReports.length >= 3 ? { background: '#fee2e2' } : {}}>
                          <td><strong>{group?.title || 'Unknown'}</strong></td>
                          <td>{groupReports.map((r: any) => r.userEmail).join(', ')}</td>
                          <td><span style={{ padding: '4px 8px', borderRadius: '4px', background: groupReports.length >= 3 ? '#ef4444' : '#f59e0b', color: 'white' }}>{groupReports.length}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </main>

      {/* Group Modal */}
      {showGroupModal && editingGroup && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }}>
            <h2>{isNewGroup ? 'Add Group' : 'Edit Group'}</h2>
            {groupError && <div style={{ background: '#fee2e2', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', color: '#dc2626' }}>{groupError}{suggestedTitle && <><br/><button onClick={() => { setEditingGroup({...editingGroup, title: suggestedTitle}); setGroupError(''); setSuggestedTitle(''); }} style={{marginTop:'0.5rem',padding:'0.5rem',background:'#2563eb',color:'white',border:'none',borderRadius:'4px',cursor:'pointer'}}>Use "{suggestedTitle}"</button></>}</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div><label style={labelStyle}>Title *</label><input style={inputStyle} value={editingGroup.title} onChange={e => setEditingGroup({ ...editingGroup, title: e.target.value })} /></div>
              <div><label style={labelStyle}>Description</label><textarea style={inputStyle} value={editingGroup.description} onChange={e => setEditingGroup({ ...editingGroup, description: e.target.value })} rows={2} /></div>
              <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '8px' }}>
                <label style={{ ...labelStyle, color: '#166534' }}>💬 WhatsApp Links</label>
                {editingGroup.whatsappLinks?.map((link: string, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <input style={{ ...inputStyle, flex: 1 }} placeholder="https://chat.whatsapp.com/..." value={link} onChange={e => { const links = [...editingGroup.whatsappLinks]; links[i] = e.target.value; setEditingGroup({ ...editingGroup, whatsappLinks: links }); }} />
                    {editingGroup.whatsappLinks.length > 1 && <button onClick={() => { const links = editingGroup.whatsappLinks.filter((_: any, idx: number) => idx !== i); setEditingGroup({ ...editingGroup, whatsappLinks: links }); }} style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '8px', background: 'white', cursor: 'pointer' }}>✕</button>}
                  </div>
                ))}
                <button onClick={() => setEditingGroup({ ...editingGroup, whatsappLinks: [...(editingGroup.whatsappLinks || []), ''] })} style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', border: '1px solid #25D366', borderRadius: '8px', background: 'white', color: '#25D366', cursor: 'pointer' }}>+ Add Link</button>
              </div>
              <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '8px' }}>
                <label style={{ ...labelStyle, color: '#1e40af' }}>Other Links</label>
                <div style={{ marginTop: '0.5rem' }}><label style={{ fontSize: '0.85rem' }}>✈️ Telegram</label><input style={inputStyle} value={editingGroup.telegramLink || ''} onChange={e => setEditingGroup({ ...editingGroup, telegramLink: e.target.value })} /></div>
                <div style={{ marginTop: '0.5rem' }}><label style={{ fontSize: '0.85rem' }}>📘 Facebook</label><input style={inputStyle} value={editingGroup.facebookLink || ''} onChange={e => setEditingGroup({ ...editingGroup, facebookLink: e.target.value })} /></div>
                <div style={{ marginTop: '0.5rem' }}><label style={{ fontSize: '0.85rem' }}>🌐 Website</label><input style={inputStyle} value={editingGroup.websiteLink || ''} onChange={e => setEditingGroup({ ...editingGroup, websiteLink: e.target.value })} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div><label style={labelStyle}>Category</label><select style={inputStyle} value={editingGroup.categoryId} onChange={e => setEditingGroup({ ...editingGroup, categoryId: e.target.value })}>{groupCategories.map((c: any) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}</select></div>
                <div><label style={labelStyle}>Location</label><select style={inputStyle} value={editingGroup.locationId} onChange={e => setEditingGroup({ ...editingGroup, locationId: e.target.value })}>{locations.map((l: any) => <option key={l.id} value={l.id}>📍 {l.neighborhood}</option>)}</select></div>
              </div>
              <div><label style={labelStyle}>Language</label><select style={inputStyle} value={editingGroup.language} onChange={e => setEditingGroup({ ...editingGroup, language: e.target.value })}><option value="English">🇺🇸 English</option><option value="Russian">🇷🇺 Russian</option><option value="Hebrew">🇮🇱 Hebrew</option><option value="Yiddish">יידיש Yiddish</option></select></div>
              <label><input type="checkbox" checked={editingGroup.isPinned} onChange={e => setEditingGroup({ ...editingGroup, isPinned: e.target.checked })} /> ⭐ Pin to top</label>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button onClick={() => setShowGroupModal(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSaveGroup} disabled={saving} style={btnStyle(saving)}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Service Modal */}
      {showServiceModal && editingService && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflow: 'auto' }}>
            <h2>{isNewService ? 'Add Service' : 'Edit Service'}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <input style={inputStyle} placeholder="Name *" value={editingService.name} onChange={e => setEditingService({ ...editingService, name: e.target.value })} />
              <input style={inputStyle} placeholder="Phone *" value={editingService.phone} onChange={e => setEditingService({ ...editingService, phone: e.target.value })} />
              <input style={inputStyle} placeholder="Address" value={editingService.address || ''} onChange={e => setEditingService({ ...editingService, address: e.target.value })} />
              <input style={inputStyle} placeholder="Website" value={editingService.website || ''} onChange={e => setEditingService({ ...editingService, website: e.target.value })} />
              <select style={inputStyle} value={editingService.categoryId} onChange={e => setEditingService({ ...editingService, categoryId: e.target.value })}>{serviceCategories.map((c: any) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}</select>
              <textarea style={inputStyle} placeholder="Description" value={editingService.description || ''} onChange={e => setEditingService({ ...editingService, description: e.target.value })} rows={2} />
              <label><input type="checkbox" checked={editingService.isPinned} onChange={e => setEditingService({ ...editingService, isPinned: e.target.checked })} /> ⭐ Pin</label>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button onClick={() => setShowServiceModal(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSaveService} disabled={saving} style={btnStyle(saving)}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && editingCategory && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', width: '90%', maxWidth: '400px' }}>
            <h2>{isNewCategory ? 'Add' : 'Edit'} {categoryType === 'service' ? 'Service Type' : 'Category'}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div><label style={labelStyle}>Icon</label><input style={inputStyle} value={editingCategory.icon} onChange={e => setEditingCategory({ ...editingCategory, icon: e.target.value })} /></div>
              <div><label style={labelStyle}>Name *</label><input style={inputStyle} value={editingCategory.name} onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })} /></div>
              <div><label style={labelStyle}>Russian Name</label><input style={inputStyle} value={editingCategory.nameRu || ''} onChange={e => setEditingCategory({ ...editingCategory, nameRu: e.target.value })} /></div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button onClick={() => setShowCategoryModal(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSaveCategory} disabled={saving} style={btnStyle(saving)}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Location Modal */}
      {showLocationModal && editingLocation && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', width: '90%', maxWidth: '400px' }}>
            <h2>{isNewLocation ? 'Add' : 'Edit'} Location</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div><label style={labelStyle}>Neighborhood *</label><input style={inputStyle} value={editingLocation.neighborhood} onChange={e => setEditingLocation({ ...editingLocation, neighborhood: e.target.value })} /></div>
              <div><label style={labelStyle}>City</label><input style={inputStyle} value={editingLocation.city} onChange={e => setEditingLocation({ ...editingLocation, city: e.target.value })} /></div>
              <div><label style={labelStyle}>State</label><input style={inputStyle} value={editingLocation.state} onChange={e => setEditingLocation({ ...editingLocation, state: e.target.value })} /></div>
              <div><label style={labelStyle}>Country</label><input style={inputStyle} value={editingLocation.country} onChange={e => setEditingLocation({ ...editingLocation, country: e.target.value })} /></div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button onClick={() => setShowLocationModal(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSaveLocation} disabled={saving} style={btnStyle(saving)}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
