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
  MessageCircle,
  Settings,
  Layers,
  Activity,
  Bell,
  Mail,
  ChevronRight,
  CreditCard,
  TrendingUp,
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
import type { LucideIcon } from 'lucide-react';

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

  // Time-based greeting
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return isAr ? 'صباح الخير' : 'Good Morning';
    if (h < 17) return isAr ? 'مساء الخير' : 'Good Afternoon';
    return isAr ? 'مساء الخير' : 'Good Evening';
  };

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
      <div className="space-y-4 sm:space-y-6 animate-pulse">
        <div className="h-7 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
        <div className="h-5 w-72 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-lg" />
        <div className="h-14 bg-zinc-200/40 dark:bg-zinc-800/40 rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[0,1,2,3].map(i => <div key={i} className="h-20 bg-zinc-200/40 dark:bg-zinc-800/40 rounded-xl" />)}
        </div>
        <div className="h-48 bg-zinc-200/30 dark:bg-zinc-800/30 rounded-2xl" />
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
    <div className="space-y-4 sm:space-y-6">
      {/* Academy Hero Banner for Academy Managers */}
      {actionData.role === 'academy_manager' && statsData.academy && (
        <div className="relative -mx-3 -mt-4 sm:-mx-6 overflow-hidden">
          {/* Background Image */}
          <div className="relative h-48 sm:h-64 md:h-72">
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
            
            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 md:p-8">
              <div className="max-w-3xl">
                {/* Status Badge */}
                <div className="mb-2 sm:mb-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold backdrop-blur-sm ${
                      statsData.academy.is_active
                        ? 'bg-emerald-500/90 text-white'
                        : 'bg-red-500/90 text-white'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${statsData.academy.is_active ? 'bg-white animate-pulse' : 'bg-white/60'}`} />
                    {statsData.academy.is_active ? (isAr ? 'نشط' : 'Active') : (isAr ? 'غير نشط' : 'Inactive')}
                  </span>
                </div>
                
                {/* Academy Name */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2 drop-shadow-lg">
                  {isAr ? statsData.academy.name_ar || statsData.academy.name : statsData.academy.name}
                </h1>
                
                {/* City */}
                {statsData.academy.city && (
                  <p className="text-sm sm:text-base text-white/90 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" />
                    {statsData.academy.city}
                  </p>
                )}
                
                {/* Quick Stats Row */}
                {statsData.stats && (
                  <div className="flex flex-wrap gap-2 sm:gap-3 mt-3 sm:mt-4">
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5 sm:px-4 sm:py-2">
                      <Users className="w-4 h-4 text-white/80" />
                      <div>
                        <p className="text-lg sm:text-xl font-bold text-white leading-tight">{statsData.stats.players}</p>
                        <p className="text-[10px] text-white/70">{isAr ? 'لاعب' : 'Players'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5 sm:px-4 sm:py-2">
                      <Shield className="w-4 h-4 text-white/80" />
                      <div>
                        <p className="text-lg sm:text-xl font-bold text-white leading-tight">{statsData.stats.coaches}</p>
                        <p className="text-[10px] text-white/70">{isAr ? 'مدرب' : 'Coaches'}</p>
                      </div>
                    </div>
                    {statsData.stats.programs !== undefined && (
                      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5 sm:px-4 sm:py-2">
                        <ClipboardList className="w-4 h-4 text-white/80" />
                        <div>
                          <p className="text-lg sm:text-xl font-bold text-white leading-tight">{statsData.stats.programs}</p>
                          <p className="text-[10px] text-white/70">{isAr ? 'برنامج' : 'Programs'}</p>
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

      {/* Greeting Header */}
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white">
          {getGreeting()} 👋
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 sm:mt-1">
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

      {/* Quick Stats Section - BEFORE action center for visibility */}
      {statsData.stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
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
      )}

      {/* Action Center */}
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
          <div className="grid gap-2.5 sm:gap-3 sm:grid-cols-2">
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

      {/* Pending Items Highlights */}
      {statsData.stats && (statsData.stats.pendingHealthTests > 0 || statsData.stats.pendingMedalRequests > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          {statsData.stats.pendingHealthTests > 0 && (
            <button
              onClick={() => handleActionClick('/dashboard/health-tests')}
              className="flex items-center gap-3 p-3 sm:p-4 rounded-xl border border-amber-200/80 dark:border-amber-800/40 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 hover:shadow-md transition-all group active:scale-[0.99]"
            >
              <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Activity className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  {isAr ? 'فحوصات معلقة' : 'Pending Health Tests'}
                </p>
                <p className="text-xl sm:text-2xl font-bold text-amber-700 dark:text-amber-300">
                  {statsData.stats.pendingHealthTests}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
            </button>
          )}
          {statsData.stats.pendingMedalRequests > 0 && (
            <button
              onClick={() => handleActionClick('/dashboard/medal-requests')}
              className="flex items-center gap-3 p-3 sm:p-4 rounded-xl border border-purple-200/80 dark:border-purple-800/40 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 hover:shadow-md transition-all group active:scale-[0.99]"
            >
              <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Award className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                  {isAr ? 'طلبات ميداليات معلقة' : 'Pending Medal Requests'}
                </p>
                <p className="text-xl sm:text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {statsData.stats.pendingMedalRequests}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-0.5 transition-transform rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
            </button>
          )}
        </div>
      )}

      {/* Quick Management - Admin Tools Grid */}
      <DashboardWidget title={isAr ? 'الإدارة السريعة' : 'Quick Management'}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-2.5">
          {([
            ...(actionData.role === 'admin' ? [
              { icon: Building2, label: isAr ? 'الأكاديميات' : 'Academies', labelSub: isAr ? 'إدارة الأكاديميات' : 'Manage academies', route: '/dashboard/academies', color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50 dark:bg-blue-950/20' },
              { icon: Users, label: isAr ? 'المستخدمين' : 'Users', labelSub: isAr ? 'إدارة المستخدمين' : 'Manage users', route: '/dashboard/users', color: 'from-violet-500 to-purple-500', bg: 'bg-violet-50 dark:bg-violet-950/20' },
              { icon: Shield, label: isAr ? 'الأدوار' : 'Roles', labelSub: isAr ? 'الأدوار والصلاحيات' : 'Roles & permissions', route: '/dashboard/roles', color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
              { icon: Layers, label: isAr ? 'البرامج' : 'Programs', labelSub: isAr ? 'إدارة البرامج' : 'Manage programs', route: '/dashboard/programs', color: 'from-orange-500 to-amber-500', bg: 'bg-orange-50 dark:bg-orange-950/20' },
            ] : []),
            { icon: Activity, label: isAr ? 'الفحوصات' : 'Health Tests', labelSub: isAr ? 'الفحوصات الصحية' : 'Health assessments', route: '/dashboard/health-tests', color: 'from-rose-500 to-pink-500', bg: 'bg-rose-50 dark:bg-rose-950/20' },
            { icon: Award, label: isAr ? 'الميداليات' : 'Medals', labelSub: isAr ? 'طلبات الميداليات' : 'Medal requests', route: '/dashboard/medal-requests', color: 'from-amber-500 to-yellow-500', bg: 'bg-amber-50 dark:bg-amber-950/20' },
            { icon: MessageCircle, label: isAr ? 'الرسائل' : 'Messages', labelSub: isAr ? 'رسائل النظام' : 'System messages', route: '/dashboard/messages', color: 'from-sky-500 to-blue-500', bg: 'bg-sky-50 dark:bg-sky-950/20' },
            { icon: Mail, label: isAr ? 'واتساب' : 'WhatsApp', labelSub: isAr ? 'رسائل واتساب' : 'WhatsApp messages', route: '/dashboard/whatsapp', color: 'from-green-500 to-emerald-500', bg: 'bg-green-50 dark:bg-green-950/20' },
            { icon: Bell, label: isAr ? 'الإشعارات' : 'Notifications', labelSub: isAr ? 'إدارة الإشعارات' : 'Manage alerts', route: '/dashboard/notifications', color: 'from-indigo-500 to-violet-500', bg: 'bg-indigo-50 dark:bg-indigo-950/20' },
            { icon: CreditCard, label: isAr ? 'بطاقة اللاعب' : 'Player Card', labelSub: isAr ? 'بطاقات اللاعبين' : 'Player cards', route: '/dashboard/users', color: 'from-teal-500 to-cyan-500', bg: 'bg-teal-50 dark:bg-teal-950/20' },
            { icon: Settings, label: isAr ? 'الإعدادات' : 'Settings', labelSub: isAr ? 'إعدادات النظام' : 'System settings', route: '/dashboard/settings', color: 'from-zinc-500 to-slate-500', bg: 'bg-zinc-100 dark:bg-zinc-800/40' },
          ] as { icon: LucideIcon; label: string; labelSub: string; route: string; color: string; bg: string }[]).map((item) => (
            <button
              key={item.route}
              onClick={() => handleActionClick(item.route)}
              className={`group flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl border border-transparent ${item.bg} hover:shadow-md transition-all active:scale-[0.97]`}
            >
              <div className={`h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all`}>
                <item.icon className="h-5 w-5" />
              </div>
              <div className="text-center">
                <p className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200 leading-tight">
                  {item.label}
                </p>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-500 mt-0.5 hidden sm:block">
                  {item.labelSub}
                </p>
              </div>
            </button>
          ))}
        </div>
      </DashboardWidget>

      {/* System Overview - Admin Only */}
      {actionData.role === 'admin' && statsData.stats && (
        <DashboardWidget title={isAr ? 'نظرة عامة على النظام' : 'System Overview'}>
          <div className="grid grid-cols-3 gap-px bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden">
            <div className="bg-white dark:bg-zinc-900 p-3 sm:p-4 flex flex-col items-center text-center">
              <TrendingUp className="h-5 w-5 text-emerald-500 mb-1.5" />
              <p className="text-lg sm:text-2xl font-bold text-zinc-900 dark:text-white">{statsData.stats.academies || 0}</p>
              <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400">{isAr ? 'أكاديمية' : 'Academies'}</p>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-3 sm:p-4 flex flex-col items-center text-center">
              <Users className="h-5 w-5 text-blue-500 mb-1.5" />
              <p className="text-lg sm:text-2xl font-bold text-zinc-900 dark:text-white">{statsData.stats.users || 0}</p>
              <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400">{isAr ? 'مستخدم' : 'Users'}</p>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-3 sm:p-4 flex flex-col items-center text-center">
              <Shield className="h-5 w-5 text-orange-500 mb-1.5" />
              <p className="text-lg sm:text-2xl font-bold text-zinc-900 dark:text-white">{statsData.stats.coaches}</p>
              <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400">{isAr ? 'مدرب' : 'Coaches'}</p>
            </div>
          </div>
        </DashboardWidget>
      )}
    </div>
  );
}
