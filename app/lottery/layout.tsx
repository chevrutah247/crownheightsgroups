import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Community Lottery Pool',
  description: 'Join the Crown Heights community lottery pool for Mega Millions and Powerball. More tickets, better odds, shared winnings starting from $2/week.',
  openGraph: {
    title: 'Community Lottery Pool | Crown Heights Groups',
    description: 'Join the Crown Heights community lottery pool for Mega Millions and Powerball. More tickets, better odds, shared winnings starting from $2/week.',
    url: 'https://www.crownheightsgroups.com/lottery',
  },
  alternates: {
    canonical: 'https://www.crownheightsgroups.com/lottery',
  },
};

export default function LotteryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
