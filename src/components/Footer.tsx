import Link from 'next/link';
import { Instagram, Twitter, Linkedin } from 'lucide-react';
import type { Locale } from '@/i18n/request';

interface FooterProps {
  locale: Locale;
}

export default function Footer({ locale }: FooterProps) {
  const isAr = locale === 'ar';

  return (
    <footer className="border-t border-zinc-200/80 bg-black text-white dark:border-zinc-800/80">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3 items-start">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                <span className="text-lg font-semibold">DNA</span>
              </div>
              <div>
                <h3 className="text-base font-semibold">
                  {isAr ? 'ديسكفر' : 'Discover'}
                </h3>
                <p className="text-xs text-zinc-400">
                  {isAr ? 'اكتشف قدرتك الطبيعية' : 'Discover Natural Ability'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-zinc-300">
              {isAr ? 'روابط سريعة' : 'Quick Links'}
            </h4>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/${locale}`}
                className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-white/80 hover:text-white hover:border-white/20 transition"
              >
                {isAr ? 'الرئيسية' : 'Home'}
              </Link>
              <Link
                href={`/${locale}/about`}
                className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-white/80 hover:text-white hover:border-white/20 transition"
              >
                {isAr ? 'عن النظام' : 'About'}
              </Link>
              <Link
                href={`/${locale}/contact`}
                className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-white/80 hover:text-white hover:border-white/20 transition"
              >
                {isAr ? 'تواصل معنا' : 'Contact'}
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-zinc-300">
              {isAr ? 'تابعنا' : 'Follow Us'}
            </h4>
            <div className="flex items-center gap-3">
              <a
                href="#"
                aria-label="Instagram"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-white/80 hover:text-white hover:border-white/20 transition"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-white/80 hover:text-white hover:border-white/20 transition"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-white/80 hover:text-white hover:border-white/20 transition"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-xs text-zinc-400 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <span>{isAr ? '© 2025 ديسكفر. جميع الحقوق محفوظة.' : '© 2025 Discover. All rights reserved.'}</span>
          <span>{isAr ? 'صُنع للأكاديميات الرياضية' : 'Built for sports academies'}</span>
        </div>
      </div>
    </footer>
  );
}
