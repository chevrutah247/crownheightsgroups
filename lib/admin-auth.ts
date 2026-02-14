import { cookies } from 'next/headers';
import { validateSession } from './auth';

export async function requireAdmin(): Promise<{ authorized: boolean; error?: string }> {
  const cookieStore = cookies();
  const token = cookieStore.get('session_token')?.value;

  if (!token) {
    return { authorized: false, error: 'Not authenticated' };
  }

  const user = await validateSession(token);
  if (!user) {
    return { authorized: false, error: 'Invalid session' };
  }

  if (user.role !== 'admin') {
    return { authorized: false, error: 'Admin access required' };
  }

  return { authorized: true };
}
