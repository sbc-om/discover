import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken, type JWTPayload } from './auth';

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token');
  if (!token) {
    return null;
  }

  return verifyToken(token.value);
}

/** Detect the current locale from the request URL or fall back to 'en'. */
async function detectLocale(): Promise<string> {
  try {
    const headerList = await headers();
    const url = headerList.get('x-url') || headerList.get('x-invoke-path') || headerList.get('referer') || '';
    const match = url.match(/\/(en|ar)(\/|$)/);
    if (match) return match[1];
  } catch {}
  return 'en';
}

export async function requireAuth(): Promise<JWTPayload> {
  const session = await getSession();

  if (!session) {
    const locale = await detectLocale();
    redirect(`/${locale}/login`);
  }

  return session;
}

export async function requireRole(allowedRoles: string[]): Promise<JWTPayload> {
  const session = await requireAuth();

  if (!allowedRoles.includes(session.roleName)) {
    const locale = await detectLocale();
    redirect(`/${locale}/dashboard`);
  }

  return session;
}
