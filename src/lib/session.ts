import { cookies } from 'next/headers';
import { verifyToken, type JWTPayload } from './auth';

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token');

  if (!token) {
    return null;
  }

  return verifyToken(token.value);
}

export async function requireAuth(): Promise<JWTPayload> {
  const session = await getSession();

  if (!session) {
    throw new Error('Unauthorized');
  }

  return session;
}

export async function requireRole(allowedRoles: string[]): Promise<JWTPayload> {
  const session = await requireAuth();

  if (!allowedRoles.includes(session.roleName)) {
    throw new Error('Forbidden');
  }

  return session;
}
