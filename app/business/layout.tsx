import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Jewish Business Directory - Crown Heights & Worldwide',
  description: 'Browse Jewish-owned businesses worldwide. Categories: food, retail, health, beauty, auto, tech, finance, real estate, and more. Crown Heights and beyond.',
  keywords: ['Jewish business', 'Crown Heights business', 'kosher business', 'Jewish directory', 'frum business'],
  openGraph: {
    title: 'Jewish Business Directory - Crown Heights & Worldwide',
    description: 'Browse Jewish-owned businesses worldwide in Crown Heights and beyond.',
    url: 'https://crownheightsgroups.com/business',
  },
  alternates: { canonical: 'https://crownheightsgroups.com/business' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
