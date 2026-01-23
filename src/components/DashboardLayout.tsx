import Sidebar from '@/components/Sidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { ReactNode } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
  locale: string;
  userName?: string;
}

export default function DashboardLayout({ children, locale, userName }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950 rtl:flex-row-reverse">
      <Sidebar locale={locale} />
      <div className="flex-1 flex flex-col">
        <DashboardHeader locale={locale} userName={userName} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
