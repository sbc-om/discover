import Sidebar from '@/components/Sidebar';
import DashboardHeader from '@/components/DashboardHeader';
import ScrollArea from '@/components/ScrollArea';
import { ReactNode } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
  locale: string;
  userName?: string;
  accessibleMenuItems?: any[];
}

export default function DashboardLayout({ 
  children, 
  locale, 
  userName,
  accessibleMenuItems = []
}: DashboardLayoutProps) {
  const isRTL = locale === 'ar';
  
  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Sidebar locale={locale} accessibleMenuItems={accessibleMenuItems} />
      <div className="flex-1 flex flex-col min-h-screen">
        <DashboardHeader locale={locale} userName={userName} />
        <ScrollArea className="flex-1">
          <main className="min-h-full p-6">
            {children}
          </main>
        </ScrollArea>
      </div>
    </div>
  );
}
