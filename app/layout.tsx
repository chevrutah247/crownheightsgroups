import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Crown Heights Groups - WhatsApp Community Directory',
    template: '%s | Crown Heights Groups'
  },
  description: 'Discover and join WhatsApp groups in Crown Heights and surrounding neighborhoods. Find community groups, job boards, events, and more.',
  keywords: ['Crown Heights', 'WhatsApp groups', 'Brooklyn', 'community', 'Jewish community', 'neighborhood groups'],
  authors: [{ name: 'Crown Heights Groups' }],
  creator: 'Crown Heights Groups',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://crownheightsgroups.com',
    siteName: 'Crown Heights Groups',
    title: 'Crown Heights Groups - WhatsApp Community Directory',
    description: 'Discover and join WhatsApp groups in Crown Heights and surrounding neighborhoods.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Crown Heights Groups - WhatsApp Community Directory',
    description: 'Discover and join WhatsApp groups in Crown Heights and surrounding neighborhoods.',
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL('https://crownheightsgroups.com'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href="https://crownheightsgroups.com" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
