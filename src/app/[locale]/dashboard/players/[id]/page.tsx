import ProtectedPage from '@/components/ProtectedPage';
import PlayerProfileContent from '../../profile/PlayerProfileContent';

export default async function PlayerProfilePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  return (
    <ProtectedPage locale={locale} moduleName="users">
      <PlayerProfileContent userId={id} readOnly />
    </ProtectedPage>
  );
}
