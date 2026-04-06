import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Add Your Business',
  description: 'List your business in the Crown Heights community directory. Add your store, restaurant, service, or professional practice for free.',
  openGraph: {
    title: 'Add Your Business | Crown Heights Groups',
    description: 'List your business in the Crown Heights community directory. Add your store, restaurant, service, or professional practice for free.',
    url: 'https://www.crownheightsgroups.com/add/business',
  },
  alternates: {
    canonical: 'https://www.crownheightsgroups.com/add/business',
  },
};

export default function AddBusinessLayout({ children }: { children: React.ReactNode }) {
  return children;
}
