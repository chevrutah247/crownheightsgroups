import { Suspense } from 'react';
import GroupsClient from './GroupsClient';

export const dynamic = 'force-dynamic';

export default function GroupsPage() {
  return (
    <Suspense fallback={<div className="auth-container"><div className="loading"><div className="spinner"></div></div></div>}>
      <GroupsClient />
    </Suspense>
  );
}
