'use client';

import { useState, useRef, useEffect } from 'react';
import { Settings, Database, Award, Type, ChevronLeft, ChevronRight } from 'lucide-react';
import useLocale from '@/hooks/useLocale';
import BackupRestoreTab from './BackupRestoreTab';
import AchievementsTab from './AchievementsTab';
import TypographyTab from './TypographyTab';
import ThemeToggle from '@/components/ThemeToggle';
import LocaleSwitcher from '@/components/LocaleSwitcher';

type TabKey = 'general' | 'typography' | 'achievements' | 'backup';

interface Tab {
  key: TabKey;
  labelEn: string;
  labelAr: string;
  icon: React.ElementType;
}

const tabs: Tab[] = [
  { key: 'general', labelEn: 'General', labelAr: 'عام', icon: Settings },
  { key: 'typography', labelEn: 'Typography', labelAr: 'الخطوط', icon: Type },
  { key: 'achievements', labelEn: 'Achievements', labelAr: 'الإنجازات', icon: Award },
  { key: 'backup', labelEn: 'Backup & Restore', labelAr: 'النسخ الاحتياطي والاستعادة', icon: Database },
];

export default function SettingsContent() {
  const { locale } = useLocale();
  const isAr = locale === 'ar';
  const [activeTab, setActiveTab] = useState<TabKey>('general');
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftStart, setScrollLeftStart] = useState(0);

  const checkScroll = () => {
    const container = tabsContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowLeftButton(scrollLeft > 5);
    setShowRightButton(scrollLeft < scrollWidth - clientWidth - 5);
  };

  useEffect(() => {
    checkScroll();
    const container = tabsContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        container.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, []);

  const scrollTabs = (direction: 'left' | 'right') => {
    const container = tabsContainerRef.current;
    if (!container) return;

    const scrollAmount = 200;
    const newScrollLeft = direction === 'left'
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount;

    container.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
  };

  // Drag to scroll functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    const container = tabsContainerRef.current;
    if (!container) return;
    setIsDragging(true);
    setStartX(e.pageX - container.offsetLeft);
    setScrollLeftStart(container.scrollLeft);
    container.style.cursor = 'grabbing';
    container.style.userSelect = 'none';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const container = tabsContainerRef.current;
    if (!container) return;
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 1.5; // Scroll speed multiplier
    container.scrollLeft = scrollLeftStart - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    const container = tabsContainerRef.current;
    if (container) {
      container.style.cursor = 'grab';
      container.style.userSelect = 'auto';
    }
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      const container = tabsContainerRef.current;
      if (container) {
        container.style.cursor = 'grab';
        container.style.userSelect = 'auto';
      }
    }
  };

  // Touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const container = tabsContainerRef.current;
    if (!container) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - container.offsetLeft);
    setScrollLeftStart(container.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const container = tabsContainerRef.current;
    if (!container) return;
    const x = e.touches[0].pageX - container.offsetLeft;
    const walk = (x - startX) * 1.5;
    container.scrollLeft = scrollLeftStart - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        {isAr ? 'الإعدادات' : 'Settings'}
      </h1>

      {/* Tabs */}
      <div className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="relative">
          {/* Left Navigation Button */}
          {showLeftButton && (
            <button
              onClick={() => scrollTabs('left')}
              className="absolute left-0 top-0 bottom-0 z-10 px-2 bg-gradient-to-r from-white dark:from-zinc-950 via-white dark:via-zinc-950 to-transparent flex items-center"
              aria-label={isAr ? 'السابق' : 'Previous'}
            >
              <ChevronLeft className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
            </button>
          )}

          {/* Right Navigation Button */}
          {showRightButton && (
            <button
              onClick={() => scrollTabs('right')}
              className="absolute right-0 top-0 bottom-0 z-10 px-2 bg-gradient-to-l from-white dark:from-zinc-950 via-white dark:via-zinc-950 to-transparent flex items-center"
              aria-label={isAr ? 'التالي' : 'Next'}
            >
              <ChevronRight className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
            </button>
          )}

          {/* Tabs Container */}
          <div 
            ref={tabsContainerRef} 
            className="flex gap-2 overflow-x-auto pb-px -mb-px scrollbar-hide cursor-grab active:cursor-grabbing select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  flex items-center gap-2 px-4 py-3 font-medium text-sm whitespace-nowrap transition-all border-b-2 rounded-t-lg
                  ${isActive
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20'
                    : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{isAr ? tab.labelAr : tab.labelEn}</span>
              </button>
            );
          })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {activeTab === 'general' && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-3">
              <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                {isAr ? 'اللغة' : 'Language'}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {isAr ? 'تغيير لغة لوحة التحكم' : 'Change dashboard language'}
              </p>
              <LocaleSwitcher />
            </div>
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-3">
              <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                {isAr ? 'المظهر' : 'Theme'}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {isAr ? 'التبديل بين الوضع الفاتح والداكن' : 'Toggle light and dark mode'}
              </p>
              <ThemeToggle />
            </div>
          </div>
        )}

        {activeTab === 'typography' && <TypographyTab />}

        {activeTab === 'achievements' && <AchievementsTab />}
        
        {activeTab === 'backup' && <BackupRestoreTab />}
      </div>
    </div>
  );
}
