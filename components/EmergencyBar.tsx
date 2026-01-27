'use client';

const emergencyContacts = [
  { name: 'Hatzolah', phone: '718-230-1000', icon: '🚑' },
  { name: 'Shomrim', phone: '718-774-3333', icon: '🛡️' },
  { name: 'Chaveirim', phone: '718-431-8181', icon: '🚗' },
];

export default function EmergencyBar() {
  return (
    <div style={{
      background: '#f8f9fa',
      padding: '0.5rem 1rem',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '0.5rem',
      flexWrap: 'wrap',
      borderBottom: '1px solid #e5e7eb'
    }}>
      <span style={{ color: '#dc2626', fontWeight: 'bold', marginRight: '0.5rem' }}>EMERGENCY:</span>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {emergencyContacts.map((contact) => (
          
            key={contact.name}
            href={`tel:${contact.phone.replace(/-/g, '')}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#1e3a5f',
              color: 'white',
              padding: '0.4rem 0.75rem',
              borderRadius: '20px',
              textDecoration: 'none',
              fontSize: '0.85rem',
              fontWeight: '500',
              whiteSpace: 'nowrap'
            }}
          >
            <span>{contact.icon}</span>
            <span style={{ fontWeight: 'bold' }}>{contact.name}</span>
            <span>{contact.phone}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
