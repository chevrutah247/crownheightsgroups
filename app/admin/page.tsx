'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { categories, locations, suggestions, serviceCategories, serviceContacts, emergencyContacts } from '@/lib/data';

type Tab = 'dashboard' | 'groups' | 'categories' | 'locations' | 'suggestions' | 'services' | 'service-categories' | 'emergency' | 'banner';

interface Group {
  id: string;
  title: string;
  description: string;
  whatsappLink: string;
  categoryId: string;
  locationId: string;
  language: string;
  tags?: string[];
  status: string;
  clicksCount: number;
  createdAt: string;
  isPinned?: boolean;
  pinnedOrder?: number;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isNewGroup, setIsNewGroup] = useState(false);

  // Load groups from API
  useEffect(() => {
    fetchGroups();
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
    console.log("Saving group:", editingGroup);
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
    if (!confirm('Are you sure you want to delete this group?')) return;

    try {
      const res = await fetch('/api/admin/groups', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (res.ok) {
        await fetchGroups();
      }
    } catch (error) {
      console.error('Error deleting group:', error);
    }
  };

  const handleTogglePin = async (group: Group) => {
    const updatedGroup = { ...group, isPinned: !group.isPinned };
    
    try {
      const res = await fetch('/api/admin/groups', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedGroup)
      });

      if (res.ok) {
        await fetchGroups();
      }
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  const navItems: { id: Tab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'groups', label: 'Groups', icon: '👥' },
    { id: 'categories', label: 'Categories', icon: '📁' },
    { id: 'locations', label: 'Locations', icon: '📍' },
    { id: 'services', label: 'Service Contacts', icon: '🔧' },
    { id: 'service-categories', label: 'Service Types', icon: '🏷️' },
    { id: 'emergency', label: 'Emergency', icon: '🚨' },
    { id: 'suggestions', label: 'Suggestions', icon: '📬' },
    { id: 'banner', label: 'Banner', icon: '📢' },
  ];

  const pendingSuggestions = suggestions.filter(s => s.status === 'pending');
  const pinnedCount = groups.filter(g => g.isPinned).length;
  const totalClicks = groups.reduce((sum, g) => sum + g.clicksCount, 0);

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
                {item.id === 'suggestions' && pendingSuggestions.length > 0 && (
                  <span style={{
                    marginLeft: 'auto',
                    background: 'var(--accent)',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    fontSize: '0.75rem'
                  }}>
                    {pendingSuggestions.length}
                  </span>
                )}
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
            <div className="admin-header">
              <h1 className="admin-title">Dashboard</h1>
            </div>
            
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
                <p className="stat-label">Service Contacts</p>
                <p className="stat-value">{serviceContacts.length}</p>
              </div>
              <div className="stat-card">
                <p className="stat-label">Total Locations</p>
                <p className="stat-value">{locations.length}</p>
              </div>
              <div className="stat-card">
                <p className="stat-label">Categories</p>
                <p className="stat-value">{categories.length}</p>
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
            
            {loading ? (
              <div className="admin-card">Loading...</div>
            ) : (
              <div className="admin-card">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Pin ⭐</th>
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
                            <button 
                              onClick={() => handleTogglePin(group)}
                              style={{
                                background: group.isPinned ? '#f59e0b' : '#e5e7eb',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '6px 10px',
                                cursor: 'pointer',
                                fontSize: '1rem'
                              }}
                              title={group.isPinned ? 'Unpin (remove from paid)' : 'Pin (mark as paid)'}
                            >
                              {group.isPinned ? '⭐' : '☆'}
                            </button>
                          </td>
                          <td>
                            <strong>{group.title}</strong>
                            {group.whatsappLink && (
                              <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                <a href={group.whatsappLink} target="_blank" rel="noopener noreferrer">
                                  🔗 WhatsApp Link
                                </a>
                              </div>
                            )}
                          </td>
                          <td>{category?.icon} {category?.name || '-'}</td>
                          <td>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.8rem',
                              background: group.language === 'Russian' ? '#fee2e2' : 
                                         group.language === 'Hebrew' ? '#dbeafe' : '#d1fae5'
                            }}>
                              {group.language || 'English'}
                            </span>
                          </td>
                          <td>{group.clicksCount.toLocaleString()}</td>
                          <td>
                            <button 
                              className="action-btn edit"
                              onClick={() => handleEditGroup(group)}
                            >
                              Edit
                            </button>
                            <button 
                              className="action-btn delete"
                              onClick={() => handleDeleteGroup(group.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="admin-card" style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-warm)' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <strong>💡 Tip:</strong> Pinned groups (⭐) appear first in search results. 
                Use this for paid/featured listings!
              </p>
            </div>
          </>
        )}

        {activeTab === 'categories' && (
          <>
            <div className="admin-header">
              <h1 className="admin-title">Categories</h1>
            </div>
            <div className="admin-card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Icon</th>
                    <th>Name</th>
                    <th>Slug</th>
                    <th>Groups</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(cat => {
                    const groupCount = groups.filter(g => g.categoryId === cat.id).length;
                    return (
                      <tr key={cat.id}>
                        <td>{cat.icon}</td>
                        <td>{cat.name}</td>
                        <td>{cat.slug}</td>
                        <td>{groupCount}</td>
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
            <div className="admin-header">
              <h1 className="admin-title">Locations</h1>
            </div>
            <div className="admin-card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Neighborhood</th>
                    <th>City</th>
                    <th>State</th>
                    <th>Groups</th>
                  </tr>
                </thead>
                <tbody>
                  {locations.map(loc => {
                    const groupCount = groups.filter(g => g.locationId === loc.id).length;
                    return (
                      <tr key={loc.id}>
                        <td>{loc.neighborhood}</td>
                        <td>{loc.city}</td>
                        <td>{loc.state}</td>
                        <td>{groupCount}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'services' && (
          <>
            <div className="admin-header">
              <h1 className="admin-title">Service Contacts</h1>
            </div>
            <div className="admin-card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Phone</th>
                    <th>Languages</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceContacts.map(contact => {
                    const category = serviceCategories.find(c => c.id === contact.categoryId);
                    return (
                      <tr key={contact.id}>
                        <td>{contact.isPinned && '⭐ '}{contact.name}</td>
                        <td>{category ? `${category.icon} ${category.name}` : '-'}</td>
                        <td>{contact.phone}</td>
                        <td>{contact.languages?.join(', ') || '-'}</td>
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
            <div className="admin-header">
              <h1 className="admin-title">Service Types</h1>
            </div>
            <div className="admin-card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Icon</th>
                    <th>Name (EN)</th>
                    <th>Name (RU)</th>
                    <th>Contacts</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceCategories.map(cat => {
                    const contactCount = serviceContacts.filter(c => c.categoryId === cat.id).length;
                    return (
                      <tr key={cat.id}>
                        <td style={{ fontSize: '1.5rem' }}>{cat.icon}</td>
                        <td>{cat.name}</td>
                        <td>{cat.nameRu || '-'}</td>
                        <td>{contactCount}</td>
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
            <div className="admin-header">
              <h1 className="admin-title">Emergency Contacts</h1>
            </div>
            <div className="admin-card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Icon</th>
                    <th>Name</th>
                    <th>Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {emergencyContacts.map(contact => (
                    <tr key={contact.id}>
                      <td style={{ fontSize: '1.5rem' }}>{contact.icon}</td>
                      <td><strong>{contact.name}</strong></td>
                      <td>{contact.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'suggestions' && (
          <>
            <div className="admin-header">
              <h1 className="admin-title">Suggestions</h1>
            </div>
            <div className="admin-card">
              {pendingSuggestions.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  No pending suggestions
                </p>
              ) : (
                <p>Pending suggestions: {pendingSuggestions.length}</p>
              )}
            </div>
          </>
        )}

        {activeTab === 'banner' && (
          <>
            <div className="admin-header">
              <h1 className="admin-title">Banner Settings</h1>
            </div>
            <div className="admin-card">
              <p>Banner configuration coming soon...</p>
            </div>
          </>
        )}
      </main>

      {/* Edit Modal */}
      {showModal && editingGroup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ marginBottom: '1.5rem' }}>
              {isNewGroup ? 'Add New Group' : 'Edit Group'}
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Title *
                </label>
                <input
                  type="text"
                  value={editingGroup.title}
                  onChange={e => setEditingGroup({ ...editingGroup, title: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  WhatsApp Link *
                </label>
                <input
                  type="url"
                  value={editingGroup.whatsappLink}
                  onChange={e => setEditingGroup({ ...editingGroup, whatsappLink: e.target.value })}
                  placeholder="https://chat.whatsapp.com/..."
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Description
                </label>
                <textarea
                  value={editingGroup.description}
                  onChange={e => setEditingGroup({ ...editingGroup, description: e.target.value })}
                  rows={3}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Category
                </label>
                <select
                  value={editingGroup.categoryId}
                  onChange={e => setEditingGroup({ ...editingGroup, categoryId: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Location
                </label>
                <select
                  value={editingGroup.locationId}
                  onChange={e => setEditingGroup({ ...editingGroup, locationId: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                >
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.neighborhood}, {loc.city}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Language
                </label>
                <select
                  value={editingGroup.language || 'English'}
                  onChange={e => setEditingGroup({ ...editingGroup, language: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                >
                  <option value="English">🇺🇸 English</option>
                  <option value="Russian">🇷🇺 Russian</option>
                  <option value="Hebrew">🇮🇱 Hebrew</option>
                  <option value="Yiddish">יידיש Yiddish</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={editingGroup.isPinned || false}
                    onChange={e => setEditingGroup({ ...editingGroup, isPinned: e.target.checked })}
                    style={{ width: '20px', height: '20px' }}
                  />
                  <span style={{ fontWeight: 'bold' }}>⭐ Pin this group (Featured/Paid)</span>
                </label>
                <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                  Pinned groups appear at the top of search results
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveGroup}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#2563eb',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {isNewGroup ? 'Create Group' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
