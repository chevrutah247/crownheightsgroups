import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Subscribe to Updates',
  description: 'Subscribe to Crown Heights Groups updates and get notified when new WhatsApp groups and community resources are added.',
  openGraph: {
    title: 'Subscribe to Updates | Crown Heights Groups',
    description: 'Subscribe to Crown Heights Groups updates and get notified when new WhatsApp groups and community resources are added.',
    url: 'https://www.crownheightsgroups.com/subscribe',
  },
  alternates: {
    canonical: 'https://www.crownheightsgroups.com/subscribe',
  },
};

export default function SubscribeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
