import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Crown Heights Groups — Jewish Community Directory'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
        }}
      >
        <div style={{ fontSize: '72px', marginBottom: '20px' }}>
          👥
        </div>
        <div
          style={{
            fontSize: '52px',
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            lineHeight: 1.2,
          }}
        >
          Crown Heights Groups
        </div>
        <div
          style={{
            fontSize: '24px',
            color: '#a0c4ff',
            marginTop: '16px',
            textAlign: 'center',
          }}
        >
          Jewish Community Directory & WhatsApp Groups
        </div>
        <div
          style={{
            display: 'flex',
            gap: '24px',
            marginTop: '40px',
            fontSize: '18px',
            color: '#e0e0e0',
          }}
        >
          <span>500+ Groups</span>
          <span>•</span>
          <span>Services</span>
          <span>•</span>
          <span>Events</span>
          <span>•</span>
          <span>Torah</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
