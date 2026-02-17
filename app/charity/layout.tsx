import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Charity & Fundraising - Jewish Campaigns',
  description: 'Support Jewish community campaigns and charity initiatives. Tzedakah opportunities in Crown Heights and worldwide.',
  keywords: ['Jewish charity', 'tzedakah', 'Crown Heights charity', 'Jewish fundraising', 'community campaigns'],
  openGraph: {
    title: 'Charity & Fundraising - Crown Heights Groups',
    description: 'Support Jewish community campaigns and charity initiatives.',
    url: 'https://crownheightsgroups.com/charity',
  },
  alternates: { canonical: 'https://crownheightsgroups.com/charity' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
