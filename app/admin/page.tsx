'use client';

import { useState } from 'react';
import Link from 'next/link';
import { groups, categories, locations, suggestions, serviceCategories, serviceContacts, emergencyContacts, getStats } from '@/lib/data';

type Tab = 'dashboard' | 'groups' | 'categories' | 'locations' | 'suggestions' | 'services' | 'service-categories' | 'emergency' | 'banner';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const stats = getStats();

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
                <p className="stat-value">{stats.totalGroups}</p>
              </div>
              <div className="stat-card">
                <p className="stat-label">Service Contacts</p>
                <p className="stat-value">{serviceContacts.length}</p>
              </div>
              <div className="stat-card">
                <p className="stat-label">Total Locations</p>
                <p className="stat-value">{stats.totalLocations}</p>
              </div>
              <div className="stat-card">
                <p className="stat-label">Categories</p>
                <p className="stat-value">{stats.totalCategories}</p>
              </div>
              <div className="stat-card">
                <p className="stat-label">Pending Suggestions</p>
                <p className="stat-value">{stats.pendingSuggestions}</p>
              </div>
              <div className="stat-card">
                <p className="stat-label">Total Group Views</p>
                <p className="stat-value">{stats.totalClicks.toLocaleString()}</p>
              </div>
            </div>

            <div className="admin-card">
              <h3 style={{ marginBottom: '1rem' }}>Recent Activity</h3>
              <p style={{ color: 'var(--text-muted)' }}>
                Welcome to the Crown Heights Groups admin panel. 
                Use the sidebar to manage groups, categories, locations, and review suggestions.
              </p>
            </div>
          </>
        )}

        {activeTab === 'groups' && (
          <>
            <div className="admin-header">
              <h1 className="admin-title">Groups</h1>
              <button className="admin-btn">+ Add Group</button>
            </div>
            
            <div className="admin-card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Pinned</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Views</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map(group => {
                    const category = categories.find(c => c.id === group.categoryId);
                    const location = locations.find(l => l.id === group.locationId);
                    return (
                      <tr key={group.id}>
                        <td>
                          <button 
                            className={`pin-btn ${group.isPinned ? 'pinned' : ''}`}
                            title={group.isPinned ? 'Unpin group' : 'Pin group'}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                          </button>
                        </td>
                        <td>
                          {group.isPinned && <span style={{ color: 'var(--accent)', marginRight: '4px' }}>⭐</span>}
                          {group.title}
                        </td>
                        <td>{category?.name || '-'}</td>
                        <td>{location?.neighborhood || '-'}</td>
                        <td>{group.clicksCount.toLocaleString()}</td>
                        <td>
                          <span className={`status-badge status-${group.status}`}>
                            {group.status}
                          </span>
                        </td>
                        <td>
                          <button className="action-btn edit">Edit</button>
                          <button className="action-btn delete">Delete</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="admin-card" style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-warm)' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <strong>💡 Tip:</strong> Pinned groups (⭐) always appear first in search results, 
                regardless of the sorting option selected by users. Use this feature to highlight 
                important community groups.
              </p>
            </div>
          </>
        )}

        {activeTab === 'categories' && (
          <>
            <div className="admin-header">
              <h1 className="admin-title">Categories</h1>
              <button className="admin-btn">+ Add Category</button>
            </div>
            
            <div className="admin-card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Icon</th>
                    <th>Name</th>
                    <th>Slug</th>
                    <th>Groups</th>
                    <th>Actions</th>
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
                        <td>
                          <button className="action-btn edit">Edit</button>
                          <button className="action-btn delete">Delete</button>
                        </td>
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
              <button className="admin-btn">+ Add Location</button>
            </div>
            
            <div className="admin-card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Neighborhood</th>
                    <th>City</th>
                    <th>State</th>
                    <th>Country</th>
                    <th>Groups</th>
                    <th>Status</th>
                    <th>Actions</th>
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
                        <td>{loc.country}</td>
                        <td>{groupCount}</td>
                        <td>
                          <span className={`status-badge status-${loc.status}`}>
                            {loc.status}
                          </span>
                        </td>
                        <td>
                          <button className="action-btn edit">Edit</button>
                          <button className="action-btn delete">Delete</button>
                        </td>
                      </tr>
                    );
                  })}
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
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Details</th>
                      <th>Contact</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suggestions.map(sugg => (
                      <tr key={sugg.id}>
                        <td>
                          <span className="status-badge" style={{ background: '#e2e8f0', color: '#4a5568' }}>
                            {sugg.type}
                          </span>
                        </td>
                        <td>
                          {sugg.type === 'group' 
                            ? sugg.payload.title 
                            : sugg.payload.neighborhood}
                        </td>
                        <td>{sugg.contactEmail || '-'}</td>
                        <td>{new Date(sugg.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button className="action-btn approve">Approve</button>
                          <button className="action-btn delete">Reject</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {activeTab === 'services' && (
          <>
            <div className="admin-header">
              <h1 className="admin-title">Service Contacts</h1>
              <button className="admin-btn">+ Add Contact</button>
            </div>
            
            <div className="admin-card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Pinned</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Phone</th>
                    <th>Languages</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceContacts.map(contact => {
                    const category = serviceCategories.find(c => c.id === contact.categoryId);
                    return (
                      <tr key={contact.id}>
                        <td>
                          <button 
                            className={`pin-btn ${contact.isPinned ? 'pinned' : ''}`}
                            title={contact.isPinned ? 'Unpin contact' : 'Pin contact'}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                          </button>
                        </td>
                        <td>
                          {contact.isPinned && <span style={{ color: 'var(--accent)', marginRight: '4px' }}>⭐</span>}
                          {contact.name}
                        </td>
                        <td>{category ? `${category.icon} ${category.name}` : '-'}</td>
                        <td>
                          {contact.phone}
                          {contact.secondPhone && <><br/><small>{contact.secondPhone}</small></>}
                        </td>
                        <td>{contact.languages?.join(', ') || '-'}</td>
                        <td>
                          <span className={`status-badge status-${contact.status}`}>
                            {contact.status}
                          </span>
                        </td>
                        <td>
                          <button className="action-btn edit">Edit</button>
                          <button className="action-btn delete">Delete</button>
                        </td>
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
              <h1 className="admin-title">Service Types / Professions</h1>
              <button className="admin-btn">+ Add Category</button>
            </div>
            
            <div className="admin-card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Icon</th>
                    <th>Name (EN)</th>
                    <th>Name (RU)</th>
                    <th>Slug</th>
                    <th>Contacts</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceCategories.sort((a, b) => a.order - b.order).map(cat => {
                    const contactCount = serviceContacts.filter(c => c.categoryId === cat.id).length;
                    return (
                      <tr key={cat.id}>
                        <td>
                          <input 
                            type="number" 
                            value={cat.order} 
                            style={{ width: '50px', padding: '4px', textAlign: 'center' }}
                            readOnly
                          />
                        </td>
                        <td style={{ fontSize: '1.5rem' }}>{cat.icon}</td>
                        <td>{cat.name}</td>
                        <td>{cat.nameRu || '-'}</td>
                        <td><code>{cat.slug}</code></td>
                        <td>{contactCount}</td>
                        <td>
                          <button className="action-btn edit">Edit</button>
                          <button className="action-btn delete">Delete</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="admin-card" style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-warm)' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <strong>💡 Tip:</strong> Service categories appear in the order specified. 
                You can add Russian names to make the site more accessible.
              </p>
            </div>
          </>
        )}

        {activeTab === 'emergency' && (
          <>
            <div className="admin-header">
              <h1 className="admin-title">Emergency Contacts</h1>
              <button className="admin-btn">+ Add Emergency Contact</button>
            </div>
            
            <div className="admin-card">
              <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
                These contacts appear in the red bar at the top of every page.
              </p>
              
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Icon</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Color</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {emergencyContacts.sort((a, b) => a.order - b.order).map(contact => (
                    <tr key={contact.id}>
                      <td>
                        <input 
                          type="number" 
                          value={contact.order} 
                          style={{ width: '50px', padding: '4px', textAlign: 'center' }}
                          readOnly
                        />
                      </td>
                      <td style={{ fontSize: '1.5rem' }}>{contact.icon}</td>
                      <td><strong>{contact.name}</strong></td>
                      <td>{contact.phone}</td>
                      <td>
                        <span 
                          style={{ 
                            display: 'inline-block',
                            width: '24px', 
                            height: '24px', 
                            background: contact.color,
                            borderRadius: '4px'
                          }}
                        />
                      </td>
                      <td>
                        <button className="action-btn edit">Edit</button>
                        <button className="action-btn delete">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="admin-card" style={{ marginTop: '1rem' }}>
              <h4 style={{ marginBottom: '0.5rem' }}>Preview:</h4>
              <div style={{ 
                background: 'linear-gradient(90deg, #1a1a2e, #16213e, #1a1a2e)',
                padding: '0.75rem',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'center',
                gap: '0.5rem',
                flexWrap: 'wrap'
              }}>
                {emergencyContacts.map(c => (
                  <span key={c.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.4rem 0.75rem',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '999px',
                    color: 'white',
                    fontSize: '0.8rem'
                  }}>
                    {c.icon} <strong>{c.name}</strong> {c.phone}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'banner' && (
          <>
            <div className="admin-header">
              <h1 className="admin-title">Banner Settings</h1>
            </div>
            
            <div className="admin-card">
              <form style={{ maxWidth: '500px' }}>
                <div className="form-group">
                  <label className="form-label">
                    <input type="checkbox" defaultChecked style={{ marginRight: '0.5rem' }} />
                    Enable Banner
                  </label>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    defaultValue="🎉 Welcome to Crown Heights Groups!"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Text</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    defaultValue="Find and join WhatsApp groups in your community."
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Button Text (optional)</label>
                  <input type="text" className="form-input" defaultValue="Learn More" />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Button Link (optional)</label>
                  <input type="text" className="form-input" defaultValue="/about" />
                </div>
                
                <button type="submit" className="form-btn">Save Changes</button>
              </form>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
