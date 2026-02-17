import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact & Feedback',
  description: 'Send feedback, report bugs, or suggest improvements to Crown Heights Groups community platform.',
  alternates: { canonical: 'https://crownheightsgroups.com/contact' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
