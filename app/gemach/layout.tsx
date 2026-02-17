import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gemach - Free Loans & Community Resources',
  description: 'Find gemach services: interest-free loans, free food, clothing, baby items, medical equipment, and more. Jewish community mutual aid resources.',
  keywords: ['gemach', 'free loans', 'Jewish mutual aid', 'Crown Heights gemach', 'interest-free loans', 'community resources'],
  openGraph: {
    title: 'Gemach - Free Loans & Community Resources',
    description: 'Find gemach services: interest-free loans, free food, clothing, and more.',
    url: 'https://crownheightsgroups.com/gemach',
  },
  alternates: { canonical: 'https://crownheightsgroups.com/gemach' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
