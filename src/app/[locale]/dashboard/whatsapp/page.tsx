import DashboardLayout from '@/components/DashboardLayout';
import { getSession } from '@/lib/session';
import { getAccessibleMenuItems } from '@/lib/permissions';
import WhatsAppContent from './WhatsAppContent';
import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function WhatsAppPage({ params }: Props) {
  const { locale } = await params;

  const session = await getSession();
  if (!session) {
    const redirectUrl = `/${locale}/login?redirect=/${locale}/dashboard/whatsapp`;
    redirect(redirectUrl);
  }
  const accessibleMenuItems = await getAccessibleMenuItems();

  return (
    <DashboardLayout 
      locale={locale} 
      userName={session.email}
      accessibleMenuItems={accessibleMenuItems}
    >
      <WhatsAppContent />
    </DashboardLayout>
  );
}
