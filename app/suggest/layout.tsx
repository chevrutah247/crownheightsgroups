import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Add a Listing',
  description: 'Suggest a WhatsApp group or local service to add to the Crown Heights community directory. Share groups and businesses with the community.',
  openGraph: {
    title: 'Add a Listing | Crown Heights Groups',
    description: 'Suggest a WhatsApp group or local service to add to the Crown Heights community directory. Share groups and businesses with the community.',
    url: 'https://www.crownheightsgroups.com/suggest',
  },
  alternates: {
    canonical: 'https://www.crownheightsgroups.com/suggest',
  },
};

export default function SuggestLayout({ children }: { children: React.ReactNode }) {
  return children;
}
