import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Recent Updates',
  description: 'See recently added WhatsApp groups and community resources in Crown Heights. Filter by time period and language.',
  openGraph: {
    title: 'Recent Updates | Crown Heights Groups',
    description: 'See recently added WhatsApp groups and community resources in Crown Heights. Filter by time period and language.',
    url: 'https://www.crownheightsgroups.com/updates',
  },
  alternates: {
    canonical: 'https://www.crownheightsgroups.com/updates',
  },
};

export default function UpdatesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
