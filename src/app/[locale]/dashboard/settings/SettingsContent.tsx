'use client';

import { useState } from 'react';
import { Settings, Database, Award } from 'lucide-react';
import useLocale from '@/hooks/useLocale';
import BackupRestoreTab from './BackupRestoreTab';
import AchievementsTab from './AchievementsTab';
import ThemeToggle from '@/components/ThemeToggle';
import LocaleSwitcher from '@/components/LocaleSwitcher';

type TabKey = 'general' | 'achievements' | 'backup';

interface Tab {
  key: TabKey;
  labelEn: string;
  labelAr: string;
  icon: React.ElementType;
}

const tabs: Tab[] = [
  { key: 'general', labelEn: 'General', labelAr: 'عام', icon: Settings },
  { key: 'achievements', labelEn: 'Achievements', labelAr: 'الإنجازات', icon: Award },
  { key: 'backup', labelEn: 'Backup & Restore', labelAr: 'النسخ الاحتياطي والاستعادة', icon: Database },
];

export default function SettingsContent() {
  const { locale } = useLocale();
  const isAr = locale === 'ar';
  const [activeTab, setActiveTab] = useState<TabKey>('general');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        {isAr ? 'الإعدادات' : 'Settings'}
      </h1>

      {/* Tabs */}
      <div className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  flex items-center gap-2 px-4 py-3 font-medium text-sm whitespace-nowrap transition-colors border-b-2
                  ${isActive
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
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

        {activeTab === 'achievements' && <AchievementsTab />}
        
        {activeTab === 'backup' && <BackupRestoreTab />}
      </div>
    </div>
  );
}
