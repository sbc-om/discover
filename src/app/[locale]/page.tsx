import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-800">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-black">DNA</span>
            </div>
            <div className="text-white">
              <h1 className="text-2xl font-bold">DNA</h1>
              <p className="text-sm text-gray-300">
                {locale === 'ar' ? 'اكتشف القدرة الطبيعية' : 'Discover Natural Ability'}
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <Link
              href={locale === 'en' ? '/ar' : '/en'}
              className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              {locale === 'en' ? 'العربية' : 'English'}
            </Link>
            <Link
              href={`/${locale}/login`}
              className="px-6 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              {locale === 'ar' ? 'تسجيل الدخول' : 'Login'}
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <div className="text-center text-white mb-16" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            {locale === 'ar' 
              ? 'اكتشف القدرة الطبيعية'
              : 'Discover Natural Ability'
            }
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            {locale === 'ar'
              ? 'نظام متكامل لاكتشاف وإدارة المواهب الرياضية في الأكاديميات والبرامج الرياضية'
              : 'A comprehensive system for discovering and managing sports talents in academies and sports programs'
            }
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href={`/${locale}/dashboard`}
              className="px-8 py-4 bg-white text-black rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              {locale === 'ar' ? 'ابدأ الآن' : 'Get Started'}
            </Link>
            <Link
              href={`/${locale}/about`}
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-lg font-bold text-lg hover:bg-white/20 transition-colors"
            >
              {locale === 'ar' ? 'معرفة المزيد' : 'Learn More'}
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-white">
            <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">
              {locale === 'ar' ? 'إدارة المستخدمين' : 'User Management'}
            </h3>
            <p className="text-gray-300">
              {locale === 'ar' 
                ? 'نظام شامل لإدارة المستخدمين والأدوار والصلاحيات'
                : 'Comprehensive system for managing users, roles and permissions'
              }
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-white">
            <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">
              {locale === 'ar' ? 'تتبع الأداء' : 'Performance Tracking'}
            </h3>
            <p className="text-gray-300">
              {locale === 'ar'
                ? 'متابعة الفحوصات الصحية والأداء الرياضي للاعبين'
                : 'Track health tests and athletic performance of players'
              }
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-white">
            <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">
              {locale === 'ar' ? 'التواصل الفعال' : 'Effective Communication'}
            </h3>
            <p className="text-gray-300">
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
