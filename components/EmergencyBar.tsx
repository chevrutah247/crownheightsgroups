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
          style={cyberButtonStyle}
          title="Cyber Security Tips"
        >
          <span>🔒</span>
          <span style={{ fontWeight: 'bold' }}>Cyber Safety</span>
        </a>
      </div>
    </div>
  );
}
