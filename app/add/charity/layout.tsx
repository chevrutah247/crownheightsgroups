import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Add a Charity Campaign',
  description: 'Create a fundraising campaign for someone in need in the Crown Heights community. Submit a verified charity campaign with reference.',
  openGraph: {
    title: 'Add a Charity Campaign | Crown Heights Groups',
    description: 'Create a fundraising campaign for someone in need in the Crown Heights community. Submit a verified charity campaign with reference.',
    url: 'https://www.crownheightsgroups.com/add/charity',
  },
  alternates: {
    canonical: 'https://www.crownheightsgroups.com/add/charity',
  },
};

export default function AddCharityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
