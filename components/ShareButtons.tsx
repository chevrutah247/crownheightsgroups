'use client';

import { useState } from 'react';

interface ShareButtonsProps {
  title: string;
  description: string;
  url?: string;
  type?: string;
}

export default function ShareButtons({ title, description, url, type = 'item' }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const shortDesc = description.length > 150 ? description.slice(0, 150) + '...' : description;

  const shareViaEmail = () => {
    const subject = encodeURIComponent(title);
    const body = encodeURIComponent(`${title}\n\n${shortDesc}\n\nView more: ${shareUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(`*${title}*\n\n${shortDesc}\n\n👉 ${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`);
  };

  const shareViaTelegram = () => {
    const text = encodeURIComponent(`${title}\n\n${shortDesc}`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${text}`);
  };

  const shareViaFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`);
  };

  const copyLink = () => {
    const text = `${title}\n\n${shortDesc}\n\n${shareUrl}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ 
      display: 'flex', 
      gap: '0.5rem', 
      flexWrap: 'wrap',
      alignItems: 'center'
    }}>
      <span style={{ fontSize: '0.85rem', color: '#666' }}>Share:</span>
      <button
        onClick={shareViaWhatsApp}
        title="Share via WhatsApp"
        style={{
          padding: '0.4rem 0.6rem',
          background: '#25D366',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '1rem',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}
      >
        💬
      </button>
      <button
        onClick={shareViaTelegram}
        title="Share via Telegram"
        style={{
          padding: '0.4rem 0.6rem',
          background: '#0088cc',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '1rem',
          color: 'white'
        }}
      >
        ✈️
      </button>
      <button
        onClick={shareViaFacebook}
        title="Share via Facebook"
        style={{
          padding: '0.4rem 0.6rem',
          background: '#1877F2',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '1rem',
          color: 'white'
        }}
      >
        📘
      </button>
      <button
        onClick={shareViaEmail}
        title="Share via Email"
        style={{
          padding: '0.4rem 0.6rem',
          background: '#6366f1',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '1rem',
          color: 'white'
        }}
      >
        📧
      </button>
      <button
        onClick={copyLink}
        title="Copy Link"
        style={{
          padding: '0.4rem 0.6rem',
          background: copied ? '#10b981' : '#e5e7eb',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '1rem',
          color: copied ? 'white' : '#333'
        }}
      >
        {copied ? '✅' : '🔗'}
      </button>
    </div>
  );
}
