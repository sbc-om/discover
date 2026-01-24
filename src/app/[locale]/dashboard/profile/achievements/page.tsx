import ProtectedPage from '@/components/ProtectedPage';
import AchievementsContent from './AchievementsContent';

export default async function AchievementsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <ProtectedPage locale={locale} moduleName="player_profile">
      <AchievementsContent />
    </ProtectedPage>
  );
}
