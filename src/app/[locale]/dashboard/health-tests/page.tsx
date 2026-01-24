import ProtectedPage from '@/components/ProtectedPage';
import HealthTestsContent from './HealthTestsContent';

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function HealthTestsPage({ params }: Props) {
  const { locale } = await params;

  return (
    <ProtectedPage locale={locale} moduleName="health_tests">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          {locale === 'ar' ? 'الاختبارات الصحية' : 'Health Tests'}
        </h1>
        <HealthTestsContent />
      </div>
    </ProtectedPage>
  );
}
