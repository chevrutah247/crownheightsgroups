import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Host Shabbos Guests',
  description: 'Open your home and invite guests for Shabbos meals in Crown Heights. Post hosting availability for Friday night dinner, Shabbos lunch, and Seudah Shlishis.',
  openGraph: {
    title: 'Host Shabbos Guests | Crown Heights Groups',
    description: 'Open your home and invite guests for Shabbos meals in Crown Heights. Post hosting availability for Friday night dinner, Shabbos lunch, and Seudah Shlishis.',
    url: 'https://www.crownheightsgroups.com/add/shabbos',
  },
  alternates: {
    canonical: 'https://www.crownheightsgroups.com/add/shabbos',
  },
};

export default function AddShabbosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
