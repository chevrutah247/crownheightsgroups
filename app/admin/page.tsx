'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { categories as defaultCategories, locations } from '@/lib/data';

type Tab = 'dashboard' | 'groups' | 'users' | 'services' | 'service-categories';

interface Group { id: string; title: string; description: string; whatsappLinks: string[]; categoryId: string; locationId: string; language: string; status: string; clicksCount: number; createdAt: string; isPinned?: boolean; }
interface User { id: string; email: string; name: string; role: 'user' | 'admin'; isVerified: boolean; createdAt: string; }
interface Service { id: string; name: string; phone: string; secondPhone?: string; address?: string; website?: string; logo?: string; categoryId: string; description?: string; languages?: string[]; locationId: string; status: string; isPinned?: boolean; }
interface ServiceCategory { id: string; name: string; nameRu?: string; slug: string; icon: string; order: number; }

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [groups, setGroups] = useState<Group[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [editingGroup, setEditingGroup] = useState<any>(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [isNewGroup, setIsNewGroup] = useState(false);
  
  const [editingService, setEditingService] = useState<any>(null);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [isNewService, setIsNewService] = useState(false);

  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [isNewCategory, setIsNewCategory] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    await Promise.all([fetchGroups(), fetchUsers(), fetchServices(), fetchServiceCategories()]);
    setLoading(false);
  };

  const fetchGroups = async () => { try { const res = await fetch('/api/admin/groups'); const data = await res.json(); setGroups(Array.isArray(data) ? data : []); } catch (e) { console.error(e); } };
  const fetchUsers = async () => { try { const res = await fetch('/api/admin/users'); const data = await res.json(); setUsers(Array.isArray(data) ? data : []); } catch (e) { console.error(e); } };
  const fetchServices = async () => { try { const res = await fetch('/api/admin/services'); const data = await res.json(); setServices(Array.isArray(data) ? data : []); } catch (e) { console.error(e); } };
  const fetchServiceCategories = async () => { try { const res = await fetch('/api/admin/service-categories'); const data = await res.json(); setServiceCategories(Array.isArray(data) ? data : []); } catch (e) { console.error(e); } };

  // User handlers
  const handleToggleAdmin = async (user: User) => { if (!confirm(`Change ${user.email} role?`)) return; await fetch('/api/admin/users', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: user.email, role: user.role === 'admin' ? 'user' : 'admin' }) }); fetchUsers(); };
  const handleDeleteUser = async (email: string) => { if (!confirm(`Delete ${email}?`)) return; await fetch('/api/admin/users', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) }); fetchUsers(); };

  // Group handlers
  const handleNewGroup = () => { setEditingGroup({ id: '', title: '', description: '', whatsappLinks: [''], categoryId: '1', locationId: '1', language: 'English', status: 'approved', clicksCount: 0, createdAt: '' }); setIsNewGroup(true); setShowGroupModal(true); };
  const handleEditGroup = (g: Group) => { 
    const links = g.whatsappLinks || (g as any).whatsappLink ? [(g as any).whatsappLink] : [''];
    setEditingGroup({ ...g, whatsappLinks: links.length ? links : [''] }); 
    setIsNewGroup(false); 
    setShowGroupModal(true); 
  };
  const handleSaveGroup = async () => {
    if (!editingGroup?.title) return alert('Title required');
    setSaving(true);
    const dataToSave = { ...editingGroup, whatsappLinks: editingGroup.whatsappLinks.filter((l: string) => l.trim()) };
    await fetch('/api/admin/groups', { method: isNewGroup ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dataToSave) });
    await fetchGroups(); setShowGroupModal(false); setSaving(false);
  };
  const handleDeleteGroup = async (id: string) => { if (!confirm('Delete?')) return; await fetch('/api/admin/groups', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }); fetchGroups(); };
  const handleTogglePin = async (g: Group) => { await fetch('/api/admin/groups', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...g, isPinned: !g.isPinned }) }); fetchGroups(); };

  const addWhatsAppLink = () => { setEditingGroup({ ...editingGroup, whatsappLinks: [...editingGroup.whatsappLinks, ''] }); };
  const removeWhatsAppLink = (index: number) => { const links = [...editingGroup.whatsappLinks]; links.splice(index, 1); setEditingGroup({ ...editingGroup, whatsappLinks: links.length ? links : [''] }); };
  const updateWhatsAppLink = (index: number, value: string) => { const links = [...editingGroup.whatsappLinks]; links[index] = value; setEditingGroup({ ...editingGroup, whatsappLinks: links }); };

  // Service handlers
  const handleNewService = () => { setEditingService({ id: '', name: '', phone: '', secondPhone: '', address: '', website: '', logo: '', categoryId: serviceCategories[0]?.id || '1', description: '', languages: ['English'], locationId: '1', status: 'approved' }); setIsNewService(true); setShowServiceModal(true); };
  const handleEditService = (s: Service) => { setEditingService({ ...s }); setIsNewService(false); setShowServiceModal(true); };
  const handleSaveService = async () => {
    if (!editingService?.name || !editingService?.phone) return alert('Name and Phone required');
    setSaving(true);
    const res = await fetch('/api/admin/services', { method: isNewService ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingService) });
    if (res.ok) { await fetchServices(); setShowServiceModal(false); } else alert('Error saving');
    setSaving(false);
  };
  const handleDeleteService = async (id: string) => { if (!confirm('Delete?')) return; await fetch('/api/admin/services', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }); fetchServices(); };
  const handleToggleServicePin = async (s: Service) => { await fetch('/api/admin/services', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...s, isPinned: !s.isPinned }) }); fetchServices(); };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) { alert('File must be less than 1MB'); return; }
    const reader = new FileReader();
    reader.onloadend = () => { setEditingService({ ...editingService, logo: reader.result as string }); };
    reader.readAsDataURL(file);
  };

  // Category handlers
  const handleNewCategory = () => { setEditingCategory({ id: '', name: '', nameRu: '', slug: '', icon: '🔧', order: 0 }); setIsNewCategory(true); setShowCategoryModal(true); };
  const handleEditCategory = (c: ServiceCategory) => { setEditingCategory({ ...c }); setIsNewCategory(false); setShowCategoryModal(true); };
  const handleSaveCategory = async () => {
    if (!editingCategory?.name) return alert('Name required');
    setSaving(true);
    const res = await fetch('/api/admin/service-categories', { method: isNewCategory ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingCategory) });
    if (res.ok) { await fetchServiceCategories(); setShowCategoryModal(false); } else alert('Error saving');
    setSaving(false);
  };
  const handleDeleteCategory = async (id: string) => {
    if (services.some(s => s.categoryId === id)) return alert('Cannot delete - has services');
    if (!confirm('Delete?')) return;
    await fetch('/api/admin/service-categories', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    fetchServiceCategories();
  };

  const navItems = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: '📊' },
    { id: 'groups' as Tab, label: 'Groups', icon: '👥' },
    { id: 'users' as Tab, label: 'Users', icon: '👤' },
    { id: 'services' as Tab, label: 'Services', icon: '🔧' },
    { id: 'service-categories' as Tab, label: 'Service Types', icon: '🏷️' },
  ];

  const inputStyle = { padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', width: '100%', boxSizing: 'border-box' as const };
  const btnStyle = (disabled: boolean) => ({ flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', background: disabled ? '#ccc' : '#2563eb', color: 'white', cursor: disabled ? 'not-allowed' : 'pointer', fontWeight: 'bold' as const });

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header"><h2 className="admin-sidebar-title">Admin Panel</h2></div>
        <nav>
          <ul className="admin-nav">
            {navItems.map(item => (
              <li key={item.id} className={`admin-nav-item ${activeTab === item.id ? 'active' : ''}`} onClick={() => setActiveTab(item.id)}>
                <span>{item.icon}</span><span>{item.label}</span>
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
              <div className="stat-card"><p className="stat-label">Users</p><p className="stat-value">{users.length}</p></div>
              <div className="stat-card"><p className="stat-label">Services</p><p className="stat-value">{services.length}</p></div>
              <div className="stat-card"><p className="stat-label">Service Types</p><p className="stat-value">{serviceCategories.length}</p></div>
            </div>
          </>
        )}

        {activeTab === 'groups' && (
          <>
            <div className="admin-header"><h1 className="admin-title">Groups ({groups.length})</h1><button className="admin-btn" onClick={handleNewGroup}>+ Add</button></div>
            <div className="admin-card">
              <table className="admin-table">
                <thead><tr><th>Pin</th><th>Title</th><th>Category</th><th>Links</th><th>Actions</th></tr></thead>
                <tbody>
                  {groups.map(g => {
                    const cat = defaultCategories.find(c => c.id === g.categoryId);
                    const linkCount = g.whatsappLinks?.length || ((g as any).whatsappLink ? 1 : 0);
                    return (
                      <tr key={g.id} style={g.isPinned ? { background: '#fef3c7' } : {}}>
                        <td><button onClick={() => handleTogglePin(g)} style={{ background: g.isPinned ? '#f59e0b' : '#e5e7eb', border: 'none', borderRadius: '4px', padding: '6px 10px', cursor: 'pointer' }}>{g.isPinned ? '⭐' : '☆'}</button></td>
                        <td><strong>{g.title}</strong></td>
                        <td>{cat?.icon} {cat?.name}</td>
                        <td>{linkCount} link{linkCount !== 1 ? 's' : ''}</td>
                        <td><button className="action-btn edit" onClick={() => handleEditGroup(g)}>Edit</button><button className="action-btn delete" onClick={() => handleDeleteGroup(g.id)}>Delete</button></td>
                      </tr>
                    );
                  })}
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

        {activeTab === 'services' && (
          <>
            <div className="admin-header"><h1 className="admin-title">Services ({services.length})</h1><button className="admin-btn" onClick={handleNewService}>+ Add</button></div>
            <div className="admin-card">
              <table className="admin-table">
                <thead><tr><th>Pin</th><th>Logo</th><th>Name</th><th>Category</th><th>Phone</th><th>Actions</th></tr></thead>
                <tbody>
                  {services.map(s => {
                    const cat = serviceCategories.find(c => c.id === s.categoryId);
                    return (
                      <tr key={s.id} style={s.isPinned ? { background: '#fef3c7' } : {}}>
                        <td><button onClick={() => handleToggleServicePin(s)} style={{ background: s.isPinned ? '#f59e0b' : '#e5e7eb', border: 'none', borderRadius: '4px', padding: '6px 10px', cursor: 'pointer' }}>{s.isPinned ? '⭐' : '☆'}</button></td>
                        <td>{s.logo ? <img src={s.logo} alt="" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} /> : <span style={{ fontSize: '1.5rem' }}>{cat?.icon || '🔧'}</span>}</td>
                        <td><strong>{s.name}</strong></td>
                        <td>{cat?.name}</td>
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
            <div className="admin-header"><h1 className="admin-title">Service Types ({serviceCategories.length})</h1><button className="admin-btn" onClick={handleNewCategory}>+ Add</button></div>
            <div className="admin-card">
              <table className="admin-table">
                <thead><tr><th>Icon</th><th>Name (EN)</th><th>Name (RU)</th><th>Services</th><th>Actions</th></tr></thead>
                <tbody>
                  {serviceCategories.sort((a,b) => (a.order||0) - (b.order||0)).map(c => (
                    <tr key={c.id}>
                      <td style={{ fontSize: '1.5rem' }}>{c.icon}</td>
                      <td><strong>{c.name}</strong></td>
                      <td>{c.nameRu || '-'}</td>
                      <td>{services.filter(s => s.categoryId === c.id).length}</td>
                      <td><button className="action-btn edit" onClick={() => handleEditCategory(c)}>Edit</button><button className="action-btn delete" onClick={() => handleDeleteCategory(c.id)}>Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>

      {/* Group Modal */}
      {showGroupModal && editingGroup && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflow: 'auto' }}>
            <h2>{isNewGroup ? 'Add Group' : 'Edit Group'}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <input style={inputStyle} placeholder="Title *" value={editingGroup.title} onChange={e => setEditingGroup({ ...editingGroup, title: e.target.value })} />
              
              <div>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>WhatsApp Links</label>
                {editingGroup.whatsappLinks.map((link: string, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input style={{ ...inputStyle, flex: 1 }} placeholder="https://chat.whatsapp.com/..." value={link} onChange={e => updateWhatsAppLink(i, e.target.value)} />
                    {editingGroup.whatsappLinks.length > 1 && (
                      <button onClick={() => removeWhatsAppLink(i)} style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '8px', background: 'white', cursor: 'pointer' }}>✕</button>
                    )}
                  </div>
                ))}
                <button onClick={addWhatsAppLink} style={{ padding: '0.5rem 1rem', border: '1px solid #2563eb', borderRadius: '8px', background: 'white', color: '#2563eb', cursor: 'pointer' }}>+ Add Link</button>
              </div>
              
              <textarea style={inputStyle} placeholder="Description" value={editingGroup.description} onChange={e => setEditingGroup({ ...editingGroup, description: e.target.value })} rows={3} />
              <select style={inputStyle} value={editingGroup.categoryId} onChange={e => setEditingGroup({ ...editingGroup, categoryId: e.target.value })}>
                {defaultCategories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
              <select style={inputStyle} value={editingGroup.language} onChange={e => setEditingGroup({ ...editingGroup, language: e.target.value })}>
                <option value="English">🇺🇸 English</option><option value="Russian">🇷🇺 Russian</option><option value="Hebrew">🇮🇱 Hebrew</option>
              </select>
              <label><input type="checkbox" checked={editingGroup.isPinned || false} onChange={e => setEditingGroup({ ...editingGroup, isPinned: e.target.checked })} /> ⭐ Pin</label>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button onClick={() => setShowGroupModal(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSaveGroup} disabled={saving || !editingGroup.title} style={btnStyle(saving || !editingGroup.title)}>{saving ? 'Saving...' : 'Save'}</button>
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
              
              {/* Logo Upload */}
              <div>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Logo (max 1MB)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {editingService.logo && (
                    <img src={editingService.logo} alt="Logo" style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                  )}
                  <input type="file" accept="image/*" onChange={handleLogoUpload} />
                  {editingService.logo && (
                    <button onClick={() => setEditingService({ ...editingService, logo: '' })} style={{ padding: '0.25rem 0.5rem', border: '1px solid #ddd', borderRadius: '4px', background: 'white', cursor: 'pointer' }}>Remove</button>
                  )}
                </div>
              </div>

              <input style={inputStyle} placeholder="Name *" value={editingService.name} onChange={e => setEditingService({ ...editingService, name: e.target.value })} />
              <input style={inputStyle} placeholder="Phone *" value={editingService.phone} onChange={e => setEditingService({ ...editingService, phone: e.target.value })} />
              <input style={inputStyle} placeholder="Second Phone" value={editingService.secondPhone || ''} onChange={e => setEditingService({ ...editingService, secondPhone: e.target.value })} />
              <input style={inputStyle} placeholder="Address" value={editingService.address || ''} onChange={e => setEditingService({ ...editingService, address: e.target.value })} />
              <input style={inputStyle} placeholder="Website" value={editingService.website || ''} onChange={e => setEditingService({ ...editingService, website: e.target.value })} />
              
              <select style={inputStyle} value={editingService.categoryId} onChange={e => setEditingService({ ...editingService, categoryId: e.target.value })}>
                {serviceCategories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
              <textarea style={inputStyle} placeholder="Description" value={editingService.description || ''} onChange={e => setEditingService({ ...editingService, description: e.target.value })} rows={2} />
              <div>
                <label style={{ fontWeight: 'bold' }}>Languages:</label>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  {['English', 'Russian', 'Hebrew', 'Yiddish'].map(lang => (
                    <label key={lang}><input type="checkbox" checked={editingService.languages?.includes(lang)} onChange={e => {
                      const langs = editingService.languages || [];
                      setEditingService({ ...editingService, languages: e.target.checked ? [...langs, lang] : langs.filter((l: string) => l !== lang) });
                    }} /> {lang}</label>
                  ))}
                </div>
              </div>
              <label><input type="checkbox" checked={editingService.isPinned || false} onChange={e => setEditingService({ ...editingService, isPinned: e.target.checked })} /> ⭐ Pin</label>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button onClick={() => setShowServiceModal(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSaveService} disabled={saving || !editingService.name || !editingService.phone} style={btnStyle(saving || !editingService.name || !editingService.phone)}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && editingCategory && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', width: '90%', maxWidth: '500px' }}>
            <h2>{isNewCategory ? 'Add Service Type' : 'Edit Service Type'}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div><label style={{ fontWeight: 'bold' }}>Icon (emoji)</label><input style={inputStyle} placeholder="🔧" value={editingCategory.icon} onChange={e => setEditingCategory({ ...editingCategory, icon: e.target.value })} /></div>
              <div><label style={{ fontWeight: 'bold' }}>Name (English) *</label><input style={inputStyle} placeholder="Plumber" value={editingCategory.name} onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })} /></div>
              <div><label style={{ fontWeight: 'bold' }}>Name (Russian)</label><input style={inputStyle} placeholder="Сантехник" value={editingCategory.nameRu || ''} onChange={e => setEditingCategory({ ...editingCategory, nameRu: e.target.value })} /></div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button onClick={() => setShowCategoryModal(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSaveCategory} disabled={saving || !editingCategory.name} style={btnStyle(saving || !editingCategory.name)}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
