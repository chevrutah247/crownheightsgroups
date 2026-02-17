import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hachnasat Kallah - Wedding Services & Gemach',
  description: 'Free and affordable wedding services for Jewish brides: wedding dresses, makeup, DJs, accessories, bridal guides. Gemach services in Israel and worldwide.',
  keywords: ['hachnasat kallah', 'wedding gemach', 'Jewish wedding', 'free wedding dress', 'bridal services'],
  openGraph: {
    title: 'Hachnasat Kallah - Wedding Services & Gemach',
    description: 'Free and affordable wedding services for Jewish brides.',
    url: 'https://crownheightsgroups.com/kallah',
  },
  alternates: { canonical: 'https://crownheightsgroups.com/kallah' },
};

const kallahSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Hachnasat Kallah - Wedding Gemach Services',
  description: 'Free and affordable wedding services for Jewish brides in Israel',
  url: 'https://crownheightsgroups.com/kallah',
  numberOfItems: 23,
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Wedding Dresses Gemach' },
    { '@type': 'ListItem', position: 2, name: 'Bridal Makeup' },
    { '@type': 'ListItem', position: 3, name: 'DJ Services' },
    { '@type': 'ListItem', position: 4, name: 'Wedding Accessories' },
    { '@type': 'ListItem', position: 5, name: 'Bridal Guidance' },
  ],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(kallahSchema) }}
      />
      {children}
    </>
  );
}
