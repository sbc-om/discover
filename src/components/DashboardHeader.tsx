'use client';

import { useTranslations } from 'next-intl';
import { LogOut } from 'lucide-react';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import ThemeToggle from '@/components/ThemeToggle';

interface DashboardHeaderProps {
  locale: string;
  userName?: string;
}

export default function DashboardHeader({ locale, userName }: DashboardHeaderProps) {
  const tCommon = useTranslations('common');
  const isRTL = locale === 'ar';

  return (
    <header 
      dir={isRTL ? 'rtl' : 'ltr'}
      className="bg-white/90 dark:bg-zinc-950/90 border-b border-zinc-200/70 dark:border-zinc-800/80 px-6 py-4 flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center shadow-lg">
          <span className="text-base font-black">DNA</span>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-500 dark:text-zinc-400">
            {tCommon('fullName')}
          </p>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            {tCommon('dna')}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <LocaleSwitcher />
        <ThemeToggle />

        {/* Logout Button */}
        <button
          onClick={() => {
            // Handle logout
            document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
            window.location.href = `/${locale}/login`;
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
          aria-label={tCommon('logout')}
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">{tCommon('logout')}</span>
        </button>
      </div>
    </header>
  );
}
