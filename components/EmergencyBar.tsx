'use client';

import { emergencyContacts } from '@/lib/data';

export default function EmergencyBar() {
  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone.replace(/[^0-9+]/g, '')}`;
  };

  return (
    <div className="emergency-bar">
      <div className="emergency-bar-content">
        <span className="emergency-label">Emergency:</span>
        <div className="emergency-contacts">
          {emergencyContacts
            .sort((a, b) => a.order - b.order)
            .map(contact => (
              <button
                key={contact.id}
                className="emergency-contact"
                onClick={() => handleCall(contact.phone)}
                style={{ '--contact-color': contact.color } as React.CSSProperties}
              >
                <span className="emergency-icon">{contact.icon}</span>
                <span className="emergency-name">{contact.name}</span>
                <span className="emergency-phone">{contact.phone}</span>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
