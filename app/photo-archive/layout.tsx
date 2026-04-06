import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Photo Archive',
  description: 'Browse historic photo collections from Crown Heights including the Ohel, Rebbe Library, and Broadcast Booth archives.',
  openGraph: {
    title: 'Photo Archive | Crown Heights Groups',
    description: 'Browse historic photo collections from Crown Heights including the Ohel, Rebbe Library, and Broadcast Booth archives.',
    url: 'https://www.crownheightsgroups.com/photo-archive',
  },
  alternates: {
    canonical: 'https://www.crownheightsgroups.com/photo-archive',
  },
};

export default function PhotoArchiveLayout({ children }: { children: React.ReactNode }) {
  return children;
}
