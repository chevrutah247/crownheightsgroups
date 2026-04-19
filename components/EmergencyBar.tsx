'use client';

const emergencyContacts = [
  { name: 'Hatzolah', phone: '718-230-1000', icon: '🚑' },
  { name: 'Shomrim', phone: '718-774-3333', icon: '🛡️' },
  { name: 'Chaveirim', phone: '718-431-8181', icon: '🚗' },
];

export default function EmergencyBar() {
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
    boxShadow: '0 2px 4px rgba(124, 58, 237, 0.3)'
  };

  return (
    <div style={barStyle}>
      <style>{`
        @keyframes cyber-pulse {
          0%, 100% {
            box-shadow: 0 2px 4px rgba(124, 58, 237, 0.3), 0 0 0 0 rgba(168, 85, 247, 0.55);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 2px 10px rgba(124, 58, 237, 0.55), 0 0 0 10px rgba(168, 85, 247, 0);
            transform: scale(1.04);
          }
        }
        @keyframes cyber-lock-wiggle {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(-10deg); }
          40% { transform: rotate(10deg); }
          60% { transform: rotate(-6deg); }
          80% { transform: rotate(6deg); }
        }
        .cyber-pulse-btn {
          animation: cyber-pulse 2s ease-in-out infinite;
        }
        .cyber-pulse-btn:hover {
          animation-play-state: paused;
          transform: translateY(-1px) scale(1.05) !important;
        }
        .cyber-pulse-btn .cyber-lock {
          display: inline-block;
          animation: cyber-lock-wiggle 2.5s ease-in-out infinite;
          transform-origin: center;
        }
      `}</style>
      <span style={{ color: '#dc2626', fontWeight: 'bold', marginRight: '0.5rem' }}>EMERGENCY:</span>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
        {emergencyContacts.map((contact) => (
          <a key={contact.name} href={"tel:" + contact.phone.replace(/-/g, "")} style={linkStyle}>
            <span>{contact.icon}</span>
            <span style={{ fontWeight: 'bold' }}>{contact.name}</span>
            <span>{contact.phone}</span>
          </a>
        ))}

        <a
          href="/cyber-safety"
          className="cyber-pulse-btn"
          style={cyberButtonStyle}
          title="Cyber Security Tips"
        >
          <span className="cyber-lock">🔒</span>
          <span style={{ fontWeight: 'bold' }}>Cyber Safety</span>
        </a>
      </div>
    </div>
  );
}
