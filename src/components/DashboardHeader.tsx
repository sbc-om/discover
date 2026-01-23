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
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('common');
  const isRTL = locale === 'ar';

  return (
    <header 
      dir={isRTL ? 'rtl' : 'ltr'}
      className="bg-white/90 dark:bg-zinc-950/90 border-b border-zinc-200/70 dark:border-zinc-800/80 px-6 py-4 flex items-center justify-between"
    >
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          {userName ? `${t('welcome')}, ${userName}` : t('title')}
        </h2>
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
