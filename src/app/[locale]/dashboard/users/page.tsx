import ProtectedPage from '@/components/ProtectedPage';
import UsersContent from './UsersContent';

export default async function UsersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <ProtectedPage locale={locale} moduleName="users">
      <UsersContent />
    </ProtectedPage>
  );
}
