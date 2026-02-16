'use client';

import { useState } from 'react';
import Image from 'next/image';
import ContactFormModal from './ContactFormModal';

export default function FloatingContactSticker() {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        title="Contact Us"
        aria-label="Contact Us"
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 1000,
          border: 'none',
          borderRadius: '50%',
          width: '56px',
          height: '56px',
          padding: 0,
          overflow: 'hidden',
          cursor: 'pointer',
          boxShadow: hover
            ? '0 8px 25px rgba(37, 99, 235, 0.5)'
            : '0 4px 15px rgba(0, 0, 0, 0.2)',
          transform: hover ? 'scale(1.1)' : 'scale(1)',
          transition: 'all 0.3s ease',
          outline: '2px solid white',
          outlineOffset: '2px',
        }}
      >
        {!imgError ? (
          <Image
            src="/images/stickers/contact_sticker.png"
            alt="Contact Us"
            width={128}
            height={128}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={() => setImgError(true)}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #1e3a5f, #3b82f6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
        )}
      </button>

      <ContactFormModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
