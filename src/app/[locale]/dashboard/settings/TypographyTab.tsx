'use client';

import { useEffect, useState } from 'react';
import { Save, Type, Languages } from 'lucide-react';
import useLocale from '@/hooks/useLocale';
import { useToast } from '@/components/ToastProvider';

interface Settings {
  font_arabic: string;
  font_english: string;
  font_size_base: string;
  font_size_heading_1: string;
  font_size_heading_2: string;
  font_size_heading_3: string;
  font_size_heading_4: string;
}

const ARABIC_FONTS = [
  {
    name: 'IBM Plex Sans Arabic',
    googleFont: 'IBM+Plex+Sans+Arabic:wght@300;400;500;600;700',
    sample: 'نظام قياس وتحفيز للأكاديميات الرياضية - Discover Natural Ability',
  },
  {
    name: 'Cairo',
    googleFont: 'Cairo:wght@300;400;500;600;700;800',
    sample: 'نظام قياس وتحفيز للأكاديميات الرياضية - Discover Natural Ability',
  },
  {
    name: 'Tajawal',
    googleFont: 'Tajawal:wght@300;400;500;700;800',
    sample: 'نظام قياس وتحفيز للأكاديميات الرياضية - Discover Natural Ability',
  },
  {
    name: 'Almarai',
    googleFont: 'Almarai:wght@300;400;700;800',
    sample: 'نظام قياس وتحفيز للأكاديميات الرياضية - Discover Natural Ability',
  },
  {
    name: 'Noto Sans Arabic',
    googleFont: 'Noto+Sans+Arabic:wght@300;400;500;600;700;800',
    sample: 'نظام قياس وتحفيز للأكاديميات الرياضية - Discover Natural Ability',
  },
  {
    name: 'Amiri',
    googleFont: 'Amiri:wght@400;700',
    sample: 'نظام قياس وتحفيز للأكاديميات الرياضية - Discover Natural Ability',
  },
];

const ENGLISH_FONTS = [
  {
    name: 'Inter',
    googleFont: 'Inter:wght@300;400;500;600;700;800',
    sample: 'Professional measurement and motivation system for sports academies',
  },
  {
    name: 'Poppins',
    googleFont: 'Poppins:wght@300;400;500;600;700;800',
    sample: 'Professional measurement and motivation system for sports academies',
  },
  {
    name: 'Roboto',
    googleFont: 'Roboto:wght@300;400;500;700;900',
    sample: 'Professional measurement and motivation system for sports academies',
  },
  {
    name: 'Open Sans',
    googleFont: 'Open+Sans:wght@300;400;500;600;700;800',
    sample: 'Professional measurement and motivation system for sports academies',
  },
  {
    name: 'Montserrat',
    googleFont: 'Montserrat:wght@300;400;500;600;700;800',
    sample: 'Professional measurement and motivation system for sports academies',
  },
  {
    name: 'Manrope',
    googleFont: 'Manrope:wght@300;400;500;600;700;800',
    sample: 'Professional measurement and motivation system for sports academies',
  },
];

