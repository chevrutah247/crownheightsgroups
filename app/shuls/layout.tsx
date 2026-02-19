import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Crown Heights Shuls & Synagogues',
  description: 'Directory of Crown Heights shuls and synagogues with contact info, addresses, photos, and moderated community reviews.',
  alternates: { canonical: 'https://crownheightsgroups.com/shuls' },
};

export default function ShulsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
