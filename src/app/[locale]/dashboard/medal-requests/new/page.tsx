import DashboardLayout from '@/components/DashboardLayout';
import { requireAuth } from '@/lib/session';
import { getAccessibleMenuItems } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import NewMedalRequestContent from './NewMedalRequestContent';

export default async function NewMedalRequestPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  try {
    const session = await requireAuth();
    
    // Only admin and academy_manager can access
    if (!['admin', 'academy_manager'].includes(session.roleName || '')) {
      redirect(`/${locale}/dashboard`);
    }

    const accessibleMenuItems = await getAccessibleMenuItems();
    const userName = session.email;

    return (
      <DashboardLayout locale={locale} userName={userName} accessibleMenuItems={accessibleMenuItems}>
        <NewMedalRequestContent />
      </DashboardLayout>
    );
  } catch (error) {
    redirect(`/${locale}/login`);
  }
}
