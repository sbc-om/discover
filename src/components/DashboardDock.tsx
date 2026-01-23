'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRef } from 'react';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
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
  settings: Settings,
};

export default function DashboardDock({ locale, accessibleMenuItems = [] }: DashboardDockProps) {
  const pathname = usePathname();
  const tCommon = useTranslations('common');
  const isRTL = locale === 'ar';
  const osRef = useRef<any>(null);

  const scrollRail = (direction: 'left' | 'right') => {
    const osInstance = osRef.current?.osInstance?.();
    if (!osInstance) return;
    const viewport = osInstance.elements().viewport;
    const delta = direction === 'left' ? -280 : 280;
    viewport.scrollBy({ left: isRTL ? -delta : delta, behavior: 'smooth' });
  };

  return (
    <section
      dir={isRTL ? 'rtl' : 'ltr'}
      className="shrink-0 px-4 pb-4 pt-2"
      style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
    >
      <div className="relative glass-panel rounded-[28px] border border-white/60 dark:border-white/10 bg-white/80 dark:bg-zinc-900/70 px-3 py-3">
        {accessibleMenuItems.length === 0 ? (
          <div className="text-center text-zinc-500 dark:text-zinc-400 text-sm py-2">
            {tCommon('noData')}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollRail('left')}
              className="h-9 w-9 rounded-full border border-white/50 dark:border-white/10 bg-white/80 dark:bg-zinc-900/70 text-zinc-700 dark:text-zinc-200 flex items-center justify-center transition hover:-translate-y-0.5"
              aria-label={isRTL ? 'scroll right' : 'scroll left'}
            >
              {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>

            <OverlayScrollbarsComponent
              ref={osRef}
              options={{ scrollbars: { autoHide: 'leave' }, overflow: { x: 'scroll', y: 'hidden' } }}
              className="flex-1 min-w-0"
              defer
            >
              <div className="flex items-center gap-2">
                {accessibleMenuItems.map((item) => {
                  const Icon = iconMap[item.icon] || LayoutDashboard;
                  const itemPath = `/${locale}${item.route}`;
                  const isActive = pathname === itemPath;

                  return (
                    <Link
                      key={item.name}
                      href={itemPath}
                      aria-current={isActive ? 'page' : undefined}
                      className={`group relative flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-2 text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-zinc-900 text-white border-transparent dark:bg-white dark:text-zinc-900'
                          : 'bg-white/70 dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-200 border-white/40 dark:border-zinc-800/60 hover:-translate-y-0.5 hover:shadow-md'
                      }`}
                    >
                      <span className={`flex h-7 w-7 items-center justify-center rounded-full ${
                        isActive
                          ? 'bg-white/15 text-white dark:bg-zinc-900/10 dark:text-zinc-900'
                          : 'bg-zinc-900/5 text-zinc-900 dark:bg-white/10 dark:text-white'
                      }`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <span>{isRTL ? item.name_ar : item.name_en}</span>
                    </Link>
                  );
                })}
              </div>
            </OverlayScrollbarsComponent>

            <button
              type="button"
              onClick={() => scrollRail('right')}
              className="h-9 w-9 rounded-full border border-white/50 dark:border-white/10 bg-white/80 dark:bg-zinc-900/70 text-zinc-700 dark:text-zinc-200 flex items-center justify-center transition hover:-translate-y-0.5"
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
