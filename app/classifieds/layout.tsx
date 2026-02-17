import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Community Classifieds - Buy, Sell, Housing, Jobs',
  description: 'Free classifieds board for Crown Heights community. Post and browse listings: items for sale, free stuff, housing, jobs, services, and more.',
  keywords: ['Crown Heights classifieds', 'buy sell Brooklyn', 'Jewish community marketplace', 'housing Crown Heights', 'jobs Brooklyn'],
  openGraph: {
    title: 'Community Classifieds - Crown Heights Groups',
    description: 'Free classifieds board for Crown Heights. Buy, sell, find housing, jobs, and more.',
    url: 'https://crownheightsgroups.com/classifieds',
  },
  alternates: { canonical: 'https://crownheightsgroups.com/classifieds' },
};

const classifiedsSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Crown Heights Community Classifieds',
  description: 'Free classifieds board for the Crown Heights Jewish community',
  url: 'https://crownheightsgroups.com/classifieds',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Items For Sale' },
    { '@type': 'ListItem', position: 2, name: 'Free Stuff' },
    { '@type': 'ListItem', position: 3, name: 'Housing & Rentals' },
    { '@type': 'ListItem', position: 4, name: 'Jobs & Gigs' },
    { '@type': 'ListItem', position: 5, name: 'Services' },
    { '@type': 'ListItem', position: 6, name: 'Wanted' },
    { '@type': 'ListItem', position: 7, name: 'Lost & Found' },
  ],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(classifiedsSchema) }}
      />
      {children}
    </>
  );
}
