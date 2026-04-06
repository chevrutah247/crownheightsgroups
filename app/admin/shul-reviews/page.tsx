'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import type { Shul, ShulReview } from '@/lib/shuls-data';

export default function AdminShulReviewsPage() {
  const [reviews, setReviews] = useState<ShulReview[]>([]);
  const [shuls, setShuls] = useState<Shul[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [reviewsRes, shulsRes] = await Promise.all([
        fetch('/api/admin/shul-reviews'),
        fetch('/api/shuls'),
      ]);

      const [reviewsData, shulsData] = await Promise.all([reviewsRes.json(), shulsRes.json()]);
      if (Array.isArray(reviewsData)) setReviews(reviewsData);
      if (Array.isArray(shulsData)) setShuls(shulsData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const byId = useMemo(() => {
    const map: Record<string, string> = {};
    for (const shul of shuls) map[shul.id] = shul.name;
    return map;
  }, [shuls]);

  const shown = useMemo(() => {
    if (filter === 'all') return reviews;
    return reviews.filter((r) => r.status === filter);
  }, [filter, reviews]);

  const moderate = async (id: string, action: 'approve' | 'reject' | 'delete') => {
    setProcessingId(id);
    try {
      await fetch('/api/admin/shul-reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      await load();
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <h1 style={{ margin: 0 }}>Shul Reviews Moderation</h1>
        <Link href="/admin" style={{ color: '#2563eb', textDecoration: 'none' }}>← Back to admin</Link>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {(['pending', 'approved', 'rejected', 'all'] as const).map((value) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            style={{
              border: '1px solid #cbd5e1',
              background: filter === value ? '#1d4ed8' : 'white',
              color: filter === value ? 'white' : '#334155',
              borderRadius: '8px',
              padding: '0.45rem 0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {value}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : shown.length === 0 ? (
        <p>No reviews in this filter.</p>
      ) : (
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={thStyle}>Shul</th>
                <th style={thStyle}>Reviewer</th>
                <th style={thStyle}>Rating</th>
                <th style={thStyle}>Review</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((review) => (
                <tr key={review.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                  <td style={tdStyle}>{byId[review.shulId] || review.shulId}</td>
                  <td style={tdStyle}>
                    <div>{review.authorName}</div>
                    {review.authorEmail && <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{review.authorEmail}</div>}
                  </td>
                  <td style={tdStyle}>{review.rating} / 5</td>
                  <td style={{ ...tdStyle, maxWidth: '420px' }}>{review.comment}</td>
                  <td style={tdStyle}>{review.status}</td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => moderate(review.id, 'approve')}
                        disabled={processingId === review.id}
                        style={btnOk}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => moderate(review.id, 'reject')}
                        disabled={processingId === review.id}
                        style={btnWarn}
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => moderate(review.id, 'delete')}
                        disabled={processingId === review.id}
                        style={btnDanger}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

const thStyle: CSSProperties = {
  textAlign: 'left',
  padding: '0.7rem',
  fontSize: '0.85rem',
  color: '#475569',
};

const tdStyle: CSSProperties = {
  padding: '0.7rem',
  verticalAlign: 'top',
  color: '#0f172a',
  fontSize: '0.94rem',
};

const btnBase: CSSProperties = {
  border: 'none',
  borderRadius: '7px',
  padding: '0.35rem 0.55rem',
  color: 'white',
  fontWeight: 700,
  cursor: 'pointer',
};

const btnOk: CSSProperties = { ...btnBase, background: '#16a34a' };
const btnWarn: CSSProperties = { ...btnBase, background: '#ea580c' };
const btnDanger: CSSProperties = { ...btnBase, background: '#dc2626' };
