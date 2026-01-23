import Link from 'next/link';
import TopNavbar from '@/components/TopNavbar';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-zinc-50 to-zinc-100 dark:from-black dark:via-zinc-950 dark:to-zinc-900">
      <TopNavbar locale={locale as 'en' | 'ar'} />
      <div className="container mx-auto px-4 py-16">

        {/* Hero Section */}
        <div className="text-center text-zinc-900 dark:text-white mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            {locale === 'ar' 
              ? 'اكتشف القدرة الطبيعية'
              : 'Discover Natural Ability'
            }
          </h2>
          <p className="text-xl md:text-2xl text-zinc-600 dark:text-zinc-300 mb-8 max-w-3xl mx-auto">
            {locale === 'ar'
              ? 'نظام متكامل لاكتشاف وإدارة المواهب الرياضية في الأكاديميات والبرامج الرياضية'
              : 'A comprehensive system for discovering and managing sports talents in academies and sports programs'
            }
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href={`/${locale}/dashboard`}
              className="px-8 py-4 bg-black text-white dark:bg-white dark:text-black rounded-lg font-bold text-lg hover:bg-zinc-900 dark:hover:bg-zinc-100 transition-colors shadow-lg"
            >
              {locale === 'ar' ? 'ابدأ الآن' : 'Get Started'}
            </Link>
            <Link
              href={`/${locale}/about`}
              className="px-8 py-4 bg-black/5 text-zinc-900 dark:bg-white/10 dark:text-white rounded-lg font-bold text-lg hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
            >
              {locale === 'ar' ? 'معرفة المزيد' : 'Learn More'}
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white/80 dark:bg-white/10 backdrop-blur-md rounded-xl p-6 text-zinc-900 dark:text-white border border-zinc-200/80 dark:border-zinc-800/80 ltr:text-left rtl:text-right">
            <div className="w-12 h-12 bg-zinc-900 text-white dark:bg-zinc-800 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">
              {locale === 'ar' ? 'إدارة المستخدمين' : 'User Management'}
            </h3>
            <p className="text-zinc-600 dark:text-zinc-300">
              {locale === 'ar' 
                ? 'نظام شامل لإدارة المستخدمين والأدوار والصلاحيات'
                : 'Comprehensive system for managing users, roles and permissions'
              }
            </p>
          </div>

          <div className="bg-white/80 dark:bg-white/10 backdrop-blur-md rounded-xl p-6 text-zinc-900 dark:text-white border border-zinc-200/80 dark:border-zinc-800/80 ltr:text-left rtl:text-right">
            <div className="w-12 h-12 bg-zinc-900 text-white dark:bg-zinc-800 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">
              {locale === 'ar' ? 'تتبع الأداء' : 'Performance Tracking'}
            </h3>
            <p className="text-zinc-600 dark:text-zinc-300">
              {locale === 'ar'
                ? 'متابعة الفحوصات الصحية والأداء الرياضي للاعبين'
                : 'Track health tests and athletic performance of players'
              }
            </p>
          </div>

          <div className="bg-white/80 dark:bg-white/10 backdrop-blur-md rounded-xl p-6 text-zinc-900 dark:text-white border border-zinc-200/80 dark:border-zinc-800/80 ltr:text-left rtl:text-right">
            <div className="w-12 h-12 bg-zinc-900 text-white dark:bg-zinc-800 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">
              {locale === 'ar' ? 'التواصل الفعال' : 'Effective Communication'}
            </h3>
            <p className="text-zinc-600 dark:text-zinc-300">
              {locale === 'ar'
                ? 'نظام رسائل متكامل مع دعم WhatsApp'
                : 'Integrated messaging system with WhatsApp support'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
