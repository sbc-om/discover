import DashboardLayout from '@/components/DashboardLayout';
import { useTranslations } from 'next-intl';
import { Users, Shield, Building2, Award } from 'lucide-react';

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // In a real app, fetch user data from session
  const userName = 'Admin User';

  const stats = [
    { 
      key: 'users',
      icon: Users, 
      value: '1,234', 
      labelEn: 'Total Users',
      labelAr: 'إجمالي المستخدمين',
      color: 'bg-black' 
    },
    { 
      key: 'coaches',
      icon: Shield, 
      value: '45', 
      labelEn: 'Coaches',
      labelAr: 'المدربون',
      color: 'bg-black' 
    },
    { 
      key: 'academies',
      icon: Building2, 
      value: '12', 
      labelEn: 'Academies',
      labelAr: 'الأكاديميات',
      color: 'bg-black' 
    },
    { 
      key: 'medals',
      icon: Award, 
      value: '89', 
      labelEn: 'Medal Requests',
      labelAr: 'طلبات الميداليات',
      color: 'bg-black' 
    },
  ];

  return (
    <DashboardLayout locale={locale} userName={userName}>
      <div dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          {locale === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
        </h1>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.key}
                className="bg-white rounded-lg shadow-md p-6 flex items-center gap-4"
              >
                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center text-white`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">
                    {locale === 'ar' ? stat.labelAr : stat.labelEn}
                  </p>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {locale === 'ar' ? 'النشاط الأخير' : 'Recent Activity'}
          </h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-medium">{i}</span>
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 font-medium">
                    {locale === 'ar' ? 'نشاط جديد' : 'New Activity'} #{i}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {locale === 'ar' ? 'منذ ساعتين' : '2 hours ago'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
