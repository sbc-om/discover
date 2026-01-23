'use client';

import { Globe } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
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

  const nextLocale: Locale = locale === 'en' ? 'ar' : 'en';

  const handleSwitch = () => {
    const nextPath = replaceLocaleInPath(pathname || `/${locale}`, nextLocale);
    setLocale(nextLocale);
    router.push(nextPath);
  };

  return (
    <button
      type="button"
      onClick={handleSwitch}
      className="inline-flex h-10 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:focus-visible:ring-zinc-600 rtl:flex-row-reverse"
      aria-label={nextLocale === 'ar' ? 'Switch language to Arabic' : 'Switch language to English'}
      title={nextLocale === 'ar' ? 'Switch language to Arabic' : 'Switch language to English'}
    >
      <Globe className="h-4 w-4" />
      <span>{nextLocale === 'ar' ? 'العربية' : 'English'}</span>
    </button>
  );
}
