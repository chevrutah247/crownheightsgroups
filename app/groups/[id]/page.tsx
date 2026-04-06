import { Suspense } from 'react';
import type { Metadata } from 'next';
import GroupDetailClient from './GroupDetailClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  let title = 'Group Details';
  let description = 'View group details, join WhatsApp or Telegram groups, and connect with the Crown Heights community.';

  try {
    const { Redis } = await import('@upstash/redis');
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;

    if (url && token) {
      const redis = new Redis({ url, token });
      const stored = await redis.get('groups');
      let groups: any[] = [];
      if (stored) {
        groups = typeof stored === 'string' ? JSON.parse(stored) : stored;
        if (!Array.isArray(groups)) groups = [];
      }
      const group = groups.find((g: any) => g.id === params.id);
      if (group) {
        title = group.title;
        description = group.description
          ? group.description.slice(0, 160)
          : `Join ${group.title} — a Crown Heights community group. Connect via WhatsApp, Telegram, or other platforms.`;
      }
    }
  } catch {
    // Fall back to generic metadata
  }

  return {
    title,
    description,
    openGraph: {
      title: `${title} | Crown Heights Groups`,
      description,
      url: `https://www.crownheightsgroups.com/groups/${params.id}`,
    },
    alternates: {
      canonical: `https://www.crownheightsgroups.com/groups/${params.id}`,
    },
  };
}

export default function GroupDetailPage({ params }: PageProps) {
  return (
    <Suspense fallback={<div className="auth-container"><div className="loading"><div className="spinner"></div></div></div>}>
      <GroupDetailClient groupId={params.id} />
    </Suspense>
  );
}
