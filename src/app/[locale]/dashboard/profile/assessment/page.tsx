import ProtectedPage from '@/components/ProtectedPage';
import AssessmentContent from './AssessmentContent';

export default async function AssessmentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <ProtectedPage locale={locale} moduleName="player_profile">
      <AssessmentContent />
    </ProtectedPage>
  );
}
