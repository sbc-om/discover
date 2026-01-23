import DashboardHeader from '@/components/DashboardHeader';
import ScrollArea from '@/components/ScrollArea';
import DashboardDock from '@/components/DashboardDock';
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
    <div dir={isRTL ? 'rtl' : 'ltr'} className="h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950 flex flex-col relative">
      <DashboardHeader locale={locale} userName={userName} />
      <ScrollArea className="flex-1 pb-24">
        <main className="h-full p-6">
          {children}
        </main>
      </ScrollArea>
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <DashboardDock locale={locale} accessibleMenuItems={accessibleMenuItems} />
      </div>
    </div>
  );
}
