import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Post Community News',
  description: 'Share community news, announcements, Mazel Tovs, and updates with Crown Heights. Post news for the community to see.',
  openGraph: {
    title: 'Post Community News | Crown Heights Groups',
    description: 'Share community news, announcements, Mazel Tovs, and updates with Crown Heights. Post news for the community to see.',
    url: 'https://www.crownheightsgroups.com/add/news',
  },
  alternates: {
    canonical: 'https://www.crownheightsgroups.com/add/news',
  },
};

export default function AddNewsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
