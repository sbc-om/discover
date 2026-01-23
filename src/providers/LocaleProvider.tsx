'use client';

import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import type { Locale } from '@/i18n/request';

interface LocaleContextValue {
  locale: Locale;
  direction: 'ltr' | 'rtl';
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

const resolveDirection = (locale: Locale): 'ltr' | 'rtl' =>
  locale === 'ar' ? 'rtl' : 'ltr';

const extractLocaleFromPath = (pathname: string): Locale | null => {
  const match = pathname.match(/^\/(en|ar)(?=\/|$)/);
  if (!match) return null;
  return match[1] as Locale;
};

export default function LocaleProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
}) {
  const pathname = usePathname();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    if (!pathname) return;
    const pathLocale = extractLocaleFromPath(pathname);
    if (pathLocale && pathLocale !== locale) {
      setLocaleState(pathLocale);
    }
  }, [pathname, locale]);

  useEffect(() => {
    const dir = resolveDirection(locale);
    const root = document.documentElement;
    root.lang = locale;
    root.dir = dir;

    try {
      window.localStorage.setItem('locale', locale);
    } catch {
      // ignore
    }

    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;
  }, [locale]);

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
  }, []);

  const value = useMemo(
    () => ({ locale, direction: resolveDirection(locale), setLocale }),
    [locale, setLocale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export { LocaleContext };
