'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import {
  LayoutDashboard,
  Users,
  Shield,
  Building2,
  Activity,
  Award,
  Layers,
  Mail,
  MessageCircle,
  User,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface DashboardDockProps {
  locale: string;
  accessibleMenuItems?: {
    name: string;
    name_ar: string;
    name_en: string;
    icon: string;
    route: string;
  }[];
}

const iconMap: { [key: string]: any } = {
  dashboard: LayoutDashboard,
  users: Users,
  shield: Shield,
  building: Building2,
  activity: Activity,
  award: Award,
  layers: Layers,
  mail: Mail,
  'message-circle': MessageCircle,
  'user-circle': User,
  settings: Settings,
};

export default function DashboardDock({ locale, accessibleMenuItems = [] }: DashboardDockProps) {
  const pathname = usePathname();
  const isAr = locale === 'ar';
  const isRTL = isAr;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    dragFree: true,
    containScroll: 'trimSnaps',
    direction: isRTL ? 'rtl' : 'ltr',
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const activeIndex = accessibleMenuItems.findIndex((item) => `/${locale}${item.route}` === pathname);
    if (activeIndex >= 0) {
      emblaApi.scrollTo(activeIndex, true);
    }
  }, [emblaApi, accessibleMenuItems, locale, pathname]);

  return (
    <section
      dir={isRTL ? 'rtl' : 'ltr'}
      className="shrink-0 px-4 pb-4 pt-2 z-40 relative"
      style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
    >
      <div className="relative glass-panel rounded-[28px] border-2 border-zinc-900/15 dark:border-white/10 bg-white/90 dark:bg-zinc-900/70 shadow-lg shadow-zinc-900/5 dark:shadow-none px-3 py-3">
        {accessibleMenuItems.length === 0 ? (
          <div className="text-center text-zinc-500 dark:text-zinc-400 text-sm py-2">
            {isAr ? 'لا توجد بيانات' : 'No data'}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={scrollPrev}
              className="h-9 w-9 shrink-0 rounded-full border-2 border-zinc-900/20 dark:border-white/10 bg-white dark:bg-zinc-900/70 text-zinc-900 dark:text-zinc-200 flex items-center justify-center transition hover:-translate-y-0.5 hover:border-orange-500/50 hover:bg-orange-50 dark:hover:bg-zinc-800 shadow-sm"
              aria-label={isRTL ? 'scroll right' : 'scroll left'}
            >
              {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>

            <div className="flex-1 min-w-0 overflow-hidden" ref={emblaRef}>
              <div className="flex items-center gap-2 cursor-grab active:cursor-grabbing">
                {accessibleMenuItems.map((item) => {
                  const Icon = iconMap[item.icon] || LayoutDashboard;
                  const itemPath = `/${locale}${item.route}`;
                  const isActive = pathname === itemPath;

                  return (
                    <Link
                      key={item.name}
                      href={itemPath}
                      aria-current={isActive ? 'page' : undefined}
                      className="group relative flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium"
                    >
                      {isActive && (
                        <div className="absolute inset-0 rounded-full bg-zinc-900 dark:bg-white" />
                      )}
                      <span className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
                        isActive
                          ? 'bg-white/15 text-white dark:bg-zinc-900/10 dark:text-zinc-900'
                          : 'bg-zinc-900/5 text-zinc-900 dark:bg-white/10 dark:text-white group-hover:bg-orange-500 group-hover:text-white'
                      }`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className={`relative z-10 transition-colors ${
                        isActive
                          ? 'text-white dark:text-zinc-900'
                          : 'text-zinc-700 dark:text-zinc-200'
                      }`}>
                        {isRTL ? item.name_ar : item.name_en}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={scrollNext}
              className="h-9 w-9 shrink-0 rounded-full border-2 border-zinc-900/20 dark:border-white/10 bg-white dark:bg-zinc-900/70 text-zinc-900 dark:text-zinc-200 flex items-center justify-center transition hover:-translate-y-0.5 hover:border-orange-500/50 hover:bg-orange-50 dark:hover:bg-zinc-800 shadow-sm"
              aria-label={isRTL ? 'scroll left' : 'scroll right'}
            >
              {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
