'use client';

import { useState } from 'react';

const emergencyContacts = [
  { name: 'Hatzolah', phone: '718-230-1000', icon: '🚑' },
  { name: 'Shomrim', phone: '718-774-3333', icon: '🛡️' },
  { name: 'Chaveirim', phone: '718-431-8181', icon: '🚗' },
];

export default function EmergencyBar() {
  const [showCyberModal, setShowCyberModal] = useState(false);

  const barStyle = {
    background: '#f8f9fa',
    padding: '0.5rem 1rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap' as const,
    borderBottom: '1px solid #e5e7eb'
  };

  const linkStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: '#1e3a5f',
    color: 'white',
    padding: '0.4rem 0.75rem',
    borderRadius: '20px',
    textDecoration: 'none',
    fontSize: '0.85rem',
    fontWeight: '500' as const,
    whiteSpace: 'nowrap' as const
  };

  const cyberButtonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
    color: 'white',
    padding: '0.4rem 0.75rem',
    borderRadius: '20px',
    textDecoration: 'none',
    fontSize: '0.85rem',
    fontWeight: '500' as const,
    whiteSpace: 'nowrap' as const,
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(124, 58, 237, 0.3)'
  };

  return (
    <>
      <div style={barStyle}>
        <span style={{ color: '#dc2626', fontWeight: 'bold', marginRight: '0.5rem' }}>EMERGENCY:</span>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
          {emergencyContacts.map((contact) => (
            <a key={contact.name} href={"tel:" + contact.phone.replace(/-/g, "")} style={linkStyle}>
              <span>{contact.icon}</span>
              <span style={{ fontWeight: 'bold' }}>{contact.name}</span>
              <span>{contact.phone}</span>
            </a>
          ))}
          
          {/* Cyber Safety Button */}
          <button 
            onClick={() => setShowCyberModal(true)} 
            style={cyberButtonStyle}
            title="Cyber Security Tips"
          >
            <span>🔒</span>
            <span style={{ fontWeight: 'bold' }}>Cyber Safety</span>
          </button>
        </div>
      </div>

      {/* Cyber Safety Modal */}
      {showCyberModal && (
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            background: 'rgba(0,0,0,0.6)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            zIndex: 9999,
            padding: '1rem'
          }}
          onClick={() => setShowCyberModal(false)}
        >
          <div 
            style={{ 
              background: 'white', 
              borderRadius: '20px', 
              padding: '2rem', 
              maxWidth: '500px', 
              width: '100%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>🛡️🔒</div>
              <h2 style={{ color: '#1e3a5f', margin: '0 0 0.5rem 0', fontSize: '1.5rem' }}>
                Cyber Safety Tips
              </h2>
              <p style={{ color: '#666', margin: 0, fontSize: '0.95rem' }}>
                Protect yourself from scammers and hackers
              </p>
            </div>

            <div style={{ 
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', 
              borderRadius: '12px', 
              padding: '1.25rem', 
              marginBottom: '1.5rem',
              border: '2px solid #f59e0b'
            }}>
              <p style={{ margin: 0, color: '#92400e', fontSize: '1rem', lineHeight: '1.6', fontWeight: '500' }}>
                ⚠️ <strong>ALWAYS check suspicious links and files on VirusTotal.com</strong> — it's free, takes 10 seconds, and can save your money and personal data from scammers!
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '10px' }}>
                <span style={{ fontSize: '1.25rem' }}>🔗</span>
                <div>
                  <strong style={{ color: '#1e3a5f' }}>Check Links</strong>
                  <p style={{ margin: '0.25rem 0 0 0', color: '#666', fontSize: '0.85rem' }}>Before clicking any link, paste it into VirusTotal to verify it's safe</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '10px' }}>
                <span style={{ fontSize: '1.25rem' }}>📁</span>
                <div>
                  <strong style={{ color: '#1e3a5f' }}>Scan Files</strong>
                  <p style={{ margin: '0.25rem 0 0 0', color: '#666', fontSize: '0.85rem' }}>Upload any downloaded file to check for viruses and malware</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '10px' }}>
                <span style={{ fontSize: '1.25rem' }}>💳</span>
                <div>
                  <strong style={{ color: '#1e3a5f' }}>Never Share</strong>
                  <p style={{ margin: '0.25rem 0 0 0', color: '#666', fontSize: '0.85rem' }}>Never send passwords, credit card info, or personal details via WhatsApp</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', background: '#fef2f2', borderRadius: '10px', border: '1px solid #fecaca' }}>
                <span style={{ fontSize: '1.25rem' }}>📧</span>
                <div>
                  <strong style={{ color: '#991b1b' }}>Check Email Leaks</strong>
                  <p style={{ margin: '0.25rem 0 0 0', color: '#666', fontSize: '0.85rem' }}>Use HaveIBeenPwned to check if your email was in a data breach — if yes, change your password IMMEDIATELY!</p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <a 
                href="https://www.virustotal.com/gui/home/upload" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  flex: 1,
                  minWidth: '140px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '1rem', 
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', 
                  color: 'white', 
                  borderRadius: '12px', 
                  textDecoration: 'none', 
                  fontWeight: 'bold',
                  fontSize: '0.9rem'
                }}
              >
                🔍 VirusTotal
              </a>
              <a 
                href="https://haveibeenpwned.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  flex: 1,
                  minWidth: '140px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '1rem', 
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', 
                  color: 'white', 
                  borderRadius: '12px', 
                  textDecoration: 'none', 
                  fontWeight: 'bold',
                  fontSize: '0.9rem'
                }}
              >
                📧 HaveIBeenPwned
              </a>
              <button 
                onClick={() => setShowCyberModal(false)}
                style={{ 
                  padding: '1rem 1.5rem', 
                  background: '#e5e7eb', 
                  color: '#374151', 
                  border: 'none', 
                  borderRadius: '12px', 
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
