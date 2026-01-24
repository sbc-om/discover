import { redirect } from 'next/navigation';
import ProtectedPage from '@/components/ProtectedPage';
import PlayerProfileContent from './PlayerProfileContent';
import { requireAuth } from '@/lib/session';

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await requireAuth();

  if (session.roleName !== 'player') {
    redirect(`/${locale}/dashboard`);
  }

  return (
    <ProtectedPage locale={locale} moduleName="player_profile">
      <PlayerProfileContent />
    </ProtectedPage>
  );
}
