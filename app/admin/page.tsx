'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Tab = 'dashboard' | 'groups' | 'services' | 'events' | 'campaigns' | 'group-categories' | 'service-categories' | 'locations' | 'suggestions' | 'users' | 'reports';

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

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([
      fetchGroups(), fetchServices(), fetchEvents(), fetchCampaigns(),
      fetchUsers(), fetchGroupCategories(), fetchServiceCategories(), 
      fetchLocations(), fetchReports(),
      fetchGroupSuggestions(), fetchServiceSuggestions(), 
      fetchEventSuggestions(), fetchCampaignSuggestions(),
      fetchLocationSuggestions()
    ]);
    setLoading(false);
  };

  const fetchGroups = async () => { try { const r = await fetch('/api/admin/groups'); const d = await r.json(); setGroups(Array.isArray(d) ? d : []); } catch (e) {} };
  const fetchServices = async () => { try { const r = await fetch('/api/admin/services'); const d = await r.json(); setServices(Array.isArray(d) ? d : []); } catch (e) {} };
  const fetchEvents = async () => { try { const r = await fetch('/api/events'); const d = await r.json(); setEvents(Array.isArray(d) ? d : []); } catch (e) {} };
  const fetchCampaigns = async () => { try { const r = await fetch('/api/campaigns'); const d = await r.json(); setCampaigns(Array.isArray(d) ? d : []); } catch (e) {} };
  const fetchUsers = async () => { try { const r = await fetch('/api/admin/users'); const d = await r.json(); setUsers(Array.isArray(d) ? d : []); } catch (e) {} };
  const fetchGroupCategories = async () => { try { const r = await fetch('/api/admin/group-categories'); const d = await r.json(); setGroupCategories(Array.isArray(d) ? d : []); } catch (e) {} };
  const fetchServiceCategories = async () => { try { const r = await fetch('/api/admin/service-categories'); const d = await r.json(); setServiceCategories(Array.isArray(d) ? d : []); } catch (e) {} };
  const fetchLocations = async () => { try { const r = await fetch('/api/admin/locations'); const d = await r.json(); setLocations(Array.isArray(d) ? d : []); } catch (e) {} };
  const fetchReports = async () => { try { const r = await fetch('/api/reports'); const d = await r.json(); setReports(Array.isArray(d) ? d : []); } catch (e) {} };
  
  const fetchGroupSuggestions = async () => { try { const r = await fetch('/api/suggest-group'); const d = await r.json(); setGroupSuggestions(Array.isArray(d) ? d : []); } catch (e) {} };
  const fetchServiceSuggestions = async () => { try { const r = await fetch('/api/suggest-service'); const d = await r.json(); setServiceSuggestions(Array.isArray(d) ? d : []); } catch (e) {} };
  const fetchEventSuggestions = async () => { try { const r = await fetch('/api/suggest-event'); const d = await r.json(); setEventSuggestions(Array.isArray(d) ? d : []); } catch (e) {} };
  const fetchCampaignSuggestions = async () => { try { const r = await fetch('/api/suggest-campaign'); const d = await r.json(); setCampaignSuggestions(Array.isArray(d) ? d : []); } catch (e) {} };
  const fetchLocationSuggestions = async () => { try { const r = await fetch('/api/location-suggestions'); const d = await r.json(); setLocationSuggestions(Array.isArray(d) ? d : []); } catch (e) {} };

  // Approve/Reject handlers
  const handleApproveSuggestion = async (type: string, s: any) => {
    const endpoint = `/api/suggest-${type}`;
    await fetch(endpoint, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: s.id, action: 'approve' }) });
    fetchAll();
  };

  const handleRejectSuggestion = async (type: string, id: string) => {
    const endpoint = `/api/suggest-${type}`;
    await fetch(endpoint, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action: 'reject' }) });
    fetchAll();
  };

  // Delete handlers
  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    await fetch('/api/events', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    fetchEvents();
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('Delete this campaign?')) return;
    await fetch('/api/campaigns', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    fetchCampaigns();
  };

  const handleDeleteGroup = async (id: string) => {
    if (!confirm('Delete?')) return;
    await fetch('/api/admin/groups', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    fetchGroups();
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Delete?')) return;
    await fetch('/api/admin/services', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    fetchServices();
  };

  // Counts
  const pendingGroups = groupSuggestions.filter(s => s.status === 'pending');
  const pendingServices = serviceSuggestions.filter(s => s.status === 'pending');
  const pendingEvents = eventSuggestions.filter(s => s.status === 'pending');
  const pendingCampaigns = campaignSuggestions.filter(s => s.status === 'pending');
  const pendingLocations = locationSuggestions.filter(s => s.status === 'pending');
  const totalPending = pendingGroups.length + pendingServices.length + pendingEvents.length + pendingCampaigns.length + pendingLocations.length;

  // Active/Archive events
  const now = new Date();
  const activeEvents = events.filter(e => !e.date || new Date(e.date) >= now);
  const archivedEvents = events.filter(e => e.date && new Date(e.date) < now);

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
        {/* SUGGESTIONS TAB */}
        {activeTab === 'suggestions' && (
          <>
            <div className="admin-header"><h1 className="admin-title">All Pending Suggestions ({totalPending})</h1></div>
            
            {totalPending === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                <p>No pending suggestions</p>
              </div>
            ) : (
              <>
                {/* Groups */}
                {pendingGroups.length > 0 && (
                  <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>👥 Groups ({pendingGroups.length})</h3>
                    {pendingGroups.map((s: any) => (
                      <div key={s.id} style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '0.5rem', background: '#fefce8' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <strong>{s.title}</strong>
                            <p style={{ color: '#666', fontSize: '0.9rem', margin: '0.25rem 0' }}>{s.description?.substring(0, 100)}</p>
                            <small style={{ color: '#999' }}>By: {s.submittedBy}</small>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => handleApproveSuggestion('group', s)} style={{ padding: '0.5rem 1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>✅ Approve</button>
                            <button onClick={() => handleRejectSuggestion('group', s.id)} style={{ padding: '0.5rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>❌ Reject</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Services */}
                {pendingServices.length > 0 && (
                  <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>🔧 Services ({pendingServices.length})</h3>
                    {pendingServices.map((s: any) => (
                      <div key={s.id} style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '0.5rem', background: '#fefce8' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <strong>{s.name}</strong>
                            <p style={{ color: '#666', fontSize: '0.9rem', margin: '0.25rem 0' }}>📞 {s.phone}</p>
                            <small style={{ color: '#999' }}>By: {s.submittedBy}</small>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => handleApproveSuggestion('service', s)} style={{ padding: '0.5rem 1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>✅ Approve</button>
                            <button onClick={() => handleRejectSuggestion('service', s.id)} style={{ padding: '0.5rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>❌ Reject</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Events */}
                {pendingEvents.length > 0 && (
                  <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>📅 Events ({pendingEvents.length})</h3>
                    {pendingEvents.map((s: any) => (
                      <div key={s.id} style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '0.5rem', background: '#fefce8' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <strong>{s.title}</strong>
                            <p style={{ color: '#666', fontSize: '0.9rem', margin: '0.25rem 0' }}>📅 {s.date} {s.time && `at ${s.time}`}</p>
                            <p style={{ color: '#666', fontSize: '0.9rem', margin: '0.25rem 0' }}>{s.description?.substring(0, 100)}</p>
                            <small style={{ color: '#999' }}>By: {s.submittedBy}</small>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => handleApproveSuggestion('event', s)} style={{ padding: '0.5rem 1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>✅ Approve</button>
                            <button onClick={() => handleRejectSuggestion('event', s.id)} style={{ padding: '0.5rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>❌ Reject</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Campaigns */}
                {pendingCampaigns.length > 0 && (
                  <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>💝 Campaigns ({pendingCampaigns.length})</h3>
                    {pendingCampaigns.map((s: any) => (
                      <div key={s.id} style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '0.5rem', background: '#fefce8' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <strong>{s.title}</strong>
                            <p style={{ color: '#666', fontSize: '0.9rem', margin: '0.25rem 0' }}>{s.description?.substring(0, 100)}</p>
                            <p style={{ color: '#666', fontSize: '0.9rem' }}>Goal: ${s.goal}</p>
                            <small style={{ color: '#999' }}>By: {s.submittedBy}</small>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => handleApproveSuggestion('campaign', s)} style={{ padding: '0.5rem 1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>✅ Approve</button>
                            <button onClick={() => handleRejectSuggestion('campaign', s.id)} style={{ padding: '0.5rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>❌ Reject</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Locations */}
                {pendingLocations.length > 0 && (
                  <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>📍 Locations ({pendingLocations.length})</h3>
                    {pendingLocations.map((s: any) => (
                      <div key={s.id} style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '0.5rem', background: '#fefce8' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <strong>{s.neighborhood}</strong>
                            <p style={{ color: '#666', fontSize: '0.9rem' }}>{s.city}</p>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => handleApproveSuggestion('location', s)} style={{ padding: '0.5rem 1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>✅</button>
                            <button onClick={() => handleRejectSuggestion('location', s.id)} style={{ padding: '0.5rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>❌</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* EVENTS TAB */}
        {activeTab === 'events' && (
          <>
            <div className="admin-header"><h1 className="admin-title">Events</h1></div>
            
            <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>📅 Active Events ({activeEvents.length})</h3>
              {activeEvents.length === 0 ? <p style={{ color: '#666' }}>No active events</p> : (
                <table className="admin-table">
                  <thead><tr><th>Title</th><th>Date</th><th>Location</th><th>Actions</th></tr></thead>
                  <tbody>
                    {activeEvents.map((e: any) => (
                      <tr key={e.id}>
                        <td><strong>{e.title}</strong></td>
                        <td>{e.date} {e.time}</td>
                        <td>{e.location}</td>
                        <td><button className="action-btn delete" onClick={() => handleDeleteEvent(e.id)}>Delete</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="admin-card">
              <h3 style={{ marginBottom: '1rem', color: '#666' }}>📦 Archived Events ({archivedEvents.length})</h3>
              {archivedEvents.length === 0 ? <p style={{ color: '#666' }}>No archived events</p> : (
                <table className="admin-table">
                  <thead><tr><th>Title</th><th>Date</th><th>Actions</th></tr></thead>
                  <tbody>
                    {archivedEvents.map((e: any) => (
                      <tr key={e.id} style={{ opacity: 0.6 }}>
                        <td>{e.title}</td>
                        <td>{e.date}</td>
                        <td><button className="action-btn delete" onClick={() => handleDeleteEvent(e.id)}>Delete</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* CAMPAIGNS TAB */}
        {activeTab === 'campaigns' && (
          <>
            <div className="admin-header"><h1 className="admin-title">Charity Campaigns ({campaigns.length})</h1></div>
            <div className="admin-card">
              {campaigns.length === 0 ? <p style={{ color: '#666' }}>No campaigns</p> : (
                <table className="admin-table">
                  <thead><tr><th>Title</th><th>Goal</th><th>Raised</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {campaigns.map((c: any) => (
                      <tr key={c.id}>
                        <td><strong>{c.title}</strong></td>
                        <td>${c.goal}</td>
                        <td>${c.raised || 0}</td>
                        <td><span style={{ padding: '4px 8px', borderRadius: '4px', background: c.status === 'active' ? '#d1fae5' : '#e5e7eb' }}>{c.status}</span></td>
                        <td><button className="action-btn delete" onClick={() => handleDeleteCampaign(c.id)}>Delete</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* GROUPS TAB */}
        {activeTab === 'groups' && (
          <>
            <div className="admin-header"><h1 className="admin-title">Groups ({groups.length})</h1></div>
            <div className="admin-card">
              <table className="admin-table">
                <thead><tr><th>Title</th><th>Category</th><th>Actions</th></tr></thead>
                <tbody>
                  {groups.map((g: any) => (
                    <tr key={g.id}>
                      <td><strong>{g.title}</strong></td>
                      <td>{groupCategories.find((c: any) => c.id === g.categoryId)?.name || 'Unknown'}</td>
                      <td><button className="action-btn delete" onClick={() => handleDeleteGroup(g.id)}>Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* SERVICES TAB */}
        {activeTab === 'services' && (
          <>
            <div className="admin-header"><h1 className="admin-title">Services ({services.length})</h1></div>
            <div className="admin-card">
              <table className="admin-table">
                <thead><tr><th>Name</th><th>Phone</th><th>Category</th><th>Actions</th></tr></thead>
                <tbody>
                  {services.map((s: any) => (
                    <tr key={s.id}>
                      <td><strong>{s.name}</strong></td>
                      <td>{s.phone}</td>
                      <td>{serviceCategories.find((c: any) => c.id === s.categoryId)?.name || 'Unknown'}</td>
                      <td><button className="action-btn delete" onClick={() => handleDeleteService(s.id)}>Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <>
            <div className="admin-header"><h1 className="admin-title">Users ({users.length})</h1></div>
            <div className="admin-card">
              <table className="admin-table">
                <thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead>
                <tbody>
                  {users.map((u: any) => (
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

        {/* Other tabs - simplified */}
        {activeTab === 'group-categories' && <div className="admin-card"><h2>Group Categories ({groupCategories.length})</h2></div>}
        {activeTab === 'service-categories' && <div className="admin-card"><h2>Service Types ({serviceCategories.length})</h2></div>}
        {activeTab === 'locations' && <div className="admin-card"><h2>Locations ({locations.length})</h2></div>}
        {activeTab === 'reports' && <div className="admin-card"><h2>Reports ({reports.length})</h2></div>}
      </main>
    </div>
  );
}