export default function TypographyTab() {
  const { locale } = useLocale();
  const isAr = locale === 'ar';
  const { showToast } = useToast();
  
  const [settings, setSettings] = useState<Settings>({
    font_arabic: 'IBM Plex Sans Arabic',
    font_english: 'Inter',
    font_size_base: '16',
    font_size_heading_1: '48',
    font_size_heading_2: '36',
    font_size_heading_3: '24',
    font_size_heading_4: '20',
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings');
      const data = await response.json();
      if (response.ok) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Failed to load settings', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showToast('success', isAr ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully');
        // Reload page to apply new fonts
        setTimeout(() => window.location.reload(), 1000);
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      showToast('error', error.message || (isAr ? 'فشل حفظ الإعدادات' : 'Failed to save settings'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-zinc-500">
        {isAr ? 'جاري التحميل...' : 'Loading...'}
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-white">
            {isAr ? 'إعدادات الخطوط' : 'Typography Settings'}
          </h2>
          <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {isAr ? 'تخصيص الخطوط وأحجام النصوص' : 'Customize fonts and text sizes'}
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 md:px-6 py-2.5 md:py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm md:text-base font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4 md:w-5 md:h-5" />
          {saving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ التغييرات' : 'Save Changes')}
        </button>
      </div>

      {/* Arabic Font Selection */}
      <div className="rounded-xl md:rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 md:p-6">
        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shrink-0">
            <Languages className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base md:text-xl font-bold text-zinc-900 dark:text-white">
              {isAr ? 'الخط العربي' : 'Arabic Font'}
            </h3>
            <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400">
              {isAr ? 'اختر الخط المناسب للنصوص العربية' : 'Select the appropriate font for Arabic text'}
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:gap-4">
          {ARABIC_FONTS.map((font) => (
            <label
              key={font.name}
              className={`relative cursor-pointer rounded-lg md:rounded-xl border-2 p-3 md:p-4 transition-all ${
                settings.font_arabic === font.name
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
                  : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <input
                type="radio"
                name="font_arabic"
                value={font.name}
                checked={settings.font_arabic === font.name}
                onChange={(e) => setSettings({ ...settings, font_arabic: e.target.value })}
                className="sr-only"
              />
              <div className="flex items-start gap-3 md:gap-4">
                <div className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 md:mt-1 ${
                  settings.font_arabic === font.name
                    ? 'border-orange-500 bg-orange-500'
                    : 'border-zinc-300 dark:border-zinc-600'
                }`}>
                  {settings.font_arabic === font.name && (
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm md:text-base font-semibold text-zinc-900 dark:text-white mb-1 md:mb-2">{font.name}</p>
                  <link href={`https://fonts.googleapis.com/css2?family=${font.googleFont}&display=swap`} rel="stylesheet" />
                  <p
                    className="text-sm md:text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed break-words"
                    style={{ fontFamily: font.name }}
                  >
                    {font.sample}
                  </p>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* English Font Selection */}
      <div className="rounded-xl md:rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 md:p-6">
        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
            <Type className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base md:text-xl font-bold text-zinc-900 dark:text-white">
              {isAr ? 'الخط الإنجليزي' : 'English Font'}
            </h3>
            <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400">
              {isAr ? 'اختر الخط المناسب للنصوص الإنجليزية' : 'Select the appropriate font for English text'}
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:gap-4">
          {ENGLISH_FONTS.map((font) => (
            <label
              key={font.name}
              className={`relative cursor-pointer rounded-lg md:rounded-xl border-2 p-3 md:p-4 transition-all ${
                settings.font_english === font.name
                  ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/20'
                  : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <input
                type="radio"
                name="font_english"
                value={font.name}
                checked={settings.font_english === font.name}
                onChange={(e) => setSettings({ ...settings, font_english: e.target.value })}
                className="sr-only"
              />
              <div className="flex items-start gap-3 md:gap-4">
                <div className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 md:mt-1 ${
                  settings.font_english === font.name
                    ? 'border-violet-500 bg-violet-500'
                    : 'border-zinc-300 dark:border-zinc-600'
                }`}>
                  {settings.font_english === font.name && (
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm md:text-base font-semibold text-zinc-900 dark:text-white mb-1 md:mb-2">{font.name}</p>
                  <link href={`https://fonts.googleapis.com/css2?family=${font.googleFont}&display=swap`} rel="stylesheet" />
                  <p
                    className="text-sm md:text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed break-words"
                    style={{ fontFamily: font.name }}
                  >
                    {font.sample}
                  </p>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Font Sizes */}
      <div className="rounded-xl md:rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 md:p-6">
        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shrink-0">
            <Type className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base md:text-xl font-bold text-zinc-900 dark:text-white">
              {isAr ? 'أحجام الخطوط' : 'Font Sizes'}
            </h3>
            <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400">
              {isAr ? 'تحديد أحجام النصوص والعناوين' : 'Set text and heading sizes'}
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
          <div>
            <label className="block text-xs md:text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              {isAr ? 'حجم النص الأساسي (px)' : 'Base Text Size (px)'}
            </label>
            <input
              type="number"
              min="12"
              max="24"
              value={settings.font_size_base}
              onChange={(e) => setSettings({ ...settings, font_size_base: e.target.value })}
              className="w-full px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm md:text-base"
            />
          </div>

          <div>
            <label className="block text-xs md:text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              {isAr ? 'حجم العنوان 1 (px)' : 'Heading 1 Size (px)'}
            </label>
            <input
              type="number"
              min="32"
              max="72"
              value={settings.font_size_heading_1}
              onChange={(e) => setSettings({ ...settings, font_size_heading_1: e.target.value })}
              className="w-full px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm md:text-base"
            />
          </div>

          <div>
            <label className="block text-xs md:text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              {isAr ? 'حجم العنوان 2 (px)' : 'Heading 2 Size (px)'}
            </label>
            <input
              type="number"
              min="24"
              max="56"
              value={settings.font_size_heading_2}
              onChange={(e) => setSettings({ ...settings, font_size_heading_2: e.target.value })}
              className="w-full px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm md:text-base"
            />
          </div>

          <div>
            <label className="block text-xs md:text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              {isAr ? 'حجم العنوان 3 (px)' : 'Heading 3 Size (px)'}
            </label>
            <input
              type="number"
              min="18"
              max="40"
              value={settings.font_size_heading_3}
              onChange={(e) => setSettings({ ...settings, font_size_heading_3: e.target.value })}
              className="w-full px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm md:text-base"
            />
          </div>

          <div>
            <label className="block text-xs md:text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              {isAr ? 'حجم العنوان 4 (px)' : 'Heading 4 Size (px)'}
            </label>
            <input
              type="number"
              min="16"
              max="32"
              value={settings.font_size_heading_4}
              onChange={(e) => setSettings({ ...settings, font_size_heading_4: e.target.value })}
              className="w-full px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm md:text-base"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
