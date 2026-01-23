import DashboardLayout from '@/components/DashboardLayout';
import { requireAuth } from '@/lib/session';
import { getAccessibleMenuItems } from '@/lib/permissions';
import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function WhatsAppPage({ params }: Props) {
  const { locale } = await params;
  const isAr = locale === 'ar';

  const session = await requireAuth();
  const accessibleMenuItems = await getAccessibleMenuItems();

  return (
    <DashboardLayout 
      locale={locale} 
      userName={session.email}
      accessibleMenuItems={accessibleMenuItems}
    >
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          {isAr ? 'واتساب' : 'WhatsApp'}
        </h1>
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
          <p className="text-zinc-500 dark:text-zinc-400">{isAr ? 'قريباً...' : 'Coming soon...'}</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
