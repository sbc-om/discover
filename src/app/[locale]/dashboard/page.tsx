import DashboardLayout from '@/components/DashboardLayout';
import { Users, Shield, Building2, Award } from 'lucide-react';
import { requireAuth } from '@/lib/session';
import { getAccessibleMenuItems } from '@/lib/permissions';
import { redirect } from 'next/navigation';

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Require authentication
  try {
    const session = await requireAuth();
    const accessibleMenuItems = await getAccessibleMenuItems();
    
    const userName = session.email;

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
      <DashboardLayout locale={locale} userName={userName} accessibleMenuItems={accessibleMenuItems}>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {locale === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              {locale === 'ar' 
                ? `مرحباً ${userName}، هذه نظرة عامة على نظامك`
                : `Welcome ${userName}, here's an overview of your system`
              }
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.key}
                  className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-sm border border-zinc-200 dark:border-zinc-800"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${stat.color} text-white dark:bg-white dark:text-black rounded-lg p-3`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    {locale === 'ar' ? stat.labelAr : stat.labelEn}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-xl font-bold mb-4">
              {locale === 'ar' ? 'النشاط الأخير' : 'Recent Activity'}
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              {locale === 'ar' 
                ? 'لا توجد أنشطة حديثة للعرض'
                : 'No recent activity to display'
              }
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  } catch (error) {
    // Not authenticated, redirect to login
    redirect(`/${locale}/login`);
  }
}
