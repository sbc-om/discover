'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  Award,
  Building2,
  CheckCircle2,
  ClipboardList,
  Info,
  Shield,
  Users,
  UserX,
} from 'lucide-react';
import useLocale from '@/hooks/useLocale';
import { useToast } from '@/components/ToastProvider';
import {
  DashboardWidget,
  ActionItemCard,
  EmptyState,
  SummaryBanner,
  QuickStat,
} from '@/components/DashboardWidgets';

interface ActionItem {
  id: string;
  type: 'health_test' | 'medal_request' | 'payment_pending' | 'user_approval' | 'program_inactive';
  title: string;
  count: number;
  priority: 'high' | 'medium' | 'low';
  overdueCount?: number;
  dueTodayCount?: number;
  link: string;
  metadata?: Record<string, any>;
}

interface ActionCenterData {
  role: 'admin' | 'academy_manager';
  totalPendingActions: number;
  highPriorityCount: number;
  actions: ActionItem[];
  summary: {
    message: string;
    messageAr: string;
  };
}

interface StatsData {
  role: 'admin' | 'academy_manager';
  stats: {
    academies?: number;
    users?: number;
    coaches: number;
    players: number;
    programs?: number;
    pendingHealthTests: number;
    pendingMedalRequests: number;
  } | null;
  academy?: {
    id: string;
    name: string;
    name_ar?: string | null;
    city?: string | null;
    logo_url?: string | null;
    is_active: boolean;
  } | null;
}

const ACTION_TRANSLATIONS = {
  health_test: {
    en: 'Health Test Assessments',
    ar: 'تقييمات الفحص الصحي',
  },
  medal_request: {
    en: 'Medal Requests',
    ar: 'طلبات الميداليات',
  },
  user_approval: {
    en: 'Users Without Academy',
    ar: 'مستخدمون بدون أكاديمية',
  },
  program_inactive: {
    en: 'Academy Status',
    ar: 'حالة الأكاديمية',
  },
  payment_pending: {
    en: 'Pending Payments',
    ar: 'المدفوعات المعلقة',
  },
};

const ACTION_ICONS = {
  health_test: ClipboardList,
  medal_request: Award,
  user_approval: UserX,
  program_inactive: Building2,
  payment_pending: AlertCircle,
};

