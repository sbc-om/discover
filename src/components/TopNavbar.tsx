'use client';

import Link from 'next/link';
import { Menu, X, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import ThemeToggle from '@/components/ThemeToggle';
import type { Locale } from '@/i18n/request';

interface TopNavbarProps {
  locale: Locale;
}

export default function TopNavbar({ locale }: TopNavbarProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isAr = locale === 'ar';
  const [dashboardHref, setDashboardHref] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          setDashboardHref(null);
          return;
        }
        const data = await response.json();
        const destination = data.roleName === 'player'
          ? `/${locale}/dashboard/profile`
          : data.roleName === 'coach'
            ? `/${locale}/dashboard/coach`
            : `/${locale}/dashboard`;
        setDashboardHref(destination);
      } catch (error) {
        setDashboardHref(null);
      }
    };

    fetchSession();
  }, [locale]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const navLinks = [
    { href: `/${locale}`, label: isAr ? 'الرئيسية' : 'Home' },
    { href: `/${locale}/about`, label: isAr ? 'عن النظام' : 'About' },
    { href: `/${locale}/contact`, label: isAr ? 'تواصل معنا' : 'Contact' },
  ];

  return (
    <>
      <header 
        dir={isAr ? 'rtl' : 'ltr'} 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl shadow-sm border-b border-zinc-200/50 dark:border-zinc-800/50' 
            : 'bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href={`/${locale}`} className="flex items-center gap-2.5 group">
              <div className="relative flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-700 dark:from-white dark:to-zinc-200 shadow-lg group-hover:shadow-xl transition-shadow">
                <img
                  src="/logo/icon-white.png"
                  alt="DNA"
                  className="h-5 w-5 md:h-6 md:w-6 dark:hidden"
                />
                <img
                  src="/logo/icon-black.png"
                  alt="DNA"
                  className="h-5 w-5 md:h-6 md:w-6 hidden dark:block"
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base md:text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
                  DNA
                </h1>
                <p className="text-[10px] md:text-xs text-zinc-500 dark:text-zinc-400 -mt-0.5">
                  {isAr ? 'اكتشف قدرتك' : 'Discover Ability'}
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors rounded-lg hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-2">
              <LocaleSwitcher />
              <ThemeToggle />
              <Link
                href={dashboardHref || `/${locale}/login`}
                className="ml-2 rtl:mr-2 rtl:ml-0 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-zinc-900 dark:bg-white dark:text-zinc-900 rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
              >
                {dashboardHref ? (isAr ? 'لوحة التحكم' : 'Dashboard') : (isAr ? 'تسجيل الدخول' : 'Sign In')}
                <ChevronRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-2 lg:hidden">
              <ThemeToggle />
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-700"
                aria-label={isAr ? 'فتح القائمة' : 'Open menu'}
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
        
        {/* Menu Panel */}
        <div
          dir={isAr ? 'rtl' : 'ltr'}
          className={`absolute top-0 bottom-0 w-[85%] max-w-sm bg-white dark:bg-zinc-900 shadow-2xl transition-transform duration-300 ease-out ${
            isAr ? 'right-0' : 'left-0'
          } ${
            open 
              ? 'translate-x-0' 
              : isAr ? 'translate-x-full' : '-translate-x-full'
          }`}
        >
          {/* Menu Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
            <Link href={`/${locale}`} className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-700 dark:from-white dark:to-zinc-200">
                <img
                  src="/logo/icon-white.png"
                  alt="DNA"
                  className="h-5 w-5 dark:hidden"
                />
                <img
                  src="/logo/icon-black.png"
                  alt="DNA"
                  className="h-5 w-5 hidden dark:block"
                />
              </div>
              <span className="text-lg font-bold text-zinc-900 dark:text-white">DNA</span>
            </Link>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              aria-label={isAr ? 'إغلاق' : 'Close'}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Menu Content */}
          <div className="flex flex-col h-[calc(100%-73px)]">
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between px-4 py-3.5 text-base font-medium text-zinc-700 dark:text-zinc-200 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  {link.label}
                  <ChevronRight className="h-4 w-4 text-zinc-400 rtl:rotate-180" />
                </Link>
              ))}
            </nav>

            {/* Menu Footer */}
            <div className="px-4 py-5 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  {isAr ? 'اللغة' : 'Language'}
                </span>
                <LocaleSwitcher />
              </div>
              <Link
                href={dashboardHref || `/${locale}/login`}
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-5 py-3.5 text-base font-semibold text-white bg-zinc-900 dark:bg-white dark:text-zinc-900 rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-lg"
              >
                {dashboardHref ? (isAr ? 'لوحة التحكم' : 'Dashboard') : (isAr ? 'تسجيل الدخول' : 'Sign In')}
                <ChevronRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
 