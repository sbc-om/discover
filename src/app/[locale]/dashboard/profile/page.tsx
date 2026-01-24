import ProtectedPage from '@/components/ProtectedPage';
import PlayerProfileContent from './PlayerProfileContent';

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <ProtectedPage locale={locale} moduleName="player_profile">
      <PlayerProfileContent />
    </ProtectedPage>
  );
}
