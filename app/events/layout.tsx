import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Community Events - Crown Heights',
  description: 'Find and post community events in Crown Heights: shiurim, farbrengens, simchas, classes, kids programs, and special trips. Stay connected with the community.',
  keywords: ['Crown Heights events', 'Jewish events', 'shiur', 'farbrengen', 'community events Brooklyn'],
  openGraph: {
    title: 'Community Events - Crown Heights',
    description: 'Find and post community events in Crown Heights.',
    url: 'https://crownheightsgroups.com/events',
  },
  alternates: { canonical: 'https://crownheightsgroups.com/events' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
