import type { Metadata } from "next";
import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import FloatingContactSticker from "@/components/FloatingContactSticker";

export const metadata: Metadata = {
  title: {
    default: 'Crown Heights Groups - Jewish Community Directory & WhatsApp Groups',
    template: '%s | Crown Heights Groups',
  },
  description: 'Find and join 500+ WhatsApp groups, local services, businesses, events, Torah learning, and community resources in Crown Heights, Brooklyn and beyond.',
  keywords: ['Crown Heights', 'WhatsApp groups', 'Jewish community', 'Brooklyn', 'Chabad', 'services', 'business directory', 'Torah learning', 'Shabbos hosting', 'gemach', 'events'],
  authors: [{ name: 'Crown Heights Groups' }],
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  metadataBase: new URL('https://crownheightsgroups.com'),
  openGraph: {
    title: 'Crown Heights Groups - Jewish Community Directory',
    description: 'Find and join 500+ WhatsApp groups, local services, businesses, and community resources in Crown Heights, Brooklyn.',
    url: 'https://crownheightsgroups.com',
    siteName: 'Crown Heights Groups',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Crown Heights Groups - Jewish Community Directory',
    description: 'Find and join 500+ WhatsApp groups, local services, businesses, and community resources in Crown Heights, Brooklyn.',
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
  },
  alternates: {
    canonical: 'https://crownheightsgroups.com',
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Crown Heights Groups',
  url: 'https://crownheightsgroups.com',
  logo: 'https://crownheightsgroups.com/favicon.png',
  description: 'Jewish community directory for Crown Heights, Brooklyn. WhatsApp groups, services, businesses, events, and resources.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Crown Heights',
    addressRegion: 'NY',
    addressCountry: 'US',
  },
  sameAs: [],
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Crown Heights Groups',
  url: 'https://crownheightsgroups.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://crownheightsgroups.com/search?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body>
        <GoogleAnalytics />
        <FloatingContactSticker />
        {children}
      </body>
    </html>
  );
}