export default function ActionDashboard() {
  const { locale } = useLocale();
  const isAr = locale === 'ar';
  const { showToast } = useToast();
  const router = useRouter();

  const [actionData, setActionData] = useState<ActionCenterData | null>(null);
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [actionRes, statsRes] = await Promise.all([
          fetch('/api/dashboard/action-center'),
          fetch('/api/dashboard/summary'),
        ]);

        if (!actionRes.ok) {
          const error = await actionRes.json();
          throw new Error(error.message || 'Failed to load action center');
        }

        if (!statsRes.ok) {
          const error = await statsRes.json();
          throw new Error(error.message || 'Failed to load stats');
        }

        const actions = await actionRes.json();
        const stats = await statsRes.json();

        setActionData(actions);
        setStatsData(stats);
      } catch (error: any) {
        showToast('error', error.message || (isAr ? 'تعذر تحميل لوحة التحكم' : 'Failed to load dashboard'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAr, showToast]);

  if (loading || !actionData || !statsData) {
    return (
      <div className="flex items-center justify-center py-20 text-zinc-500">
        {isAr ? 'جاري التحميل...' : 'Loading...'}
      </div>
    );
  }

  const handleActionClick = (link: string) => {
    router.push(`/${locale}${link}`);
  };

  const getSummaryVariant = (): 'success' | 'warning' | 'info' => {
    if (actionData.totalPendingActions === 0) return 'success';
    if (actionData.highPriorityCount > 0) return 'warning';
    return 'info';
  };

  const getSummaryIcon = () => {
    if (actionData.totalPendingActions === 0) return CheckCircle2;
    if (actionData.highPriorityCount > 0) return AlertCircle;
    return Info;
  };

  return (
    <div className="space-y-6">
      {/* Academy Hero Banner for Academy Managers */}
      {actionData.role === 'academy_manager' && statsData.academy && (
        <div className="relative -mx-4 -mt-4 sm:-mx-6 lg:-mx-8 overflow-hidden">
          {/* Background Image */}
          <div className="relative h-64 sm:h-72 md:h-80">
            {statsData.academy.logo_url ? (
              <img
                src={statsData.academy.logo_url}
                alt={statsData.academy.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-amber-500 to-yellow-400" />
            )}
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />
            
            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
              <div className="max-w-3xl">
                {/* Status Badge */}
                <div className="mb-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
                      statsData.academy.is_active
                        ? 'bg-emerald-500/90 text-white'
                        : 'bg-red-500/90 text-white'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${statsData.academy.is_active ? 'bg-white animate-pulse' : 'bg-white/60'}`} />
                    {statsData.academy.is_active ? (isAr ? 'نشط' : 'Active') : (isAr ? 'غير نشط' : 'Inactive')}
                  </span>
                </div>
                
                {/* Academy Name */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
                  {isAr ? statsData.academy.name_ar || statsData.academy.name : statsData.academy.name}
                </h1>
                
                {/* City */}
                {statsData.academy.city && (
                  <p className="text-lg sm:text-xl text-white/90 flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    {statsData.academy.city}
                  </p>
                )}
                
                {/* Quick Stats Row */}
                {statsData.stats && (
                  <div className="flex flex-wrap gap-4 mt-4">
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                      <Users className="w-5 h-5 text-white/80" />
                      <div>
                        <p className="text-2xl font-bold text-white">{statsData.stats.players}</p>
                        <p className="text-xs text-white/70">{isAr ? 'لاعب' : 'Players'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                      <Shield className="w-5 h-5 text-white/80" />
                      <div>
                        <p className="text-2xl font-bold text-white">{statsData.stats.coaches}</p>
                        <p className="text-xs text-white/70">{isAr ? 'مدرب' : 'Coaches'}</p>
                      </div>
                    </div>
                    {statsData.stats.programs !== undefined && (
                      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                        <ClipboardList className="w-5 h-5 text-white/80" />
                        <div>
                          <p className="text-2xl font-bold text-white">{statsData.stats.programs}</p>
                          <p className="text-xs text-white/70">{isAr ? 'برنامج' : 'Programs'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
          {isAr ? 'مركز العمليات' : 'Operations Center'}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          {isAr
            ? actionData.role === 'admin'
              ? 'نظرة شاملة على النظام والإجراءات المطلوبة'
              : 'نظرة شاملة على أكاديميتك والإجراءات المطلوبة'
            : actionData.role === 'admin'
            ? 'System-wide overview and actionable insights'
            : 'Your academy overview and actionable insights'}
        </p>
      </div>

      {/* Summary Banner */}
      <SummaryBanner
        message={isAr ? actionData.summary.messageAr : actionData.summary.message}
        variant={getSummaryVariant()}
        icon={getSummaryIcon()}
      />

      {/* Action Center - Primary Section */}
      <DashboardWidget
        title={isAr ? 'مركز الإجراءات' : 'Action Center'}
        action={
          actionData.actions.length > 0
            ? {
                label: isAr ? 'تحديث' : 'Refresh',
                onClick: () => window.location.reload(),
              }
            : undefined
        }
      >
        {actionData.actions.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title={isAr ? 'كل شيء على ما يرام!' : 'All Clear!'}
            description={
              isAr
                ? 'لا توجد إجراءات معلقة في الوقت الحالي. استمر في العمل الرائع!'
                : 'No pending actions at the moment. Keep up the great work!'
            }
          />
        ) : (
          <div className="space-y-3">
            {actionData.actions.map((action) => {
              const Icon = ACTION_ICONS[action.type];
              const translation = ACTION_TRANSLATIONS[action.type];

              return (
                <ActionItemCard
                  key={action.id}
                  title={translation.en}
                  titleAr={translation.ar}
                  count={action.count}
                  priority={action.priority}
                  icon={Icon}
                  onClick={() => handleActionClick(action.link)}
                  overdueCount={action.overdueCount}
                  dueTodayCount={action.dueTodayCount}
                  isAr={isAr}
                />
              );
            })}
          </div>
        )}
      </DashboardWidget>

      {/* Quick Stats Section */}
      {statsData.stats && (
        <DashboardWidget title={isAr ? 'إحصائيات سريعة' : 'Quick Stats'}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {actionData.role === 'admin' && (
              <>
                <QuickStat
                  label={isAr ? 'الأكاديميات' : 'Academies'}
                  value={statsData.stats.academies || 0}
                  icon={Building2}
                  onClick={() => handleActionClick('/dashboard/academies')}
                />
                <QuickStat
                  label={isAr ? 'إجمالي المستخدمين' : 'Total Users'}
                  value={statsData.stats.users || 0}
                  icon={Users}
                  onClick={() => handleActionClick('/dashboard/users')}
                />
              </>
            )}
            <QuickStat
              label={isAr ? 'اللاعبون' : 'Players'}
              value={statsData.stats.players}
              icon={Users}
              onClick={() => handleActionClick('/dashboard/users?role=player')}
            />
            <QuickStat
              label={isAr ? 'المدربون' : 'Coaches'}
              value={statsData.stats.coaches}
              icon={Shield}
              onClick={() => handleActionClick('/dashboard/users?role=coach')}
            />
            {statsData.stats.programs !== undefined && (
              <QuickStat
                label={isAr ? 'البرامج' : 'Programs'}
                value={statsData.stats.programs}
                icon={Building2}
                onClick={() => handleActionClick('/dashboard/programs')}
              />
            )}
          </div>
        </DashboardWidget>
      )}
    </div>
  );
}
