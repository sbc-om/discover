import DashboardLayout from '@/components/DashboardLayout';
import { requireAuth } from '@/lib/session';
import { getAccessibleMenuItems } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import DashboardContent from './DashboardContent';

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Require authentication
  try {
    const session = await requireAuth();
    if (session.roleName === 'player') {
      redirect(`/${locale}/dashboard/profile`);
    }
    if (session.roleName === 'coach') {
      redirect(`/${locale}/dashboard/coach`);
    }
    const accessibleMenuItems = await getAccessibleMenuItems();
    
    const userName = session.email;

    return (
      <DashboardLayout locale={locale} userName={userName} accessibleMenuItems={accessibleMenuItems}>
        <DashboardContent />
      </DashboardLayout>
    );
  } catch (error) {
    // Not authenticated, redirect to login
    redirect(`/${locale}/login`);
  }
}
