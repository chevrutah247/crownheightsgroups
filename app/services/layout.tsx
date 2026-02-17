import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Local Services & Professionals - Crown Heights',
  description: 'Find trusted local professionals in Crown Heights: plumbers, electricians, locksmiths, taxi, notary, contractors, and more. Jewish-owned services with reviews.',
  keywords: ['Crown Heights services', 'Jewish professionals', 'Brooklyn plumber', 'Crown Heights electrician', 'local services'],
  openGraph: {
    title: 'Local Services & Professionals - Crown Heights',
    description: 'Find trusted local professionals in Crown Heights: plumbers, electricians, taxi, and more.',
    url: 'https://crownheightsgroups.com/services',
  },
  alternates: { canonical: 'https://crownheightsgroups.com/services' },
};

const servicesSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Crown Heights Local Services',
  description: 'Directory of local services and professionals in Crown Heights, Brooklyn',
  url: 'https://crownheightsgroups.com/services',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Plumbers' },
    { '@type': 'ListItem', position: 2, name: 'Electricians' },
    { '@type': 'ListItem', position: 3, name: 'Taxi Services' },
    { '@type': 'ListItem', position: 4, name: 'Locksmiths' },
    { '@type': 'ListItem', position: 5, name: 'Handyman' },
    { '@type': 'ListItem', position: 6, name: 'Cleaning Services' },
    { '@type': 'ListItem', position: 7, name: 'HVAC' },
    { '@type': 'ListItem', position: 8, name: 'Glass & Mirrors' },
  ],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesSchema) }}
      />
      {children}
    </>
  );
}
