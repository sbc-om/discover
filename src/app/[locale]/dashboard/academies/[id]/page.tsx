import DashboardLayout from '@/components/DashboardLayout';
import { requireAuth } from '@/lib/session';
import { getAccessibleMenuItems } from '@/lib/permissions';
import AcademyDetailContent from './AcademyDetailContent';

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export default async function AcademyDetailPage({ params }: Props) {
  const { locale, id } = await params;

  const session = await requireAuth();
  const accessibleMenuItems = await getAccessibleMenuItems();

  return (
    <DashboardLayout 
      locale={locale} 
      userName={session.email}
      accessibleMenuItems={accessibleMenuItems}
    >
      <AcademyDetailContent academyId={id} />
    </DashboardLayout>
  );
}
