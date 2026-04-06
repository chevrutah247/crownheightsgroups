import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Suggest a Torah Group',
  description: 'Suggest a Torah study group for the Crown Heights community. Share WhatsApp, Telegram, Zoom, or other Torah learning groups.',
  openGraph: {
    title: 'Suggest a Torah Group | Crown Heights Groups',
    description: 'Suggest a Torah study group for the Crown Heights community. Share WhatsApp, Telegram, Zoom, or other Torah learning groups.',
    url: 'https://www.crownheightsgroups.com/suggest-group',
  },
  alternates: {
    canonical: 'https://www.crownheightsgroups.com/suggest-group',
  },
};

export default function SuggestGroupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
