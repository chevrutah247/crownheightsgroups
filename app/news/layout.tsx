import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Jewish Community News - Crown Heights',
  description: 'Latest news from Crown Heights and the Jewish world. Community updates, Torah insights, world news, and Russian-language news from trusted sources.',
  keywords: ['Crown Heights news', 'Jewish news', 'Chabad news', 'community news', 'Brooklyn Jewish'],
  openGraph: {
    title: 'Jewish Community News - Crown Heights',
    description: 'Latest news from Crown Heights and the Jewish world.',
    url: 'https://crownheightsgroups.com/news',
  },
  alternates: { canonical: 'https://crownheightsgroups.com/news' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
