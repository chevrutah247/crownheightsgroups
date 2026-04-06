import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lottery Pool Terms & Conditions',
  description: 'Terms and conditions for the Crown Heights Groups community lottery pool. Read about eligibility, winnings distribution, referral program, and more.',
  openGraph: {
    title: 'Lottery Pool Terms & Conditions | Crown Heights Groups',
    description: 'Terms and conditions for the Crown Heights Groups community lottery pool. Read about eligibility, winnings distribution, referral program, and more.',
    url: 'https://www.crownheightsgroups.com/lottery/terms',
  },
  alternates: {
    canonical: 'https://www.crownheightsgroups.com/lottery/terms',
  },
};

export default function LotteryTermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
