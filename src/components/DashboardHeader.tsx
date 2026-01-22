'use client';

import { useTranslations } from 'next-intl';
import { LogOut, Globe } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface DashboardHeaderProps {
  locale: string;
  userName?: string;
}

export default function DashboardHeader({ locale, userName }: DashboardHeaderProps) {
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('common');
  const isRTL = locale === 'ar';
  const otherLocale = locale === 'en' ? 'ar' : 'en';
  const pathname = usePathname();
  
  // Remove locale from pathname for switching
  const pathnameWithoutLocale = pathname.replace(`/${locale}`, '');

  return (
    <header 
      className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          {userName ? `${t('welcome')}, ${userName}` : t('title')}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Language Switcher */}
        <Link
          href={`/${otherLocale}${pathnameWithoutLocale}`}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <Globe className="w-4 h-4" />
          <span className="text-sm font-medium">
            {otherLocale.toUpperCase()}
          </span>
        </Link>

        {/* Logout Button */}
        <button
          onClick={() => {
            // Handle logout
            document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
            window.location.href = `/${locale}/login`;
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">{tCommon('logout')}</span>
        </button>
      </div>
    </header>
  );
}
