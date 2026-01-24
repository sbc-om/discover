import ProtectedPage from '@/components/ProtectedPage';
import NotificationsContent from './NotificationsContent';

export default async function NotificationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <ProtectedPage locale={locale} moduleName="messages">
      <NotificationsContent />
    </ProtectedPage>
  );
}
