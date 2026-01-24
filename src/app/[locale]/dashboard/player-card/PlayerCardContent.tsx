'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, IdCard, Medal, Trophy, Printer } from 'lucide-react';
import { useRouter } from 'next/navigation';
import useLocale from '@/hooks/useLocale';
import { useToast } from '@/components/ToastProvider';

interface ProfileUser {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string | null;
  academy_name?: string | null;
  academy_name_ar?: string | null;
}

interface PlayerProfileData {
  sport?: string | null;
  position?: string | null;
  bio?: string | null;
  goals?: string | null;
}

interface AssignmentData {
  program_id: string;
  program_name: string;
  program_name_ar?: string | null;
  age_group_id: string;
  age_group_name: string;
  age_group_name_ar?: string | null;
  min_age?: number | null;
  max_age?: number | null;
  assigned_at?: string | null;
}

interface ProgramLevel {
  id: string;
  name: string;
  name_ar?: string | null;
  image_url?: string | null;
  level_order: number;
  min_sessions: number;
  min_points: number;
  is_active: boolean;
}

interface AttendanceRecord {
  attendance_date: string;
  present: boolean;
  score?: number | null;
  notes?: string | null;
}

interface ProfileResponse {
  user: ProfileUser;
  profile?: PlayerProfileData | null;
  profileComplete: boolean;
  assignment?: AssignmentData | null;
  program_levels?: ProgramLevel[];
  attendance?: AttendanceRecord[];
}

interface PlayerCardContentProps {
  userId?: string;
}

export default function PlayerCardContent({ userId }: PlayerCardContentProps) {
  const { locale } = useLocale();
  const isAr = locale === 'ar';
  const router = useRouter();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ProfileResponse | null>(null);

  const endpoint = useMemo(() => {
    return userId ? `/api/player-profile/${userId}` : '/api/player-profile';
  }, [userId]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch(endpoint);
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.message || 'Failed to load profile');
        }
        setData(payload);
      } catch (error: any) {
        showToast('error', error.message || (isAr ? 'تعذر تحميل البطاقة' : 'Failed to load card'));
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [endpoint, isAr, showToast]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-20 text-zinc-500">
        {isAr ? 'جاري التحميل...' : 'Loading...'}
      </div>
    );
  }

  const fullName = `${data.user.first_name} ${data.user.last_name}`.trim();
  const academyName = isAr
    ? data.user.academy_name_ar || data.user.academy_name
    : data.user.academy_name || data.user.academy_name_ar;
  const assignment = data.assignment;
  const programLevels = data.program_levels || [];
  const attendance = data.attendance || [];
  const sessionsCompleted = attendance.filter((record) => record.present).length;
  const pointsTotal = attendance.reduce((sum, record) => sum + (record.score || 0), 0);
  const activeLevels = programLevels.filter((level) => level.is_active);
  const sortedLevels = [...activeLevels].sort((a, b) => a.level_order - b.level_order);
  const currentLevel = sortedLevels.reduce((acc, level) => {
    if (sessionsCompleted >= level.min_sessions && pointsTotal >= level.min_points) {
      return level;
    }
    return acc;
  }, sortedLevels[0] || null);

  const rating = Math.min(99, Math.max(1, Math.round(pointsTotal || 1)));

  return (
    <>
      <style jsx global>{`
        @media print {
          @page {
            size: auto;
            margin: 0;
          }
          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background: white !important;
          }
          body * {
            visibility: hidden !important;
          }
          #player-card-print,
          #player-card-print * {
            visibility: visible !important;
          }
          #player-card-print {
            position: absolute !important;
            left: 50% !important;
            top: 0 !important;
            transform: translateX(-50%) !important;
            width: 100% !important;
            max-width: 42rem !important;
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box !important;
            min-height: auto !important;
          }
          #player-card-print > div {
            min-height: auto !important;
          }
        }
      `}</style>
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <div className="flex items-center justify-between print:hidden">
          <button
            type="button"
            onClick={() => {
              if (userId) {
                router.push(`/${locale}/dashboard/players/${userId}`);
                return;
              }
              router.push(`/${locale}/dashboard/profile`);
            }}
            className="h-10 w-10 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
          >
            {isAr ? <ArrowRight className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
          </button>
          <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-200">
            <IdCard className="h-5 w-5" />
            <span className="text-sm font-semibold">
              {isAr ? 'بطاقة اللاعب' : 'Player Card'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 text-sm font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
          >
            <Printer className="h-4 w-4" />
            {isAr ? 'طباعة' : 'Print'}
          </button>
        </div>

        <div id="player-card-print" className="relative overflow-hidden rounded-[36px] border border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-[#f6d365] via-[#fda085] to-[#f6d365] p-1 shadow-2xl">
          <div className="relative overflow-hidden rounded-[32px] bg-zinc-900/90 text-white min-h-[420px]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.35),_rgba(255,255,255,0))]" />
            <div className="absolute -top-24 right-0 h-64 w-64 rounded-full bg-amber-400/20 blur-3xl" />
            <div className="absolute -bottom-24 left-0 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl" />

            <div className="relative z-10 grid gap-6 p-8 md:grid-cols-[1fr_260px]">
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-black/30 px-3 py-3 text-center">
                  <p className="text-[10px] uppercase tracking-widest text-white/70">{isAr ? 'التقييم' : 'OVR'}</p>
                  <p className="text-3xl font-bold text-white">{rating}</p>
                </div>
                <div className="rounded-2xl bg-black/25 px-3 py-3 text-center">
                  <p className="text-[10px] uppercase tracking-widest text-white/70">{isAr ? 'المستوى' : 'Level'}</p>
                  <p className="text-2xl font-semibold text-white">{currentLevel?.level_order || 0}</p>
                </div>
                <div className="rounded-2xl bg-black/25 px-3 py-3 text-center">
                  <p className="text-[10px] uppercase tracking-widest text-white/70">{isAr ? 'الجلسات' : 'Sessions'}</p>
                  <p className="text-2xl font-semibold text-white">{sessionsCompleted}</p>
                </div>
              </div>

              <div>
                <p className="text-2xl md:text-3xl font-extrabold drop-shadow">{fullName}</p>
                <p className="text-xs uppercase tracking-[0.35em] text-white/80">
                  {(data.profile?.sport || (isAr ? 'رياضة' : 'Sport')).toString()}
                </p>
                <p className="mt-2 text-sm text-white/80">
                  {academyName || (isAr ? 'أكاديمية غير محددة' : 'No academy')}
                </p>
                {assignment && (
                  <p className="text-sm text-white/80">
                    {isAr ? assignment.program_name_ar || assignment.program_name : assignment.program_name}
                    {' · '}
                    {isAr ? assignment.age_group_name_ar || assignment.age_group_name : assignment.age_group_name}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-white/90">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
                  <Trophy className="h-3.5 w-3.5" />
                  {isAr ? 'نقاط' : 'Points'}: {pointsTotal}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
                  <Medal className="h-3.5 w-3.5" />
                  {isAr ? 'جلسات' : 'Sessions'}: {sessionsCompleted}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
                  {isAr ? 'المركز' : 'Position'}: {data.profile?.position || '-'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-end">
              <div className="relative h-52 w-52 md:h-64 md:w-64 rounded-[32px] border border-white/30 bg-white/10 backdrop-blur shadow-2xl overflow-hidden">
                {data.user.avatar_url ? (
                  <img src={data.user.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-5xl font-bold text-white/90">
                    {data.user.first_name?.charAt(0)}{data.user.last_name?.charAt(0)}
                  </div>
                )}
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
