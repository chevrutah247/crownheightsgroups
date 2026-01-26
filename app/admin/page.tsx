'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { categories as defaultCategories, locations, serviceCategories } from '@/lib/data';

type Tab = 'dashboard' | 'groups' | 'users' | 'categories' | 'services' | 'emergency';

interface Group {
  id: string;
  title: string;
  description: string;
  whatsappLink: string;
  categoryId: string;
  locationId: string;
  language: string;
  status: string;
  clicksCount: number;
  createdAt: string;
  isPinned?: boolean;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  createdAt: string;
}

interface Service {
  id: string;
  name: string;
  phone: string;
  secondPhone?: string;
  categoryId: string;
  description?: string;
  languages?: string[];
  locationId: string;
  status: string;
  isPinned?: boolean;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [groups, setGroups] = useState<Group[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Group modal
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [isNewGroup, setIsNewGroup] = useState(false);
  
  // Service modal
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [isNewService, setIsNewService] = useState(false);

  useEffect(() => {
    fetchGroups();
    fetchUsers();
    fetchServices();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await fetch('/api/admin/groups');
      const data = await res.json();
      setGroups(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/admin/services');
      const data = await res.json();
      setServices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  // User handlers
  const handleToggleAdmin = async (user: User) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    if (!confirm(`Make ${user.email} ${newRole === 'admin' ? 'an admin' : 'a regular user'}?`)) return;
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, role: newRole })
      });
      if (res.ok) fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (email: string) => {
    if (!confirm(`Delete user ${email}?`)) return;
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  // Group handlers
  const handleEditGroup = (group: Group) => {
    setEditingGroup({ ...group });
    setIsNewGroup(false);
    setShowGroupModal(true);
  };

  const handleNewGroup = () => {
    setEditingGroup({
      id: '', title: '', description: '', whatsappLink: '',
      categoryId: '1', locationId: '1', language: 'English',
      status: 'approved', clicksCount: 0, createdAt: ''
    });
    setIsNewGroup(true);
    setShowGroupModal(true);
  };

  const handleSaveGroup = async () => {
    if (!editingGroup) return;
    try {
      const res = await fetch('/api/admin/groups', {
        method: isNewGroup ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingGroup)
      });
      if (res.ok) {
        await fetchGroups();
        setShowGroupModal(false);
      }
    } catch (error) {
      console.error('Error saving group:', error);
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (!confirm('Delete this group?')) return;
    try {
      const res = await fetch('/api/admin/groups', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) fetchGroups();
    } catch (error) {
      console.error('Error deleting group:', error);
    }
  };

  const handleTogglePin = async (group: Group) => {
    try {
      const res = await fetch('/api/admin/groups', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...group, isPinned: !group.isPinned })
      });
      if (res.ok) fetchGroups();
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  // Service handlers
  const handleEditService = (service: Service) => {
    setEditingService({ ...service });
    setIsNewService(false);
    setShowServiceModal(true);
  };

  const handleNewService = () => {
    setEditingService({
      id: '', name: '', phone: '', secondPhone: '',
      categoryId: '1', description: '', languages: ['English'],
      locationId: '1', status: 'approved'
    });
    setIsNewService(true);
    setShowServiceModal(true);
  };

