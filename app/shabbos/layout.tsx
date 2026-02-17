import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shabbos Hospitality - Host & Find Shabbat Meals',
  description: 'Connect with Shabbos hosts in Crown Heights. Find or offer Shabbat meals, hosting, and hospitality. Hachnasat Orchim in the community.',
  keywords: ['Shabbos hosting', 'Shabbat meals', 'hachnasat orchim', 'Crown Heights Shabbos', 'Jewish hospitality'],
  openGraph: {
    title: 'Shabbos Hospitality - Crown Heights',
    description: 'Connect with Shabbos hosts in Crown Heights. Find or offer Shabbat meals.',
    url: 'https://crownheightsgroups.com/shabbos',
  },
  alternates: { canonical: 'https://crownheightsgroups.com/shabbos' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
