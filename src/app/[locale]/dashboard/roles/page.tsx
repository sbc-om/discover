import ProtectedPage from '@/components/ProtectedPage';
import RolesContent from './RolesContent';

export default async function RolesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <ProtectedPage locale={locale} moduleName="roles">
      <RolesContent />
    </ProtectedPage>
  );
}
