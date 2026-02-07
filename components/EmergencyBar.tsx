'use client';

import { useState } from 'react';

const emergencyContacts = [
  { name: 'Hatzolah', phone: '718-230-1000', icon: '🚑' },
  { name: 'Shomrim', phone: '718-774-3333', icon: '🛡️' },
  { name: 'Chaveirim', phone: '718-431-8181', icon: '🚗' },
];

export default function EmergencyBar() {
  const [showCyberModal, setShowCyberModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'basics' | 'windows' | 'resources'>('basics');

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

  const tabStyle = (isActive: boolean) => ({
    flex: 1,
    padding: '0.75rem',
    border: 'none',
    background: isActive ? '#1e3a5f' : '#e5e7eb',
    color: isActive ? 'white' : '#666',
    cursor: 'pointer',
    fontWeight: '600' as const,
    fontSize: '0.85rem',
    transition: 'all 0.2s'
  });

  const tipBoxStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    padding: '0.75rem',
    background: '#f8fafc',
    borderRadius: '10px',
    marginBottom: '0.5rem'
  };

  const resourceBtnStyle = (color: string) => ({
    flex: 1,
    minWidth: '120px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem',
    padding: '0.75rem 0.5rem',
    background: color,
    color: 'white',
    borderRadius: '10px',
    textDecoration: 'none',
    fontWeight: 'bold' as const,
    fontSize: '0.8rem'
  });

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
              padding: '1.5rem', 
              maxWidth: '550px', 
              width: '100%',
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.25rem' }}>🛡️🔒</div>
              <h2 style={{ color: '#1e3a5f', margin: '0 0 0.25rem 0', fontSize: '1.4rem' }}>
                Cyber Safety Center
              </h2>
              <p style={{ color: '#666', margin: 0, fontSize: '0.9rem' }}>
                Protect yourself from scammers and hackers
              </p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderRadius: '10px', overflow: 'hidden', marginBottom: '1rem' }}>
              <button onClick={() => setActiveTab('basics')} style={tabStyle(activeTab === 'basics')}>
                🔐 Basics
              </button>
              <button onClick={() => setActiveTab('windows')} style={tabStyle(activeTab === 'windows')}>
                🖥️ Windows
              </button>
              <button onClick={() => setActiveTab('resources')} style={tabStyle(activeTab === 'resources')}>
                📚 Resources
              </button>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
              
              {/* BASICS TAB */}
              {activeTab === 'basics' && (
                <>
                  <div style={{ 
                    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', 
                    borderRadius: '12px', 
                    padding: '1rem', 
                    marginBottom: '1rem',
                    border: '2px solid #f59e0b'
                  }}>
                    <p style={{ margin: 0, color: '#92400e', fontSize: '0.95rem', lineHeight: '1.5', fontWeight: '500' }}>
                      ⚠️ <strong>ALWAYS check suspicious links and files on VirusTotal.com</strong> — it's free, takes 10 seconds, and can save your money!
                    </p>
                  </div>

                  <div style={tipBoxStyle}>
                    <span style={{ fontSize: '1.25rem' }}>🔗</span>
                    <div>
                      <strong style={{ color: '#1e3a5f' }}>Check Links</strong>
                      <p style={{ margin: '0.25rem 0 0 0', color: '#666', fontSize: '0.85rem' }}>Paste any suspicious link into VirusTotal before clicking</p>
                    </div>
                  </div>
                  
                  <div style={tipBoxStyle}>
                    <span style={{ fontSize: '1.25rem' }}>📁</span>
                    <div>
                      <strong style={{ color: '#1e3a5f' }}>Scan Files</strong>
                      <p style={{ margin: '0.25rem 0 0 0', color: '#666', fontSize: '0.85rem' }}>Upload downloaded files to check for viruses</p>
                    </div>
                  </div>
                  
                  <div style={tipBoxStyle}>
                    <span style={{ fontSize: '1.25rem' }}>💳</span>
                    <div>
                      <strong style={{ color: '#1e3a5f' }}>Never Share</strong>
                      <p style={{ margin: '0.25rem 0 0 0', color: '#666', fontSize: '0.85rem' }}>Never send passwords, credit cards, or SSN via WhatsApp/email</p>
                    </div>
                  </div>
                  
                  <div style={{ ...tipBoxStyle, background: '#fef2f2', border: '1px solid #fecaca' }}>
                    <span style={{ fontSize: '1.25rem' }}>📧</span>
                    <div>
                      <strong style={{ color: '#991b1b' }}>Check Email Leaks</strong>
                      <p style={{ margin: '0.25rem 0 0 0', color: '#666', fontSize: '0.85rem' }}>Check if your email was leaked — if yes, change password IMMEDIATELY!</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                    <a href="https://www.virustotal.com/gui/home/upload" target="_blank" rel="noopener noreferrer" style={resourceBtnStyle('linear-gradient(135deg, #059669, #047857)')}>
                      🔍 VirusTotal
                    </a>
                    <a href="https://haveibeenpwned.com/" target="_blank" rel="noopener noreferrer" style={resourceBtnStyle('linear-gradient(135deg, #dc2626, #b91c1c)')}>
                      📧 HaveIBeenPwned
                    </a>
                  </div>
                </>
              )}

              {/* WINDOWS TAB */}
              {activeTab === 'windows' && (
                <>
                  <div style={{ 
                    background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', 
                    borderRadius: '12px', 
                    padding: '1rem', 
                    marginBottom: '1rem',
                    border: '2px solid #3b82f6'
                  }}>
                    <p style={{ margin: 0, color: '#1e40af', fontSize: '0.95rem', lineHeight: '1.5', fontWeight: '500' }}>
                      🖥️ <strong>Windows has built-in security tools!</strong> Use them regularly to keep your PC safe.
                    </p>
                  </div>

                  {/* MRT Section */}
                  <div style={{ background: '#f0f9ff', borderRadius: '12px', padding: '1rem', marginBottom: '1rem', border: '1px solid #0ea5e9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>🛠️</span>
                      <strong style={{ color: '#0369a1', fontSize: '1.1rem' }}>Windows MRT (Malicious Software Removal Tool)</strong>
                    </div>
                    <p style={{ margin: '0 0 0.75rem 0', color: '#666', fontSize: '0.9rem', lineHeight: '1.5' }}>
                      <strong>Built-in Windows utility</strong> that scans for and removes common malware. Microsoft updates it monthly via Windows Update.
                    </p>
                    <div style={{ background: 'white', borderRadius: '8px', padding: '0.75rem', marginBottom: '0.75rem' }}>
                      <strong style={{ color: '#1e3a5f', fontSize: '0.9rem' }}>How to run:</strong>
                      <ol style={{ margin: '0.5rem 0 0 1.25rem', padding: 0, color: '#666', fontSize: '0.85rem' }}>
                        <li>Press <strong>Win + R</strong></li>
                        <li>Type <code style={{ background: '#e5e7eb', padding: '2px 6px', borderRadius: '4px' }}>mrt</code> and press Enter</li>
                        <li>Click "Next" and select "Full scan"</li>
                      </ol>
                    </div>
                    <p style={{ margin: 0, color: '#059669', fontSize: '0.85rem', fontWeight: '500' }}>
                      ✅ Run monthly or when you suspect infection
                    </p>
                  </div>

                  {/* Dr.Web CureIt Section */}
                  <div style={{ background: '#f0fdf4', borderRadius: '12px', padding: '1rem', marginBottom: '1rem', border: '1px solid #22c55e' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>🩺</span>
                      <strong style={{ color: '#166534', fontSize: '1.1rem' }}>Dr.Web CureIt!</strong>
                    </div>
                    <p style={{ margin: '0 0 0.75rem 0', color: '#666', fontSize: '0.9rem', lineHeight: '1.5' }}>
                      <strong>Free portable antivirus scanner</strong> from a trusted security company. No installation needed — just download and run. Perfect for a "second opinion" scan.
                    </p>
                    <div style={{ background: 'white', borderRadius: '8px', padding: '0.75rem', marginBottom: '0.75rem' }}>
                      <strong style={{ color: '#1e3a5f', fontSize: '0.9rem' }}>Features:</strong>
                      <ul style={{ margin: '0.5rem 0 0 1.25rem', padding: 0, color: '#666', fontSize: '0.85rem' }}>
                        <li>No installation required</li>
                        <li>Works alongside your existing antivirus</li>
                        <li>Updated virus database</li>
                        <li>Free for home use</li>
                      </ul>
                    </div>
                    <a href="https://free.drweb.com/download+cureit+free/" target="_blank" rel="noopener noreferrer" style={{ ...resourceBtnStyle('linear-gradient(135deg, #22c55e, #16a34a)'), width: '100%', marginTop: '0.5rem' }}>
                      ⬇️ Download Dr.Web CureIt!
                    </a>
                  </div>
                </>
              )}

              {/* RESOURCES TAB */}
              {activeTab === 'resources' && (
                <>
                  {/* FBI Scam Alerts */}
                  <div style={{ background: '#fef3c7', borderRadius: '12px', padding: '1rem', marginBottom: '1rem', border: '1px solid #f59e0b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>🚨</span>
                      <strong style={{ color: '#92400e', fontSize: '1.1rem' }}>FBI Scam Alerts</strong>
                    </div>
                    <p style={{ margin: '0 0 0.75rem 0', color: '#666', fontSize: '0.9rem', lineHeight: '1.5' }}>
                      Stay informed about the latest scams and fraud schemes. The FBI regularly publishes alerts about new threats targeting individuals and businesses.
                    </p>
                    <a href="https://www.fbi.gov/how-we-can-help-you/scams-and-safety" target="_blank" rel="noopener noreferrer" style={{ ...resourceBtnStyle('linear-gradient(135deg, #f59e0b, #d97706)'), width: '100%' }}>
                      🚨 FBI Scams & Safety
                    </a>
                    <p style={{ margin: '0.5rem 0 0 0', color: '#666', fontSize: '0.8rem', fontStyle: 'italic' }}>
                      💡 Tip: Bookmark this page and check it monthly!
                    </p>
                  </div>

                  {/* Do Not Call */}
                  <div style={{ background: '#ede9fe', borderRadius: '12px', padding: '1rem', marginBottom: '1rem', border: '1px solid #8b5cf6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>📵</span>
                      <strong style={{ color: '#5b21b6', fontSize: '1.1rem' }}>Stop Marketing Calls</strong>
                    </div>
                    <p style={{ margin: '0 0 0.75rem 0', color: '#666', fontSize: '0.9rem', lineHeight: '1.5' }}>
                      Register your phone number on the <strong>National Do Not Call Registry</strong>. It won't stop all unwanted calls, but will significantly reduce telemarketing calls. Registration is free and lasts forever.
                    </p>
                    <a href="https://www.donotcall.gov/" target="_blank" rel="noopener noreferrer" style={{ ...resourceBtnStyle('linear-gradient(135deg, #8b5cf6, #7c3aed)'), width: '100%' }}>
                      📵 DoNotCall.gov
                    </a>
                  </div>

                  {/* Quick Links */}
                  <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1rem', border: '1px solid #e2e8f0' }}>
                    <strong style={{ color: '#1e3a5f', fontSize: '1rem', display: 'block', marginBottom: '0.75rem' }}>🔗 Quick Links</strong>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <a href="https://www.virustotal.com/gui/home/upload" target="_blank" rel="noopener noreferrer" style={{ color: '#059669', fontSize: '0.9rem', textDecoration: 'none' }}>
                        🔍 VirusTotal — Scan links & files
                      </a>
                      <a href="https://haveibeenpwned.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#dc2626', fontSize: '0.9rem', textDecoration: 'none' }}>
                        📧 HaveIBeenPwned — Check email breaches
                      </a>
                      <a href="https://free.drweb.com/download+cureit+free/" target="_blank" rel="noopener noreferrer" style={{ color: '#22c55e', fontSize: '0.9rem', textDecoration: 'none' }}>
                        🩺 Dr.Web CureIt — Free virus scanner
                      </a>
                      <a href="https://www.fbi.gov/how-we-can-help-you/scams-and-safety" target="_blank" rel="noopener noreferrer" style={{ color: '#f59e0b', fontSize: '0.9rem', textDecoration: 'none' }}>
                        🚨 FBI Scam Alerts
                      </a>
                      <a href="https://www.donotcall.gov/" target="_blank" rel="noopener noreferrer" style={{ color: '#8b5cf6', fontSize: '0.9rem', textDecoration: 'none' }}>
                        📵 Do Not Call Registry
                      </a>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Close Button */}
            <button 
              onClick={() => setShowCyberModal(false)}
              style={{ 
                marginTop: '1rem',
                padding: '0.75rem', 
                background: '#e5e7eb', 
                color: '#374151', 
                border: 'none', 
                borderRadius: '10px', 
                cursor: 'pointer',
                fontWeight: '600',
                width: '100%'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
