import type { Metadata } from "next";
import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import FloatingContactSticker from "@/components/FloatingContactSticker";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import DoNotCallPopup from "@/components/DoNotCallPopup";

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
  manifest: '/manifest.json',
  metadataBase: new URL('https://www.crownheightsgroups.com'),
  openGraph: {
    title: 'Crown Heights Groups - Jewish Community Directory',
    description: 'Find and join 500+ WhatsApp groups, local services, businesses, and community resources in Crown Heights, Brooklyn.',
    url: 'https://www.crownheightsgroups.com',
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
    canonical: 'https://www.crownheightsgroups.com',
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Crown Heights Groups',
  url: 'https://www.crownheightsgroups.com',
  logo: 'https://www.crownheightsgroups.com/favicon.png',
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
  url: 'https://www.crownheightsgroups.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://www.crownheightsgroups.com/search?q={search_term_string}',
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
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://credible-dogfish-42233.upstash.io" />
        <link rel="dns-prefetch" href="https://credible-dogfish-42233.upstash.io" />
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: 'What is CrownHeightsGroups?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'CrownHeightsGroups is a community directory of WhatsApp groups for the Crown Heights Jewish community in Brooklyn, NY.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Is CrownHeightsGroups free to use?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes, browsing and joining groups is completely free.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'How do I join a WhatsApp group on CrownHeightsGroups?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Find a group in the directory and click the WhatsApp link to join directly.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Can I add my group to the CrownHeightsGroups directory?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes, use the "Add Group" feature to submit your WhatsApp group for listing.',
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body>
        <BreadcrumbJsonLd />
        <GoogleAnalytics />
        <FloatingContactSticker />
        <DoNotCallPopup />
        {children}
      </body>
    </html>
  );
}
