import { redirect } from 'next/navigation';
import ProtectedPage from '@/components/ProtectedPage';
import { requireAuth } from '@/lib/session';
import PlayerCardContent from './PlayerCardContent';

export default async function PlayerCardPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ user_id?: string }>;
}) {
  const { locale } = await params;
  const session = await requireAuth();
  const resolvedSearchParams = (await searchParams) || {};
  const userId = resolvedSearchParams.user_id;

  if (!userId && session.roleName !== 'player') {
    redirect(`/${locale}/dashboard`);
  }

  if (userId && session.roleName === 'player') {
    redirect(`/${locale}/dashboard/player-card`);
  }

  return (
    <ProtectedPage locale={locale}>
      <PlayerCardContent userId={userId} />
    </ProtectedPage>
  );
}
