import DashboardLayout from '@/components/DashboardLayout';
import { requireAuth } from '@/lib/session';
import { getAccessibleMenuItems } from '@/lib/permissions';
import ProgramsContent from './ProgramsContent';

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function ProgramsPage({ params }: Props) {
  const { locale } = await params;

  const session = await requireAuth();
  const accessibleMenuItems = await getAccessibleMenuItems();

  return (
    <DashboardLayout 
      locale={locale} 
      userName={session.email}
      accessibleMenuItems={accessibleMenuItems}
    >
      <ProgramsContent />
    </DashboardLayout>
  );
}
