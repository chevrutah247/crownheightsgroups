import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Add an Event',
  description: 'Share a community event in Crown Heights. Post shiurim, farbrengens, simchas, weddings, and other community gatherings.',
  openGraph: {
    title: 'Add an Event | Crown Heights Groups',
    description: 'Share a community event in Crown Heights. Post shiurim, farbrengens, simchas, weddings, and other community gatherings.',
    url: 'https://www.crownheightsgroups.com/add/event',
  },
  alternates: {
    canonical: 'https://www.crownheightsgroups.com/add/event',
  },
};

export default function AddEventLayout({ children }: { children: React.ReactNode }) {
  return children;
}
