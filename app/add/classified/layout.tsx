import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Post a Free Classified Ad',
  description: 'Post a free classified ad in Crown Heights. Sell items, find housing, list jobs, offer services, or post lost and found notices.',
  openGraph: {
    title: 'Post a Free Classified Ad | Crown Heights Groups',
    description: 'Post a free classified ad in Crown Heights. Sell items, find housing, list jobs, offer services, or post lost and found notices.',
    url: 'https://www.crownheightsgroups.com/add/classified',
  },
  alternates: {
    canonical: 'https://www.crownheightsgroups.com/add/classified',
  },
};

export default function AddClassifiedLayout({ children }: { children: React.ReactNode }) {
  return children;
}
