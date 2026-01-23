'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import ThemeToggle from '@/components/ThemeToggle';
import type { Locale } from '@/i18n/request';

interface TopNavbarProps {
  locale: Locale;
}

export default function TopNavbar({ locale }: TopNavbarProps) {
  const [open, setOpen] = useState(false);

  const navLinks = [
    { href: `/${locale}`, label: locale === 'ar' ? 'الرئيسية' : 'Home' },
    { href: `/${locale}/about`, label: locale === 'ar' ? 'عن البرنامج' : 'About' },
    { href: `/${locale}/login`, label: locale === 'ar' ? 'تسجيل الدخول' : 'Login' }
  ];

  return (
    <header className="sticky top-0 z-30 w-full border-b border-zinc-200/70 bg-white/80 backdrop-blur dark:border-zinc-800/80 dark:bg-zinc-950/80">
      <div className="container mx-auto flex items-center justify-between px-4 py-4 rtl:flex-row-reverse">
        <div className="flex items-center gap-3 rtl:flex-row-reverse">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black text-white dark:bg-white dark:text-black">
            <span className="text-lg font-bold">DNA</span>
          </div>
          <div className="ltr:text-left rtl:text-right">
            <h1 className="text-lg font-semibold">DNA</h1>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              {locale === 'ar' ? 'اكتشف القدرة الطبيعية' : 'Discover Natural Ability'}
            </p>
          </div>
        </div>

        <nav className="hidden items-center gap-6 text-sm font-medium text-zinc-700 dark:text-zinc-200 lg:flex rtl:flex-row-reverse">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition hover:text-zinc-950 dark:hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex rtl:flex-row-reverse">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-2 lg:hidden rtl:flex-row-reverse">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-800 transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:focus-visible:ring-zinc-600"
            aria-label={locale === 'ar' ? 'فتح القائمة' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-40">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label={locale === 'ar' ? 'إغلاق القائمة' : 'Close menu'}
            onClick={() => setOpen(false)}
          />
          <div
            id="mobile-menu"
            className="absolute top-0 h-full w-72 bg-white shadow-xl dark:bg-zinc-950 ltr:left-0 rtl:right-0"
          >
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-4 dark:border-zinc-800 rtl:flex-row-reverse">
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                {locale === 'ar' ? 'القائمة' : 'Menu'}
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-800 transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:focus-visible:ring-zinc-600"
                aria-label={locale === 'ar' ? 'إغلاق القائمة' : 'Close menu'}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="flex flex-col gap-3 px-4 py-6 text-sm font-medium text-zinc-700 dark:text-zinc-200 ltr:text-left rtl:text-right">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 transition hover:bg-zinc-100 dark:hover:bg-zinc-900"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4">
                <LocaleSwitcher />
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
