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
  
  const [loading, setLoading] = useState(true);

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
    ]);
    setLoading(false);
  };

  const handleApprove = async (type: string, item: any) => {
    await fetch(`/api/suggest-${type}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: item.id, action: 'approve' }) });
    fetchAll();
  };

  const handleReject = async (type: string, id: string) => {
    await fetch(`/api/suggest-${type}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action: 'reject' }) });
    fetchAll();
  };

  const handleDelete = async (endpoint: string, id: string) => {
    if (!confirm('Delete?')) return;
    await fetch(endpoint, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    fetchAll();
  };

  const pendingGroups = groupSuggestions.filter(s => s.status === 'pending');
  const pendingServices = serviceSuggestions.filter(s => s.status === 'pending');
  const pendingEvents = eventSuggestions.filter(s => s.status === 'pending');
  const pendingCampaigns = campaignSuggestions.filter(s => s.status === 'pending');
  const totalPending = pendingGroups.length + pendingServices.length + pendingEvents.length + pendingCampaigns.length;

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
        {activeTab === 'suggestions' && (
          <>
            <h1 className="admin-title">Pending Suggestions ({totalPending})</h1>
            {totalPending === 0 ? <div className="admin-card"><p>No pending suggestions ✅</p></div> : (
              <>
                {pendingGroups.length > 0 && (
                  <div className="admin-card" style={{ marginBottom: '1rem' }}>
                    <h3>👥 Groups ({pendingGroups.length})</h3>
                    {pendingGroups.map(s => (
                      <div key={s.id} style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', marginTop: '0.5rem', background: '#fffbeb' }}>
                        <strong>{s.title}</strong><br/>
                        <small style={{ color: '#666' }}>{s.description?.substring(0, 100)}</small><br/>
                        <small>By: {s.submittedBy}</small>
                        <div style={{ marginTop: '0.5rem' }}>
                          <button onClick={() => handleApprove('group', s)} style={{ marginRight: '0.5rem', padding: '0.5rem 1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>✅ Approve</button>
                          <button onClick={() => handleReject('group', s.id)} style={{ padding: '0.5rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>❌ Reject</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {pendingServices.length > 0 && (
                  <div className="admin-card" style={{ marginBottom: '1rem' }}>
                    <h3>🔧 Services ({pendingServices.length})</h3>
                    {pendingServices.map(s => (
                      <div key={s.id} style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', marginTop: '0.5rem', background: '#fffbeb' }}>
                        <strong>{s.name}</strong> - {s.phone}<br/>
                        <small>By: {s.submittedBy}</small>
                        <div style={{ marginTop: '0.5rem' }}>
                          <button onClick={() => handleApprove('service', s)} style={{ marginRight: '0.5rem', padding: '0.5rem 1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>✅ Approve</button>
                          <button onClick={() => handleReject('service', s.id)} style={{ padding: '0.5rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>❌ Reject</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {pendingEvents.length > 0 && (
                  <div className="admin-card" style={{ marginBottom: '1rem' }}>
                    <h3>📅 Events ({pendingEvents.length})</h3>
                    {pendingEvents.map(s => (
                      <div key={s.id} style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', marginTop: '0.5rem', background: '#fffbeb' }}>
                        <strong>{s.title}</strong> - {s.date}<br/>
                        <small>{s.description?.substring(0, 100)}</small><br/>
                        <small>By: {s.submittedBy}</small>
                        <div style={{ marginTop: '0.5rem' }}>
                          <button onClick={() => handleApprove('event', s)} style={{ marginRight: '0.5rem', padding: '0.5rem 1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>✅ Approve</button>
                          <button onClick={() => handleReject('event', s.id)} style={{ padding: '0.5rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>❌ Reject</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {pendingCampaigns.length > 0 && (
                  <div className="admin-card" style={{ marginBottom: '1rem' }}>
                    <h3>💝 Campaigns ({pendingCampaigns.length})</h3>
                    {pendingCampaigns.map(s => (
                      <div key={s.id} style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', marginTop: '0.5rem', background: '#fffbeb' }}>
                        <strong>{s.title}</strong> - Goal: ${s.goal}<br/>
                        <small>{s.description?.substring(0, 100)}</small><br/>
                        <small>By: {s.submittedBy}</small>
                        <div style={{ marginTop: '0.5rem' }}>
                          <button onClick={() => handleApprove('campaign', s)} style={{ marginRight: '0.5rem', padding: '0.5rem 1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>✅ Approve</button>
                          <button onClick={() => handleReject('campaign', s.id)} style={{ padding: '0.5rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>❌ Reject</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {activeTab === 'groups' && (
          <>
            <h1 className="admin-title">Groups ({groups.length})</h1>
            <div className="admin-card">
              <table className="admin-table">
                <thead><tr><th>Title</th><th>Category</th><th>Actions</th></tr></thead>
                <tbody>
                  {groups.map(g => (
                    <tr key={g.id}>
                      <td><strong>{g.title}</strong></td>
                      <td>{groupCategories.find(c => c.id === g.categoryId)?.name || '-'}</td>
                      <td><button className="action-btn delete" onClick={() => handleDelete('/api/admin/groups', g.id)}>Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'services' && (
          <>
            <h1 className="admin-title">Services ({services.length})</h1>
            <div className="admin-card">
              <table className="admin-table">
                <thead><tr><th>Name</th><th>Phone</th><th>Category</th><th>Actions</th></tr></thead>
                <tbody>
                  {services.map(s => (
                    <tr key={s.id}>
                      <td><strong>{s.name}</strong></td>
                      <td>{s.phone}</td>
                      <td>{serviceCategories.find(c => c.id === s.categoryId)?.name || '-'}</td>
                      <td><button className="action-btn delete" onClick={() => handleDelete('/api/admin/services', s.id)}>Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'events' && (
          <>
            <h1 className="admin-title">Events ({events.length})</h1>
            <div className="admin-card">
              <table className="admin-table">
                <thead><tr><th>Title</th><th>Date</th><th>Location</th><th>Actions</th></tr></thead>
                <tbody>
                  {events.map(e => (
                    <tr key={e.id}>
                      <td><strong>{e.title}</strong></td>
                      <td>{e.date}</td>
                      <td>{e.location}</td>
                      <td><button className="action-btn delete" onClick={() => handleDelete('/api/events', e.id)}>Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'campaigns' && (
          <>
            <h1 className="admin-title">Campaigns ({campaigns.length})</h1>
            <div className="admin-card">
              <table className="admin-table">
                <thead><tr><th>Title</th><th>Goal</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {campaigns.map(c => (
                    <tr key={c.id}>
                      <td><strong>{c.title}</strong></td>
                      <td>${c.goal}</td>
                      <td>{c.status}</td>
                      <td><button className="action-btn delete" onClick={() => handleDelete('/api/campaigns', c.id)}>Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'group-categories' && (
          <>
            <h1 className="admin-title">Group Categories ({groupCategories.length})</h1>
            <div className="admin-card">
              <table className="admin-table">
                <thead><tr><th>Icon</th><th>Name</th><th>Groups</th></tr></thead>
                <tbody>
                  {groupCategories.sort((a,b) => (a.order||0)-(b.order||0)).map(c => (
                    <tr key={c.id}>
                      <td style={{ fontSize: '1.5rem' }}>{c.icon}</td>
                      <td><strong>{c.name}</strong></td>
                      <td>{groups.filter(g => g.categoryId === c.id).length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'service-categories' && (
          <>
            <h1 className="admin-title">Service Types ({serviceCategories.length})</h1>
            <div className="admin-card">
              <table className="admin-table">
                <thead><tr><th>Icon</th><th>Name</th><th>Services</th></tr></thead>
                <tbody>
                  {serviceCategories.sort((a,b) => (a.order||0)-(b.order||0)).map(c => (
                    <tr key={c.id}>
                      <td style={{ fontSize: '1.5rem' }}>{c.icon}</td>
                      <td><strong>{c.name}</strong></td>
                      <td>{services.filter(s => s.categoryId === c.id).length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'locations' && (
          <>
            <h1 className="admin-title">Locations ({locations.length})</h1>
            <div className="admin-card">
              <table className="admin-table">
                <thead><tr><th>Neighborhood</th><th>City</th><th>Groups</th></tr></thead>
                <tbody>
                  {locations.map(l => (
                    <tr key={l.id}>
                      <td><strong>{l.neighborhood}</strong></td>
                      <td>{l.city}</td>
                      <td>{groups.filter(g => g.locationId === l.id).length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <>
            <h1 className="admin-title">Users ({users.length})</h1>
            <div className="admin-card">
              <table className="admin-table">
                <thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.email}>
                      <td><strong>{u.name}</strong></td>
                      <td>{u.email}</td>
                      <td><span style={{ padding: '4px 8px', borderRadius: '4px', background: u.role === 'admin' ? '#dbeafe' : '#e5e7eb' }}>{u.role}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'reports' && (
          <>
            <h1 className="admin-title">Reports ({reports.length})</h1>
            <div className="admin-card">
              {reports.length === 0 ? <p>No reports</p> : (
                <table className="admin-table">
                  <thead><tr><th>Group</th><th>Reason</th><th>By</th></tr></thead>
                  <tbody>
                    {reports.map((r: any) => (
                      <tr key={r.id}>
                        <td>{groups.find(g => g.id === r.groupId)?.title || 'Unknown'}</td>
                        <td>{r.reason}</td>
                        <td>{r.userEmail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}