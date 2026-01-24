import ProtectedPage from '@/components/ProtectedPage';
import CoachDashboardContent from './CoachDashboardContent';

export default async function CoachProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <ProtectedPage locale={locale} moduleName="coach_profile">
      <CoachDashboardContent />
    </ProtectedPage>
  );
}
