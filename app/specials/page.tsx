import type { Metadata } from 'next';
import SpecialsClient from './SpecialsClient';

export const metadata: Metadata = {
  title: 'Store Specials — Price Comparison | Crown Heights Groups',
  description: 'Compare weekly specials and sale prices from Crown Heights kosher grocery stores: KosherTown, Kosher Family, Empire Kosher, and Kahan\'s Kosher.',
  openGraph: {
    title: 'Store Specials — Price Comparison | Crown Heights Groups',
    description: 'Compare weekly specials from Crown Heights kosher grocery stores. Find the best deals on kosher products.',
    url: 'https://crownheightsgroups.com/specials',
    type: 'website',
  },
};

export default function SpecialsPage() {
  return <SpecialsClient />;
}
