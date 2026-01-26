'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { categories, locations, suggestions, serviceCategories, serviceContacts, emergencyContacts } from '@/lib/data';

type Tab = 'dashboard' | 'groups' | 'users' | 'categories' | 'locations' | 'suggestions' | 'services' | 'emergency';

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

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [groups, setGroups] = useState<Group[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isNewGroup, setIsNewGroup] = useState(false);

  useEffect(() => {
    fetchGroups();
    fetchUsers();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await fetch('/api/admin/groups');
      const data = await res.json();
      setGroups(data);
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
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleToggleAdmin = async (user: User) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    if (!confirm(`Make ${user.email} ${newRole === 'admin' ? 'an admin' : 'a regular user'}?`)) return;
    
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, role: newRole })
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (email: string) => {
    if (!confirm(`Delete user ${email}? This cannot be undone.`)) return;
    
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleEditGroup = (group: Group) => {
    setEditingGroup({ ...group });
    setIsNewGroup(false);
    setShowModal(true);
  };

  const handleNewGroup = () => {
    setEditingGroup({
      id: '',
      title: '',
      description: '',
      whatsappLink: '',
      categoryId: '1',
      locationId: '1',
      language: 'English',
      status: 'approved',
      clicksCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    });
    setIsNewGroup(true);
    setShowModal(true);
  };

  const handleSaveGroup = async () => {
    if (!editingGroup) return;
    try {
      const method = isNewGroup ? 'POST' : 'PUT';
      const res = await fetch('/api/admin/groups', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingGroup)
      });
      if (res.ok) {
        await fetchGroups();
        setShowModal(false);
        setEditingGroup(null);
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

  const navItems: { id: Tab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'groups', label: 'Groups', icon: '👥' },
    { id: 'users', label: 'Users', icon: '👤' },
    { id: 'categories', label: 'Categories', icon: '📁' },
    { id: 'services', label: 'Services', icon: '🔧' },
    { id: 'emergency', label: 'Emergency', icon: '🚨' },
  ];

  const pinnedCount = groups.filter(g => g.isPinned).length;
  const totalClicks = groups.reduce((sum, g) => sum + g.clicksCount, 0);
  const adminCount = users.filter(u => u.role === 'admin').length;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2 className="admin-sidebar-title">Admin Panel</h2>
        </div>
        <nav>
          <ul className="admin-nav">
            {navItems.map(item => (
              <li 
                key={item.id}
                className={`admin-nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
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
              <div className="stat-card">
                <p className="stat-label">Total Groups</p>
                <p className="stat-value">{groups.length}</p>
              </div>
              <div className="stat-card">
                <p className="stat-label">Pinned (Paid)</p>
                <p className="stat-value" style={{ color: 'var(--accent)' }}>⭐ {pinnedCount}</p>
              </div>
              <div className="stat-card">
                <p className="stat-label">Users</p>
                <p className="stat-value">{users.length}</p>
              </div>
              <div className="stat-card">
                <p className="stat-label">Admins</p>
                <p className="stat-value">{adminCount}</p>
              </div>
              <div className="stat-card">
                <p className="stat-label">Total Views</p>
                <p className="stat-value">{totalClicks.toLocaleString()}</p>
              </div>
            </div>
          </>
        )}

        {activeTab === 'groups' && (
          <>
            <div className="admin-header">
              <h1 className="admin-title">Groups</h1>
              <button className="admin-btn" onClick={handleNewGroup}>+ Add Group</button>
            </div>
            <div className="admin-card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Pin</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Language</th>
                    <th>Views</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map(group => {
                    const category = categories.find(c => c.id === group.categoryId);
                    return (
                      <tr key={group.id} style={group.isPinned ? { background: '#fef3c7' } : {}}>
                        <td>
                          <button onClick={() => handleTogglePin(group)} style={{ background: group.isPinned ? '#f59e0b' : '#e5e7eb', border: 'none', borderRadius: '4px', padding: '6px 10px', cursor: 'pointer' }}>
                            {group.isPinned ? '⭐' : '☆'}
                          </button>
                        </td>
                        <td><strong>{group.title}</strong></td>
                        <td>{category?.icon} {category?.name}</td>
                        <td>{group.language || 'English'}</td>
                        <td>{group.clicksCount}</td>
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
            <div className="admin-header">
              <h1 className="admin-title">Users ({users.length})</h1>
            </div>
            <div className="admin-card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Verified</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.email} style={user.role === 'admin' ? { background: '#dbeafe' } : {}}>
                      <td><strong>{user.name}</strong></td>
                      <td>{user.email}</td>
                      <td>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.85rem',
                          background: user.role === 'admin' ? '#2563eb' : '#e5e7eb',
                          color: user.role === 'admin' ? 'white' : '#333'
                        }}>
                          {user.role === 'admin' ? '👑 Admin' : 'User'}
                        </span>
                      </td>
                      <td>{user.isVerified ? '✅' : '❌'}</td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button 
                          className="action-btn edit" 
                          onClick={() => handleToggleAdmin(user)}
                        >
                          {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                        </button>
                        <button 
                          className="action-btn delete" 
                          onClick={() => handleDeleteUser(user.email)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'categories' && (
          <>
            <div className="admin-header"><h1 className="admin-title">Categories</h1></div>
            <div className="admin-card">
              <p style={{ color: '#666', marginBottom: '1rem' }}>Categories are managed in the code. Contact developer to add new categories.</p>
              <table className="admin-table">
                <thead><tr><th>Icon</th><th>Name</th><th>Groups</th></tr></thead>
                <tbody>
                  {categories.map(cat => (
                    <tr key={cat.id}>
                      <td>{cat.icon}</td>
                      <td>{cat.name}</td>
                      <td>{groups.filter(g => g.categoryId === cat.id).length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'services' && (
          <>
            <div className="admin-header"><h1 className="admin-title">Services</h1></div>
            <div className="admin-card">
              <p style={{ color: '#666', marginBottom: '1rem' }}>Service contacts are managed in the code. Contact developer to add new services.</p>
              <table className="admin-table">
                <thead><tr><th>Name</th><th>Category</th><th>Phone</th></tr></thead>
                <tbody>
                  {serviceContacts.map(contact => {
                    const cat = serviceCategories.find(c => c.id === contact.categoryId);
                    return (
                      <tr key={contact.id}>
                        <td>{contact.name}</td>
                        <td>{cat?.icon} {cat?.name}</td>
                        <td>{contact.phone}</td>
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
              <table className="admin-table">
                <thead><tr><th>Icon</th><th>Name</th><th>Phone</th></tr></thead>
                <tbody>
                  {emergencyContacts.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontSize: '1.5rem' }}>{c.icon}</td>
                      <td><strong>{c.name}</strong></td>
                      <td>{c.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>

      {showModal && editingGroup && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflow: 'auto' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>{isNewGroup ? 'Add New Group' : 'Edit Group'}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Title *</label>
                <input type="text" value={editingGroup.title} onChange={e => setEditingGroup({ ...editingGroup, title: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>WhatsApp Link *</label>
                <input type="url" value={editingGroup.whatsappLink} onChange={e => setEditingGroup({ ...editingGroup, whatsappLink: e.target.value })} placeholder="https://chat.whatsapp.com/..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Description</label>
                <textarea value={editingGroup.description} onChange={e => setEditingGroup({ ...editingGroup, description: e.target.value })} rows={3} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Category</label>
                <select value={editingGroup.categoryId} onChange={e => setEditingGroup({ ...editingGroup, categoryId: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>)}
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
                <select value={editingGroup.language || 'English'} onChange={e => setEditingGroup({ ...editingGroup, language: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}>
                  <option value="English">🇺🇸 English</option>
                  <option value="Russian">🇷🇺 Russian</option>
                  <option value="Hebrew">🇮🇱 Hebrew</option>
                  <option value="Yiddish">יידיש Yiddish</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={editingGroup.isPinned || false} onChange={e => setEditingGroup({ ...editingGroup, isPinned: e.target.checked })} style={{ width: '20px', height: '20px' }} />
                  <span style={{ fontWeight: 'bold' }}>⭐ Pin (Featured/Paid)</span>
                </label>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSaveGroup} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', background: '#2563eb', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>{isNewGroup ? 'Create' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
