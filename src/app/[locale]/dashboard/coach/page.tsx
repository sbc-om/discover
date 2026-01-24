import ProtectedPage from '@/components/ProtectedPage';
import CoachProgramsContent from '../programs/CoachProgramsContent';

export default async function CoachProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <ProtectedPage locale={locale} moduleName="coach_profile">
      <CoachProgramsContent />
    </ProtectedPage>
  );
}
