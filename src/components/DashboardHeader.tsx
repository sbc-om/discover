'use client';

import { LogOut } from 'lucide-react';
import Image from 'next/image';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import ThemeToggle from '@/components/ThemeToggle';

interface DashboardHeaderProps {
  locale: string;
  userName?: string;
}

export default function DashboardHeader({ locale, userName }: DashboardHeaderProps) {
  const isAr = locale === 'ar';
  const isRTL = isAr;

  return (
    <header 
      dir={isRTL ? 'rtl' : 'ltr'}
      className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200/50 dark:border-zinc-800/50 px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between"
    >
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl overflow-hidden flex items-center justify-center">
          <Image 
            src="/logo/icon-black.png"
            alt="DNA"
            width={40}
            height={40}
            className="dark:hidden"
          />
          <Image 
            src="/logo/icon-white.png"
            alt="DNA"
            width={40}
            height={40}
            className="hidden dark:block"
          />
        </div>
        <div className="hidden sm:block">
          <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-500 leading-none mb-0.5">
            {isAr ? 'اكتشف قدرتك الطبيعية' : 'Discover Natural Ability'}
          </p>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
            DNA
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <LocaleSwitcher />
        <ThemeToggle />

        {/* Logout Button - icon only on mobile */}
        <button
          onClick={async () => {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = `/${locale}/login`;
          }}
          className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors active:scale-95"
          aria-label={isAr ? 'تسجيل الخروج' : 'Logout'}
        >
          <LogOut className="w-4 h-4" />
          <span className="text-xs font-medium hidden sm:inline">{isAr ? 'خروج' : 'Logout'}</span>
        </button>
      </div>
    </header>
  );
}
