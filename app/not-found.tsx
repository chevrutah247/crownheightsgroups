import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404 — Page Not Found',
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      textAlign: 'center',
      background: '#f5f5f5',
      fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
    }}>
      <h1 style={{ fontSize: '72px', fontWeight: 'bold', margin: 0, color: '#1a1a2e' }}>404</h1>
      <p style={{ fontSize: '20px', color: '#555', marginTop: '12px' }}>Page Not Found</p>
      <p style={{ fontSize: '14px', color: '#888', marginTop: '8px', maxWidth: '400px' }}>
        Sorry, the page you are looking for does not exist or has been moved.
      </p>
      <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
        <Link
          href="/"
          style={{
            padding: '10px 24px',
            backgroundColor: '#1a1a2e',
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '14px',
          }}
        >
          Go Home
        </Link>
        <Link
          href="/groups"
          style={{
            padding: '10px 24px',
            border: '1px solid #1a1a2e',
            color: '#1a1a2e',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '14px',
          }}
        >
          Browse Groups
        </Link>
      </div>
    </div>
  )
}
