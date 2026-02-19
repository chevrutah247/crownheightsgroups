'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import type { PendingShul } from '@/lib/shuls-data';

export default function AdminPendingShulsPage() {
  const [pending, setPending] = useState<PendingShul[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ address: '', crossStreets: '', phone: '', contactName: '' });
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/pending-shuls');
      const data = await res.json();
      if (Array.isArray(data)) setPending(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (id: string) => {
    const shul = pending.find((s) => s.id === id);
    if (!shul) return;

    const address = editingId === id ? editForm.address : shul.address;
    if (!address) {
      setMessage('Please enter an address before approving.');
      setEditingId(id);
      return;
    }

    setProcessingId(id);
    setMessage('');
    try {
      await fetch('/api/admin/pending-shuls', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          action: 'approve',
          address: editingId === id ? editForm.address : undefined,
          crossStreets: editingId === id ? editForm.crossStreets : undefined,
          phone: editingId === id ? editForm.phone : undefined,
          contactName: editingId === id ? editForm.contactName : undefined,
        }),
      });
      setEditingId(null);
      await load();
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setProcessingId(id);
    try {
      await fetch('/api/admin/pending-shuls', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'delete' }),
      });
      await load();
    } finally {
      setProcessingId(null);
    }
  };

  const startEdit = (shul: PendingShul) => {
    setEditingId(shul.id);
    setEditForm({
      address: shul.address || '',
      crossStreets: shul.crossStreets || '',
      phone: shul.phone || '',
      contactName: shul.contactName || '',
    });
  };

  if (loading) {
    return (
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <Link href="/admin" style={{ color: '#2563eb', textDecoration: 'none', fontSize: '0.9rem' }}>&larr; Back to Admin</Link>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Pending Shuls ({pending.length})</h1>
      </div>

      <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
        These shuls were found on GoDaven.com but need addresses before being published. Add the address and approve, or delete if duplicate.
      </p>

      {message && <p style={{ color: '#dc2626', marginBottom: '1rem', fontWeight: 600 }}>{message}</p>}

      {pending.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', background: '#f8fafc', borderRadius: '12px' }}>
          <p style={{ fontSize: '1.1rem' }}>No pending shuls. All done!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {pending.map((shul) => {
            const isEditing = editingId === shul.id;
            const isProcessing = processingId === shul.id;

            return (
              <article key={shul.id} style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 0.3rem', fontSize: '1.1rem' }}>{shul.name}</h3>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                      Source: {shul.source} &middot; Added: {shul.addedAt}
                    </p>
                    {shul.address && !isEditing && (
                      <p style={{ margin: '0.3rem 0 0', color: '#334155' }}>📍 {shul.address}</p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {!isEditing && (
                      <button onClick={() => startEdit(shul)} style={btnEdit} disabled={isProcessing}>
                        Edit & Approve
                      </button>
                    )}
                    <button onClick={() => handleDelete(shul.id)} style={btnDelete} disabled={isProcessing}>
                      {isProcessing ? '...' : 'Delete'}
                    </button>
                  </div>
                </div>

                {isEditing && (
                  <div style={{ marginTop: '0.75rem', display: 'grid', gap: '0.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
                    <input
                      placeholder="Address (required) e.g. 123 Kingston Ave"
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      style={inputStyle}
                    />
                    <input
                      placeholder="Cross Streets e.g. Crown & Montgomery"
                      value={editForm.crossStreets}
                      onChange={(e) => setEditForm({ ...editForm, crossStreets: e.target.value })}
                      style={inputStyle}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <input
                        placeholder="Phone"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        style={inputStyle}
                      />
                      <input
                        placeholder="Contact Name"
                        value={editForm.contactName}
                        onChange={(e) => setEditForm({ ...editForm, contactName: e.target.value })}
                        style={inputStyle}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleApprove(shul.id)} style={btnApprove} disabled={isProcessing}>
                        {isProcessing ? 'Approving...' : 'Approve & Publish'}
                      </button>
                      <button onClick={() => setEditingId(null)} style={btnCancel}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}

const cardStyle: CSSProperties = {
  background: 'white',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  padding: '1rem',
  boxShadow: '0 2px 8px rgba(15,23,42,0.04)',
};

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '0.55rem 0.75rem',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  fontSize: '0.92rem',
};

const btnEdit: CSSProperties = {
  border: '1px solid #2563eb',
  background: '#2563eb',
  color: 'white',
  borderRadius: '8px',
  padding: '0.45rem 0.85rem',
  fontWeight: 600,
  fontSize: '0.85rem',
  cursor: 'pointer',
};

const btnApprove: CSSProperties = {
  border: 'none',
  background: '#16a34a',
  color: 'white',
  borderRadius: '8px',
  padding: '0.5rem 1rem',
  fontWeight: 700,
  fontSize: '0.9rem',
  cursor: 'pointer',
};

const btnDelete: CSSProperties = {
  border: '1px solid #fecaca',
  background: '#fef2f2',
  color: '#dc2626',
  borderRadius: '8px',
  padding: '0.45rem 0.75rem',
  fontWeight: 600,
  fontSize: '0.85rem',
  cursor: 'pointer',
};

const btnCancel: CSSProperties = {
  border: '1px solid #e2e8f0',
  background: '#f8fafc',
  color: '#64748b',
  borderRadius: '8px',
  padding: '0.5rem 0.85rem',
  fontWeight: 600,
  fontSize: '0.9rem',
  cursor: 'pointer',
};
