import { redirect } from 'next/navigation';
import LoginForm from '@/components/LoginForm';
import { getSession } from '@/lib/session';

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getSession();

  if (session) {
    const destination = session.roleName === 'player'
      ? `/${locale}/dashboard/profile`
      : session.roleName === 'coach'
        ? `/${locale}/dashboard/coach`
        : `/${locale}/dashboard`;
    redirect(destination);
  }

  return <LoginForm locale={locale} />;
}