  const handleSaveService = async () => {
    if (!editingService) return;
    try {
      const res = await fetch('/api/admin/services', {
        method: isNewService ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingService)
      });
      if (res.ok) {
        await fetchServices();
        setShowServiceModal(false);
      }
    } catch (error) {
      console.error('Error saving service:', error);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Delete this service contact?')) return;
    try {
      const res = await fetch('/api/admin/services', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  const handleToggleServicePin = async (service: Service) => {
    try {
      const res = await fetch('/api/admin/services', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...service, isPinned: !service.isPinned })
      });
      if (res.ok) fetchServices();
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  const navItems: { id: Tab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'groups', label: 'Groups', icon: '👥' },
    { id: 'users', label: 'Users', icon: '👤' },
    { id: 'services', label: 'Services', icon: '🔧' },
    { id: 'emergency', label: 'Emergency', icon: '🚨' },
  ];

  const pinnedCount = groups.filter(g => g.isPinned).length;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2 className="admin-sidebar-title">Admin Panel</h2>
        </div>
        <nav>
          <ul className="admin-nav">
            {navItems.map(item => (
              <li key={item.id} className={`admin-nav-item ${activeTab === item.id ? 'active' : ''}`} onClick={() => setActiveTab(item.id)}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </li>
            ))}
            <li className="admin-nav-item" style={{ marginTop: 'auto' }}>
              <Link href="/" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span>🏠</span>
                <span>Back to Site</span>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      <main className="admin-content">
        {activeTab === 'dashboard' && (
          <>
            <div className="admin-header"><h1 className="admin-title">Dashboard</h1></div>
            <div className="stats-grid">
              <div className="stat-card"><p className="stat-label">Total Groups</p><p className="stat-value">{groups.length}</p></div>
              <div className="stat-card"><p className="stat-label">Pinned Groups</p><p className="stat-value">⭐ {pinnedCount}</p></div>
              <div className="stat-card"><p className="stat-label">Users</p><p className="stat-value">{users.length}</p></div>
              <div className="stat-card"><p className="stat-label">Services</p><p className="stat-value">{services.length}</p></div>
            </div>
          </>
        )}

        {activeTab === 'groups' && (
          <>
            <div className="admin-header">
              <h1 className="admin-title">Groups ({groups.length})</h1>
              <button className="admin-btn" onClick={handleNewGroup}>+ Add Group</button>
            </div>
            <div className="admin-card">
              <table className="admin-table">
                <thead><tr><th>Pin</th><th>Title</th><th>Category</th><th>Language</th><th>Actions</th></tr></thead>
                <tbody>
                  {groups.map(group => {
                    const cat = defaultCategories.find(c => c.id === group.categoryId);
                    return (
                      <tr key={group.id} style={group.isPinned ? { background: '#fef3c7' } : {}}>
                        <td><button onClick={() => handleTogglePin(group)} style={{ background: group.isPinned ? '#f59e0b' : '#e5e7eb', border: 'none', borderRadius: '4px', padding: '6px 10px', cursor: 'pointer' }}>{group.isPinned ? '⭐' : '☆'}</button></td>
                        <td><strong>{group.title}</strong></td>
                        <td>{cat?.icon} {cat?.name}</td>
                        <td>{group.language}</td>
                        <td>
                          <button className="action-btn edit" onClick={() => handleEditGroup(group)}>Edit</button>
                          <button className="action-btn delete" onClick={() => handleDeleteGroup(group.id)}>Delete</button>
                        </td>
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
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Verified</th><th>Actions</th></tr></thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.email} style={user.role === 'admin' ? { background: '#dbeafe' } : {}}>
                      <td><strong>{user.name}</strong></td>
                      <td>{user.email}</td>
                      <td><span style={{ padding: '4px 8px', borderRadius: '4px', background: user.role === 'admin' ? '#2563eb' : '#e5e7eb', color: user.role === 'admin' ? 'white' : '#333' }}>{user.role === 'admin' ? '👑 Admin' : 'User'}</span></td>
                      <td>{user.isVerified ? '✅' : '❌'}</td>
                      <td>
                        <button className="action-btn edit" onClick={() => handleToggleAdmin(user)}>{user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}</button>
                        <button className="action-btn delete" onClick={() => handleDeleteUser(user.email)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'services' && (
          <>
            <div className="admin-header">
              <h1 className="admin-title">Services ({services.length})</h1>
              <button className="admin-btn" onClick={handleNewService}>+ Add Service</button>
            </div>
            <div className="admin-card">
              <table className="admin-table">
                <thead><tr><th>Pin</th><th>Name</th><th>Category</th><th>Phone</th><th>Languages</th><th>Actions</th></tr></thead>
                <tbody>
                  {services.map(service => {
                    const cat = serviceCategories.find(c => c.id === service.categoryId);
                    return (
                      <tr key={service.id} style={service.isPinned ? { background: '#fef3c7' } : {}}>
                        <td><button onClick={() => handleToggleServicePin(service)} style={{ background: service.isPinned ? '#f59e0b' : '#e5e7eb', border: 'none', borderRadius: '4px', padding: '6px 10px', cursor: 'pointer' }}>{service.isPinned ? '⭐' : '☆'}</button></td>
                        <td><strong>{service.name}</strong></td>
                        <td>{cat?.icon} {cat?.name}</td>
                        <td>{service.phone}{service.secondPhone && <><br/><small>{service.secondPhone}</small></>}</td>
                        <td>{service.languages?.join(', ') || '-'}</td>
                        <td>
                          <button className="action-btn edit" onClick={() => handleEditService(service)}>Edit</button>
                          <button className="action-btn delete" onClick={() => handleDeleteService(service.id)}>Delete</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'emergency' && (
          <>
            <div className="admin-header"><h1 className="admin-title">Emergency Contacts</h1></div>
            <div className="admin-card">
              <p style={{ color: '#666', marginBottom: '1rem' }}>Emergency contacts (Hatzolah, Shomrim, Chaveirim) are configured in the system.</p>
            </div>
          </>
        )}
      </main>

      {/* Group Modal */}
      {showGroupModal && editingGroup && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflow: 'auto' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>{isNewGroup ? 'Add New Group' : 'Edit Group'}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Title *</label>
                <input type="text" value={editingGroup.title} onChange={e => setEditingGroup({ ...editingGroup, title: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>WhatsApp Link</label>
                <input type="url" value={editingGroup.whatsappLink} onChange={e => setEditingGroup({ ...editingGroup, whatsappLink: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Description</label>
                <textarea value={editingGroup.description} onChange={e => setEditingGroup({ ...editingGroup, description: e.target.value })} rows={3} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Category</label>
                <select value={editingGroup.categoryId} onChange={e => setEditingGroup({ ...editingGroup, categoryId: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}>
                  {defaultCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Location</label>
                <select value={editingGroup.locationId} onChange={e => setEditingGroup({ ...editingGroup, locationId: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}>
                  {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.neighborhood}, {loc.city}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Language</label>
                <select value={editingGroup.language} onChange={e => setEditingGroup({ ...editingGroup, language: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}>
                  <option value="English">🇺🇸 English</option>
                  <option value="Russian">🇷🇺 Russian</option>
                  <option value="Hebrew">🇮🇱 Hebrew</option>
                  <option value="Yiddish">יידיש Yiddish</option>
                </select>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" checked={editingGroup.isPinned || false} onChange={e => setEditingGroup({ ...editingGroup, isPinned: e.target.checked })} />
                <span>⭐ Pin (Featured)</span>
              </label>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button onClick={() => setShowGroupModal(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSaveGroup} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', background: '#2563eb', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>{isNewGroup ? 'Create' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Service Modal */}
      {showServiceModal && editingService && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflow: 'auto' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>{isNewService ? 'Add New Service' : 'Edit Service'}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Name *</label>
                <input type="text" value={editingService.name} onChange={e => setEditingService({ ...editingService, name: e.target.value })} placeholder="e.g. Moshe Plumbing" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Phone *</label>
                <input type="tel" value={editingService.phone} onChange={e => setEditingService({ ...editingService, phone: e.target.value })} placeholder="718-555-0000" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Second Phone (optional)</label>
                <input type="tel" value={editingService.secondPhone || ''} onChange={e => setEditingService({ ...editingService, secondPhone: e.target.value })} placeholder="347-555-0000" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Category</label>
                <select value={editingService.categoryId} onChange={e => setEditingService({ ...editingService, categoryId: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}>
                  {serviceCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Description</label>
                <textarea value={editingService.description || ''} onChange={e => setEditingService({ ...editingService, description: e.target.value })} rows={2} placeholder="Brief description of services..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Languages</label>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {['English', 'Russian', 'Hebrew', 'Yiddish'].map(lang => (
                    <label key={lang} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <input 
                        type="checkbox" 
                        checked={editingService.languages?.includes(lang) || false}
                        onChange={e => {
                          const langs = editingService.languages || [];
                          if (e.target.checked) {
                            setEditingService({ ...editingService, languages: [...langs, lang] });
                          } else {
                            setEditingService({ ...editingService, languages: langs.filter(l => l !== lang) });
                          }
                        }}
                      />
                      {lang}
                    </label>
                  ))}
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" checked={editingService.isPinned || false} onChange={e => setEditingService({ ...editingService, isPinned: e.target.checked })} />
                <span>⭐ Pin (Featured)</span>
              </label>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button onClick={() => setShowServiceModal(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSaveService} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', background: '#2563eb', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>{isNewService ? 'Create' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
