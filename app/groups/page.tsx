import { Suspense } from 'react';
import type { Metadata } from 'next';
import GroupsClient from './GroupsClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'WhatsApp Groups Directory - Crown Heights Community',
  description: 'Browse and join 500+ WhatsApp groups for Crown Heights community. Find groups for jobs, housing, buy & sell, Torah learning, rides, events, and more.',
  keywords: ['WhatsApp groups', 'Crown Heights', 'Jewish groups', 'Brooklyn community', 'Chabad groups'],
  openGraph: {
    title: 'WhatsApp Groups Directory - Crown Heights',
    description: 'Browse and join 500+ WhatsApp groups for Crown Heights community.',
    url: 'https://crownheightsgroups.com/groups',
  },
  alternates: { canonical: 'https://crownheightsgroups.com/groups' },
};

export default function GroupsPage() {
  return (
    <Suspense fallback={<div className="auth-container"><div className="loading"><div className="spinner"></div></div></div>}>
      <GroupsClient />
    </Suspense>
  );
}
