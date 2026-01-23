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
      className="bg-white/90 dark:bg-zinc-950/90 border-b border-zinc-200/70 dark:border-zinc-800/80 px-6 py-4 flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl overflow-hidden flex items-center justify-center">
          <Image 
            src="/logo/icon-black.png"
            alt="DNA"
            width={40}
            height={40}
            className="dark:hidden"
          />
          <Image 
            src="/logo/logo-white.png"
            alt="DNA"
            width={40}
            height={40}
            className="hidden dark:block"
          />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-500 dark:text-zinc-400">
            {isAr ? 'اكتشف قدرتك الطبيعية' : 'Discover Natural Ability'}
          </p>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            DNA
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
          aria-label={isAr ? 'تسجيل الخروج' : 'Logout'}
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">{isAr ? 'خروج' : 'Logout'}</span>
        </button>
      </div>
    </header>
  );
}
