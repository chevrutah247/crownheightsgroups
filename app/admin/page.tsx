'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Tab = 'dashboard' | 'groups' | 'users' | 'services' | 'group-categories' | 'service-categories' | 'suggestions' | 'reports';

interface Group { id: string; title: string; description: string; whatsappLinks?: string[]; whatsappLink?: string; categoryId: string; locationId: string; language: string; status: string; clicksCount: number; isPinned?: boolean; }
interface User { id: string; email: string; name: string; role: 'user' | 'admin'; isVerified: boolean; createdAt: string; }
interface Service { id: string; name: string; phone: string; categoryId: string; description?: string; languages?: string[]; isPinned?: boolean; logo?: string; address?: string; website?: string; }
interface Category { id: string; name: string; nameRu?: string; slug: string; icon: string; order?: number; }
interface Suggestion { id: string; name: string; type: string; suggestedBy: string; status: string; createdAt: string; }
interface ServiceSuggestion { id: string; name: string; phone: string; categoryId: string; description: string; type: string; status: string; submittedBy: string; createdAt: string; }
interface Report { id: string; groupId: string; userEmail: string; reason: string; createdAt: string; }

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [groups, setGroups] = useState<Group[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [groupCategories, setGroupCategories] = useState<Category[]>([]);
  const [serviceCategories, setServiceCategories] = useState<Category[]>([]);
  const [categorySuggestions, setCategorySuggestions] = useState<Suggestion[]>([]);
  const [serviceSuggestions, setServiceSuggestions] = useState<ServiceSuggestion[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [editingGroup, setEditingGroup] = useState<any>(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [isNewGroup, setIsNewGroup] = useState(false);
  
  const [editingService, setEditingService] = useState<any>(null);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [isNewService, setIsNewService] = useState(false);

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [categoryType, setCategoryType] = useState<'group' | 'service'>('group');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    await Promise.all([
      fetchGroups(), fetchUsers(), fetchServices(),
      fetchGroupCategories(), fetchServiceCategories(),
      fetchCategorySuggestions(), fetchServiceSuggestions(), fetchReports()
    ]);
    setLoading(false);
  };

  const fetchGroups = async () => { try { const r = await fetch('/api/admin/groups'); const d = await r.json(); setGroups(Array.isArray(d) ? d : []); } catch (e) { console.error(e); } };
  const fetchUsers = async () => { try { const r = await fetch('/api/admin/users'); const d = await r.json(); setUsers(Array.isArray(d) ? d : []); } catch (e) { console.error(e); } };
  const fetchServices = async () => { try { const r = await fetch('/api/admin/services'); const d = await r.json(); setServices(Array.isArray(d) ? d : []); } catch (e) { console.error(e); } };
  const fetchGroupCategories = async () => { try { const r = await fetch('/api/admin/group-categories'); const d = await r.json(); console.log('Group categories:', d); setGroupCategories(Array.isArray(d) ? d : []); } catch (e) { console.error(e); } };
  const fetchServiceCategories = async () => { try { const r = await fetch('/api/admin/service-categories'); const d = await r.json(); setServiceCategories(Array.isArray(d) ? d : []); } catch (e) { console.error(e); } };
  const fetchCategorySuggestions = async () => { try { const r = await fetch('/api/category-suggestions'); const d = await r.json(); setCategorySuggestions(Array.isArray(d) ? d : []); } catch (e) { console.error(e); } };
  const fetchServiceSuggestions = async () => { try { const r = await fetch('/api/suggest-service'); const d = await r.json(); setServiceSuggestions(Array.isArray(d) ? d : []); } catch (e) { console.error(e); } };
  const fetchReports = async () => { try { const r = await fetch('/api/reports'); const d = await r.json(); setReports(Array.isArray(d) ? d : []); } catch (e) { console.error(e); } };

  const handleToggleAdmin = async (u: User) => { if (!confirm(`Change role?`)) return; await fetch('/api/admin/users', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: u.email, role: u.role === 'admin' ? 'user' : 'admin' }) }); fetchUsers(); };
  const handleDeleteUser = async (email: string) => { if (!confirm(`Delete?`)) return; await fetch('/api/admin/users', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) }); fetchUsers(); };

  const handleNewGroup = () => { setEditingGroup({ id: '', title: '', description: '', whatsappLinks: [''], categoryId: groupCategories[0]?.id || '1', locationId: '1', language: 'English', status: 'approved', clicksCount: 0 }); setIsNewGroup(true); setShowGroupModal(true); };
  const handleEditGroup = (g: Group) => { setEditingGroup({ ...g, whatsappLinks: g.whatsappLinks || (g.whatsappLink ? [g.whatsappLink] : ['']) }); setIsNewGroup(false); setShowGroupModal(true); };
  const handleSaveGroup = async () => { if (!editingGroup?.title) return alert('Title required'); setSaving(true); await fetch('/api/admin/groups', { method: isNewGroup ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...editingGroup, whatsappLinks: editingGroup.whatsappLinks.filter((l: string) => l) }) }); await fetchGroups(); setShowGroupModal(false); setSaving(false); };
  const handleDeleteGroup = async (id: string) => { if (!confirm('Delete?')) return; await fetch('/api/admin/groups', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }); fetchGroups(); };
  const handleTogglePin = async (g: Group) => { await fetch('/api/admin/groups', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...g, isPinned: !g.isPinned }) }); fetchGroups(); };

  const handleNewService = () => { setEditingService({ id: '', name: '', phone: '', categoryId: serviceCategories[0]?.id || '1', description: '', languages: ['English'], status: 'approved' }); setIsNewService(true); setShowServiceModal(true); };
  const handleEditService = (s: Service) => { setEditingService({ ...s }); setIsNewService(false); setShowServiceModal(true); };
  const handleSaveService = async () => { if (!editingService?.name || !editingService?.phone) return alert('Name & Phone required'); setSaving(true); await fetch('/api/admin/services', { method: isNewService ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingService) }); await fetchServices(); setShowServiceModal(false); setSaving(false); };
  const handleDeleteService = async (id: string) => { if (!confirm('Delete?')) return; await fetch('/api/admin/services', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }); fetchServices(); };
  const handleToggleServicePin = async (s: Service) => { await fetch('/api/admin/services', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...s, isPinned: !s.isPinned }) }); fetchServices(); };

  const handleNewCategory = (type: 'group' | 'service') => { setCategoryType(type); setEditingCategory({ id: '', name: '', nameRu: '', slug: '', icon: '📁', order: 0 }); setIsNewCategory(true); setShowCategoryModal(true); };
  const handleEditCategory = (c: Category, type: 'group' | 'service') => { setCategoryType(type); setEditingCategory({ ...c }); setIsNewCategory(false); setShowCategoryModal(true); };
  const handleSaveCategory = async () => {
    if (!editingCategory?.name) return alert('Name required');
    setSaving(true);
    const endpoint = categoryType === 'service' ? '/api/admin/service-categories' : '/api/admin/group-categories';
    await fetch(endpoint, { method: isNewCategory ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingCategory) });
    if (categoryType === 'service') await fetchServiceCategories(); else await fetchGroupCategories();
    setShowCategoryModal(false); setSaving(false);
  };
  const handleDeleteCategory = async (id: string, type: 'group' | 'service') => {
    const items = type === 'service' ? services : groups;
    if (items.some(i => i.categoryId === id)) return alert('Cannot delete - has items');
    if (!confirm('Delete?')) return;
    const endpoint = type === 'service' ? '/api/admin/service-categories' : '/api/admin/group-categories';
    await fetch(endpoint, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    if (type === 'service') fetchServiceCategories(); else fetchGroupCategories();
  };

  const handleApproveCategorySuggestion = async (s: Suggestion, icon: string) => { await fetch('/api/category-suggestions', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: s.id, action: 'approve', icon }) }); fetchCategorySuggestions(); if (s.type === 'service') fetchServiceCategories(); else fetchGroupCategories(); };
  const handleRejectCategorySuggestion = async (id: string) => { await fetch('/api/category-suggestions', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action: 'reject' }) }); fetchCategorySuggestions(); };
  const handleApproveServiceSuggestion = async (s: ServiceSuggestion) => { await fetch('/api/admin/services', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...s, status: 'approved' }) }); fetchServiceSuggestions(); fetchServices(); };

  const navItems = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: '📊' },
    { id: 'groups' as Tab, label: 'Groups', icon: '👥' },
    { id: 'group-categories' as Tab, label: 'Group Categories', icon: '📁' },
    { id: 'services' as Tab, label: 'Services', icon: '🔧' },
    { id: 'service-categories' as Tab, label: 'Service Types', icon: '🏷️' },
    { id: 'users' as Tab, label: 'Users', icon: '👤' },
    { id: 'suggestions' as Tab, label: 'Suggestions', icon: '📬', badge: categorySuggestions.filter(s => s.status === 'pending').length + serviceSuggestions.filter(s => s.status === 'pending').length },
    { id: 'reports' as Tab, label: 'Reports', icon: '⚠️', badge: reports.length },
  ];

  const inputStyle = { padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', width: '100%', boxSizing: 'border-box' as const };
  const btnStyle = (d: boolean) => ({ flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', background: d ? '#ccc' : '#2563eb', color: 'white', cursor: d ? 'not-allowed' : 'pointer', fontWeight: 'bold' as const });

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header"><h2 className="admin-sidebar-title">Admin Panel</h2></div>
        <nav>
          <ul className="admin-nav">
            {navItems.map(item => (
              <li key={item.id} className={`admin-nav-item ${activeTab === item.id ? 'active' : ''}`} onClick={() => setActiveTab(item.id)}>
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
              <div className="stat-card"><p className="stat-label">Pending</p><p className="stat-value" style={{ color: '#ef4444' }}>{categorySuggestions.filter(s => s.status === 'pending').length + serviceSuggestions.filter(s => s.status === 'pending').length}</p></div>
            </div>
          </>
        )}

        {activeTab === 'groups' && (
          <>
            <div className="admin-header"><h1 className="admin-title">Groups ({groups.length})</h1><button className="admin-btn" onClick={handleNewGroup}>+ Add</button></div>
            <div className="admin-card">
              <table className="admin-table">
                <thead><tr><th>Pin</th><th>Title</th><th>Category</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {groups.map(g => {
                    const cat = groupCategories.find(c => c.id === g.categoryId);
                    return (
                      <tr key={g.id} style={{ background: g.status === 'broken' ? '#fee2e2' : g.isPinned ? '#fef3c7' : 'white' }}>
                        <td><button onClick={() => handleTogglePin(g)} style={{ background: g.isPinned ? '#f59e0b' : '#e5e7eb', border: 'none', borderRadius: '4px', padding: '6px 10px', cursor: 'pointer' }}>{g.isPinned ? '⭐' : '☆'}</button></td>
                        <td><strong>{g.title}</strong></td>
                        <td>{cat?.icon} {cat?.name || 'Unknown'}</td>
                        <td><span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', background: g.status === 'broken' ? '#ef4444' : '#10b981', color: 'white' }}>{g.status}</span></td>
                        <td><button className="action-btn edit" onClick={() => handleEditGroup(g)}>Edit</button><button className="action-btn delete" onClick={() => handleDeleteGroup(g.id)}>Delete</button></td>
                      </tr>
                    );
                  })}
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
                  {groupCategories.sort((a, b) => (a.order || 0) - (b.order || 0)).map(c => (
                    <tr key={c.id}>
                      <td style={{ fontSize: '1.5rem' }}>{c.icon}</td>
                      <td><strong>{c.name}</strong></td>
                      <td>{c.nameRu || '-'}</td>
                      <td>{groups.filter(g => g.categoryId === c.id).length}</td>
                      <td><button className="action-btn edit" onClick={() => handleEditCategory(c, 'group')}>Edit</button><button className="action-btn delete" onClick={() => handleDeleteCategory(c.id, 'group')}>Delete</button></td>
                    </tr>
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
                  {services.map(s => {
                    const cat = serviceCategories.find(c => c.id === s.categoryId);
                    return (
                      <tr key={s.id} style={s.isPinned ? { background: '#fef3c7' } : {}}>
                        <td><button onClick={() => handleToggleServicePin(s)} style={{ background: s.isPinned ? '#f59e0b' : '#e5e7eb', border: 'none', borderRadius: '4px', padding: '6px 10px', cursor: 'pointer' }}>{s.isPinned ? '⭐' : '☆'}</button></td>
                        <td><strong>{s.name}</strong></td>
                        <td>{cat?.icon} {cat?.name}</td>
                        <td>{s.phone}</td>
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
                  {serviceCategories.sort((a, b) => (a.order || 0) - (b.order || 0)).map(c => (
                    <tr key={c.id}>
                      <td style={{ fontSize: '1.5rem' }}>{c.icon}</td>
                      <td><strong>{c.name}</strong></td>
                      <td>{c.nameRu || '-'}</td>
                      <td>{services.filter(s => s.categoryId === c.id).length}</td>
                      <td><button className="action-btn edit" onClick={() => handleEditCategory(c, 'service')}>Edit</button><button className="action-btn delete" onClick={() => handleDeleteCategory(c.id, 'service')}>Delete</button></td>
                    </tr>
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
                  {users.map(u => (
                    <tr key={u.email} style={u.role === 'admin' ? { background: '#dbeafe' } : {}}>
                      <td><strong>{u.name}</strong></td>
                      <td>{u.email}</td>
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
            <div className="admin-card" style={{ marginBottom: '1rem' }}>
              <h3>📁 Category Suggestions</h3>
              {categorySuggestions.filter(s => s.status === 'pending').length === 0 ? <p style={{ color: '#666' }}>No pending</p> : (
                <table className="admin-table">
                  <thead><tr><th>Name</th><th>Type</th><th>By</th><th>Actions</th></tr></thead>
                  <tbody>
                    {categorySuggestions.filter(s => s.status === 'pending').map(s => (
                      <tr key={s.id}>
                        <td><strong>{s.name}</strong></td><td>{s.type}</td><td>{s.suggestedBy}</td>
                        <td><button className="action-btn edit" onClick={() => { const icon = prompt('Icon:', '📁'); if (icon) handleApproveCategorySuggestion(s, icon); }}>✅</button><button className="action-btn delete" onClick={() => handleRejectCategorySuggestion(s.id)}>❌</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="admin-card">
              <h3>🔧 Service Suggestions</h3>
              {serviceSuggestions.filter(s => s.status === 'pending').length === 0 ? <p style={{ color: '#666' }}>No pending</p> : (
                <table className="admin-table">
                  <thead><tr><th>Name</th><th>Phone</th><th>By</th><th>Actions</th></tr></thead>
                  <tbody>
                    {serviceSuggestions.filter(s => s.status === 'pending').map(s => (
                      <tr key={s.id}>
                        <td><strong>{s.name}</strong></td><td>{s.phone}</td><td>{s.submittedBy}</td>
                        <td><button className="action-btn edit" onClick={() => handleApproveServiceSuggestion(s)}>✅</button><button className="action-btn delete">❌</button></td>
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
                    {Object.entries(reports.reduce((acc: any, r) => { acc[r.groupId] = acc[r.groupId] || []; acc[r.groupId].push(r); return acc; }, {})).map(([groupId, groupReports]: [string, any]) => {
                      const group = groups.find(g => g.id === groupId);
                      return (
                        <tr key={groupId} style={groupReports.length >= 3 ? { background: '#fee2e2' } : {}}>
                          <td><strong>{group?.title || 'Unknown'}</strong></td>
                          <td>{groupReports.map((r: Report) => r.userEmail).join(', ')}</td>
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

      {showGroupModal && editingGroup && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflow: 'auto' }}>
            <h2>{isNewGroup ? 'Add Group' : 'Edit Group'}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <input style={inputStyle} placeholder="Title *" value={editingGroup.title} onChange={e => setEditingGroup({ ...editingGroup, title: e.target.value })} />
              <div>
                <label style={{ fontWeight: 'bold' }}>WhatsApp Links</label>
                {editingGroup.whatsappLinks?.map((link: string, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <input style={{ ...inputStyle, flex: 1 }} placeholder="https://chat.whatsapp.com/..." value={link} onChange={e => { const links = [...editingGroup.whatsappLinks]; links[i] = e.target.value; setEditingGroup({ ...editingGroup, whatsappLinks: links }); }} />
                    {editingGroup.whatsappLinks.length > 1 && <button onClick={() => { const links = editingGroup.whatsappLinks.filter((_: any, idx: number) => idx !== i); setEditingGroup({ ...editingGroup, whatsappLinks: links }); }} style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '8px', background: 'white', cursor: 'pointer' }}>✕</button>}
                  </div>
                ))}
                <button onClick={() => setEditingGroup({ ...editingGroup, whatsappLinks: [...editingGroup.whatsappLinks, ''] })} style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', border: '1px solid #2563eb', borderRadius: '8px', background: 'white', color: '#2563eb', cursor: 'pointer' }}>+ Add Link</button>
              </div>
              <textarea style={inputStyle} placeholder="Description" value={editingGroup.description} onChange={e => setEditingGroup({ ...editingGroup, description: e.target.value })} rows={3} />
              <select style={inputStyle} value={editingGroup.categoryId} onChange={e => setEditingGroup({ ...editingGroup, categoryId: e.target.value })}>
                {groupCategories.sort((a, b) => (a.order || 0) - (b.order || 0)).map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
              <select style={inputStyle} value={editingGroup.language} onChange={e => setEditingGroup({ ...editingGroup, language: e.target.value })}>
                <option value="English">🇺🇸 English</option><option value="Russian">🇷🇺 Russian</option><option value="Hebrew">🇮🇱 Hebrew</option><option value="Yiddish">יידיש Yiddish</option>
              </select>
              <label><input type="checkbox" checked={editingGroup.isPinned} onChange={e => setEditingGroup({ ...editingGroup, isPinned: e.target.checked })} /> ⭐ Pin</label>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button onClick={() => setShowGroupModal(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSaveGroup} disabled={saving} style={btnStyle(saving)}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {showServiceModal && editingService && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflow: 'auto' }}>
            <h2>{isNewService ? 'Add Service' : 'Edit Service'}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <input style={inputStyle} placeholder="Name *" value={editingService.name} onChange={e => setEditingService({ ...editingService, name: e.target.value })} />
              <input style={inputStyle} placeholder="Phone *" value={editingService.phone} onChange={e => setEditingService({ ...editingService, phone: e.target.value })} />
              <input style={inputStyle} placeholder="Address" value={editingService.address || ''} onChange={e => setEditingService({ ...editingService, address: e.target.value })} />
              <input style={inputStyle} placeholder="Website" value={editingService.website || ''} onChange={e => setEditingService({ ...editingService, website: e.target.value })} />
              <select style={inputStyle} value={editingService.categoryId} onChange={e => setEditingService({ ...editingService, categoryId: e.target.value })}>
                {serviceCategories.sort((a, b) => (a.order || 0) - (b.order || 0)).map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
              <textarea style={inputStyle} placeholder="Description *" value={editingService.description || ''} onChange={e => setEditingService({ ...editingService, description: e.target.value })} rows={2} />
              <label><input type="checkbox" checked={editingService.isPinned} onChange={e => setEditingService({ ...editingService, isPinned: e.target.checked })} /> ⭐ Pin</label>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button onClick={() => setShowServiceModal(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSaveService} disabled={saving} style={btnStyle(saving)}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {showCategoryModal && editingCategory && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', width: '90%', maxWidth: '400px' }}>
            <h2>{isNewCategory ? 'Add' : 'Edit'} {categoryType === 'service' ? 'Service Type' : 'Group Category'}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div><label style={{ fontWeight: 'bold' }}>Icon (emoji)</label><input style={inputStyle} value={editingCategory.icon} onChange={e => setEditingCategory({ ...editingCategory, icon: e.target.value })} /></div>
              <div><label style={{ fontWeight: 'bold' }}>Name (English) *</label><input style={inputStyle} value={editingCategory.name} onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })} /></div>
              <div><label style={{ fontWeight: 'bold' }}>Name (Russian)</label><input style={inputStyle} value={editingCategory.nameRu || ''} onChange={e => setEditingCategory({ ...editingCategory, nameRu: e.target.value })} /></div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button onClick={() => setShowCategoryModal(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSaveCategory} disabled={saving} style={btnStyle(saving)}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
