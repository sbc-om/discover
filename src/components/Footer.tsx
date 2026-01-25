import Link from 'next/link';
import type { Locale } from '@/i18n/request';

interface FooterProps {
  locale: Locale;
}

export default function Footer({ locale }: FooterProps) {
  const isAr = locale === 'ar';

  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-zinc-900 dark:text-white">DNA</span>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">|</span>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {isAr ? 'اكتشف قدرتك الطبيعية' : 'Discover Natural Ability'}
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <Link
              href={`/${locale}`}
              className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              {isAr ? 'الرئيسية' : 'Home'}
            </Link>
            <Link
              href={`/${locale}/about`}
              className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              {isAr ? 'عن النظام' : 'About'}
            </Link>
            <Link
              href={`/${locale}/contact`}
              className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              {isAr ? 'تواصل معنا' : 'Contact'}
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            © {new Date().getFullYear()} Discover
          </div>
        </div>
      </div>
    </footer>
  );
}
