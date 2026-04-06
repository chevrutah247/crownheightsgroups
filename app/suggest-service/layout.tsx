import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Suggest a Service',
  description: 'Recommend a local professional or service provider for the Crown Heights community directory. Share plumbers, electricians, tutors, and more.',
  openGraph: {
    title: 'Suggest a Service | Crown Heights Groups',
    description: 'Recommend a local professional or service provider for the Crown Heights community directory. Share plumbers, electricians, tutors, and more.',
    url: 'https://www.crownheightsgroups.com/suggest-service',
  },
  alternates: {
    canonical: 'https://www.crownheightsgroups.com/suggest-service',
  },
};

export default function SuggestServiceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
