'use client';

import { useEffect, useState } from 'react';
import { Award, Building2, ClipboardList, Shield, Users } from 'lucide-react';
import useLocale from '@/hooks/useLocale';
import { useToast } from '@/components/ToastProvider';

interface AcademySummary {
  id: string;
  name: string;
  name_ar?: string | null;
  city?: string | null;
  logo_url?: string | null;
  is_active: boolean;
  players_count: number;
  coaches_count: number;
  programs_count: number;
}

interface DashboardSummary {
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
  academies?: AcademySummary[];
  academy?: {
    id: string;
    name: string;
    name_ar?: string | null;
    city?: string | null;
    logo_url?: string | null;
    is_active: boolean;
  } | null;
}

export default function DashboardContent() {
  const { locale } = useLocale();
  const isAr = locale === 'ar';
  const { showToast } = useToast();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/dashboard/summary');
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.message || 'Failed to load dashboard');
        }
        setData(payload);
      } catch (error: any) {
        showToast('error', error.message || (isAr ? 'تعذر تحميل لوحة التحكم' : 'Failed to load dashboard'));
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [isAr, showToast]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-20 text-zinc-500">
        {isAr ? 'جاري التحميل...' : 'Loading...'}
      </div>
    );
  }

  if (data.role === 'admin' && data.stats) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            {isAr ? 'لوحة التحكم - المدير' : 'Admin Dashboard'}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {isAr ? 'نظرة عامة مفصلة على الأكاديميات والطلبات.' : 'Detailed overview of academies and requests.'}
          </p>
        </div>

        <div className="grid gap-4 grid-cols-2 md:grid-cols-2 xl:grid-cols-3">
          <StatCard icon={Building2} label={isAr ? 'الأكاديميات' : 'Academies'} value={data.stats.academies || 0} />
          <StatCard icon={Users} label={isAr ? 'إجمالي اللاعبين' : 'Total Players'} value={data.stats.players} />
          <StatCard icon={Shield} label={isAr ? 'المدربين' : 'Coaches'} value={data.stats.coaches} />
          <StatCard icon={ClipboardList} label={isAr ? 'طلبات الفحص' : 'Health Test Requests'} value={data.stats.pendingHealthTests} />
          <StatCard icon={Award} label={isAr ? 'طلبات الميداليات' : 'Medal Requests'} value={data.stats.pendingMedalRequests} />
          <StatCard icon={Users} label={isAr ? 'إجمالي المستخدمين' : 'Total Users'} value={data.stats.users || 0} />
        </div>

        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 mb-4">
            {isAr ? 'تفاصيل الأكاديميات' : 'Academy Insights'}
          </h2>
          <div className="grid gap-3 md:grid-cols-3">
            {data.academies?.map((academy) => (
              <div key={academy.id} className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
                <div className="relative h-24">
                  {academy.logo_url ? (
                    <img src={academy.logo_url} alt="" className="absolute inset-0 h-full w-full object-cover object-center" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-amber-500 to-amber-300" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                  <div className="absolute inset-0 flex items-end justify-between px-3 pb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white drop-shadow truncate">
                        {isAr ? academy.name_ar || academy.name : academy.name}
                      </p>
                      <p className="text-[10px] text-white/80 truncate">
                        {academy.city || (isAr ? 'بدون مدينة' : 'No city')}
                      </p>
                    </div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold backdrop-blur shrink-0 ${academy.is_active ? 'bg-orange-400/90 text-white' : 'bg-white/90 text-zinc-700'}`}>
                      {academy.is_active ? (isAr ? 'نشط' : 'Active') : (isAr ? 'متوقف' : 'Inactive')}
                    </span>
                  </div>
                </div>
                <div className="p-2">
                  <div className="grid grid-cols-3 gap-1 text-[10px] text-zinc-500 dark:text-zinc-400">
                    <div className="rounded-md bg-zinc-50 dark:bg-zinc-800/60 p-1.5 text-center">
                      <p className="font-bold text-zinc-800 dark:text-zinc-100 text-sm">{academy.players_count}</p>
                      <p>{isAr ? 'لاعب' : 'Players'}</p>
                    </div>
                    <div className="rounded-md bg-zinc-50 dark:bg-zinc-800/60 p-1.5 text-center">
                      <p className="font-bold text-zinc-800 dark:text-zinc-100 text-sm">{academy.coaches_count}</p>
                      <p>{isAr ? 'مدرب' : 'Coaches'}</p>
                    </div>
                    <div className="rounded-md bg-zinc-50 dark:bg-zinc-800/60 p-1.5 text-center">
                      <p className="font-bold text-zinc-800 dark:text-zinc-100 text-sm">{academy.programs_count}</p>
                      <p>{isAr ? 'برنامج' : 'Programs'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (data.role === 'academy_manager' && data.stats) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            {isAr ? 'لوحة التحكم للأكاديمية' : 'Academy Dashboard'}
          </h1>
        </div>

        <div className="overflow-hidden rounded-[32px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl shadow-orange-500/10">
          <div className="relative h-72 md:h-80">
            {data.academy?.logo_url ? (
              <img
                src={data.academy.logo_url}
                alt=""
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-amber-500 to-amber-300" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.45),_rgba(255,255,255,0))]" />
            <div className="absolute inset-0 flex items-end">
              <div className="w-full px-6 pb-6 md:px-8 md:pb-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-white/90 text-zinc-900 flex items-center justify-center shadow-lg ring-2 ring-white/60">
                      <Building2 className="h-7 w-7" />
                    </div>
                    <div>
                      <p className="text-2xl md:text-3xl font-bold text-white drop-shadow">
                        {isAr ? data.academy?.name_ar || data.academy?.name : data.academy?.name}
                      </p>
                      <p className="text-sm text-white/90">
                        {data.academy?.city || (isAr ? 'بدون مدينة' : 'No city')}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[11px] px-3 py-1.5 rounded-full font-semibold backdrop-blur ${data.academy?.is_active ? 'bg-orange-400/90 text-white' : 'bg-white/90 text-zinc-700'}`}>
                    {data.academy?.is_active ? (isAr ? 'نشط' : 'Active') : (isAr ? 'متوقف' : 'Inactive')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 grid-cols-2 md:grid-cols-2 xl:grid-cols-3">
          <StatCard icon={Users} label={isAr ? 'اللاعبون' : 'Players'} value={data.stats.players} />
          <StatCard icon={Shield} label={isAr ? 'المدربون' : 'Coaches'} value={data.stats.coaches} />
          <StatCard icon={Building2} label={isAr ? 'البرامج' : 'Programs'} value={data.stats.programs || 0} />
          <StatCard icon={ClipboardList} label={isAr ? 'طلبات الفحص' : 'Health Test Requests'} value={data.stats.pendingHealthTests} />
          <StatCard icon={Award} label={isAr ? 'طلبات الميداليات' : 'Medal Requests'} value={data.stats.pendingMedalRequests} />
          <StatCard icon={Users} label={isAr ? 'إجمالي المستخدمين' : 'Total Users'} value={data.stats.users || 0} />
        </div>
      </div>
    );
  }

  return null;
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-black flex items-center justify-center">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
          <p className="text-2xl font-semibold text-zinc-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}
