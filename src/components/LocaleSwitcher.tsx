'use client';

import { Globe } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import useLocale from '@/hooks/useLocale';
import type { Locale } from '@/i18n/request';

const replaceLocaleInPath = (pathname: string, nextLocale: Locale) => {
  if (!pathname) return `/${nextLocale}`;
  const replaced = pathname.replace(/^\/(en|ar)(?=\/|$)/, `/${nextLocale}`);
  return replaced === pathname ? `/${nextLocale}${pathname}` : replaced;
};

export default function LocaleSwitcher() {
  const { locale, setLocale } = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isAnimating, setIsAnimating] = useState(false);

  const nextLocale: Locale = locale === 'en' ? 'ar' : 'en';

  const handleSwitch = useCallback(() => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    // Add smooth transition class to body for gentle content transition
    document.body.style.transition = 'opacity 0.2s ease-out';
    document.body.style.opacity = '0.7';
    
    setTimeout(() => {
      const nextPath = replaceLocaleInPath(pathname || `/${locale}`, nextLocale);
      setLocale(nextLocale);
      router.push(nextPath);
      
      // Restore opacity smoothly
      setTimeout(() => {
        document.body.style.opacity = '1';
        setTimeout(() => {
          document.body.style.transition = '';
          setIsAnimating(false);
        }, 200);
      }, 100);
    }, 200);
  }, [isAnimating, locale, nextLocale, pathname, router, setLocale]);

  return (
    <button
      type="button"
      onClick={handleSwitch}
      disabled={isAnimating}
      className="group relative inline-flex h-10 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-800 transition-all duration-300 hover:bg-zinc-50 hover:border-zinc-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:hover:border-zinc-700 dark:focus-visible:ring-zinc-600 rtl:flex-row-reverse disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
      aria-label={nextLocale === 'ar' ? 'Switch language to Arabic' : 'Switch language to English'}
      title={nextLocale === 'ar' ? 'Switch language to Arabic' : 'Switch language to English'}
    >
      <span className={`transition-transform duration-500 ease-out ${isAnimating ? 'rotate-[360deg] scale-110' : 'group-hover:rotate-12'}`}>
        <Globe className="h-4 w-4" />
      </span>
      <span className="relative overflow-hidden">
        <span className={`inline-block transition-all duration-300 ${isAnimating ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
          {nextLocale === 'ar' ? 'العربية' : 'English'}
        </span>
      </span>
      {/* Subtle shine effect on hover */}
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-700 dark:via-white/10" />
    </button>
  );
}
