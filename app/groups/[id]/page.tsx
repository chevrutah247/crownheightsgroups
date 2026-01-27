import { Suspense } from 'react';
import GroupDetailClient from './GroupDetailClient';

export const dynamic = 'force-dynamic';

export default function GroupDetailPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div className="auth-container"><div className="loading"><div className="spinner"></div></div></div>}>
      <GroupDetailClient groupId={params.id} />
    </Suspense>
  );
}
