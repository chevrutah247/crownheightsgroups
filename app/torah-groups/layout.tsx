import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Torah Learning Groups - Study Partners & Classes',
  description: 'Join Torah study groups in multiple languages: English, Russian, Hebrew, Yiddish. Find chavrusas, daily shiurim, Tanya classes, Chumash, and Gemara study groups.',
  keywords: ['Torah learning', 'chavrusa', 'Jewish study groups', 'Tanya class', 'online shiur', 'Russian Torah'],
  openGraph: {
    title: 'Torah Learning Groups - Study Partners & Classes',
    description: 'Join Torah study groups in multiple languages. Find chavrusas and daily shiurim.',
    url: 'https://crownheightsgroups.com/torah-groups',
  },
  alternates: { canonical: 'https://crownheightsgroups.com/torah-groups' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
