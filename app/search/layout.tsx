import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search Crown Heights Groups directory for WhatsApp groups, businesses, events, charities, and community resources.',
  openGraph: {
    title: 'Search | Crown Heights Groups',
    description: 'Search Crown Heights Groups directory for WhatsApp groups, businesses, events, charities, and community resources.',
    url: 'https://www.crownheightsgroups.com/search',
  },
  alternates: {
    canonical: 'https://www.crownheightsgroups.com/search',
  },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
