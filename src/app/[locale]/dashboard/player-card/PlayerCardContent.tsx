'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, IdCard, Printer } from 'lucide-react';
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

interface HealthTestData {
  id: string;
  status: string;
  speed_score?: number | null;
  agility_score?: number | null;
  power_score?: number | null;
  balance_score?: number | null;
  reaction_score?: number | null;
  coordination_score?: number | null;
  flexibility_score?: number | null;
}

interface ProfileResponse {
  user: ProfileUser;
  profile?: PlayerProfileData | null;
  profileComplete: boolean;
  assignment?: AssignmentData | null;
  program_levels?: ProgramLevel[];
  attendance?: AttendanceRecord[];
  latestTest?: HealthTestData | null;
}

interface PlayerCardContentProps {
  userId?: string;
}

// Circular Progress Component
const CircularProgress = ({ value, max, label, size = 80 }: { value: number; max: number; label: string; size?: number }) => {
  const percentage = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            className="text-zinc-200 dark:text-zinc-700"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="text-orange-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-zinc-900 dark:text-white">{percentage}%</span>
        </div>
      </div>
      <p className="mt-2 text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{label}</p>
    </div>
  );
};

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
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  const fullName = `${data.user.first_name} ${data.user.last_name}`.trim();
  const assignment = data.assignment;
  const programLevels = data.program_levels || [];
  const attendance = data.attendance || [];
  const sessionsCompleted = attendance.filter((record) => record.present).length;
  const pointsTotal = attendance.reduce((sum, record) => sum + (record.score || 0), 0);
  const activeLevels = programLevels.filter((level) => level.is_active);
  const sortedLevels = [...activeLevels].sort((a, b) => a.level_order - b.level_order);
  
  // Find current level based on progress
  const currentLevel = sortedLevels.reduce((acc, level) => {
    if (sessionsCompleted >= level.min_sessions && pointsTotal >= level.min_points) {
      return level;
    }
    return acc;
  }, sortedLevels[0] || null);

  // Calculate progress for current level
  const currentLevelMinSessions = currentLevel?.min_sessions || 32;
  const currentLevelMinPoints = currentLevel?.min_points || 400;
  const sessionProgress = Math.round((sessionsCompleted / currentLevelMinSessions) * 100);
  const pointProgress = Math.round((pointsTotal / currentLevelMinPoints) * 100);

  // Calculate NA Score from health tests
  const latestTest = data.latestTest;
  const naScores = latestTest && latestTest.status === 'completed' ? [
    latestTest.speed_score,
    latestTest.agility_score,
    latestTest.power_score,
    latestTest.balance_score,
    latestTest.reaction_score,
    latestTest.coordination_score,
    latestTest.flexibility_score,
  ].filter((s): s is number => s !== null && s !== undefined) : [];
  
  const latestNaScore = naScores.length > 0 ? naScores[naScores.length - 1] : 0;
  const averageNaScore = naScores.length > 0 ? Math.round(naScores.reduce((a, b) => a + b, 0) / naScores.length) : 0;

  const programName = assignment 
    ? (isAr ? assignment.program_name_ar || assignment.program_name : assignment.program_name)
    : (isAr ? 'لا يوجد برنامج' : 'No Program');
  
  const ageGroupName = assignment
    ? (isAr ? assignment.age_group_name_ar || assignment.age_group_name : assignment.age_group_name)
    : '';

  return (
    <>
      <style jsx global>{`
        @media print {
          @page { size: auto; margin: 0; }
          html, body { margin: 0 !important; padding: 0 !important; }
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body * { visibility: hidden !important; }
          #player-card-print, #player-card-print * { visibility: visible !important; }
          #player-card-print { position: absolute !important; left: 50% !important; top: 0 !important; transform: translateX(-50%) !important; width: 100% !important; max-width: 400px !important; }
        }
      `}</style>

      <div className="mx-auto w-full max-w-[400px] space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between print:hidden">
          <button
            type="button"
            onClick={() => router.back()}
            className="h-10 w-10 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
          >
            {isAr ? <ArrowRight className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
          </button>
          <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-200">
            <IdCard className="h-5 w-5" />
            <span className="text-sm font-semibold">{isAr ? 'بطاقة اللاعب' : 'Player Card'}</span>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="h-10 w-10 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
          >
            <Printer className="h-4 w-4" />
          </button>
        </div>

        {/* Main Card */}
        <div id="player-card-print" className="rounded-3xl border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xl">
          
          {/* Program Header */}
          <div className="px-5 pt-5 pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-zinc-400">{isAr ? 'البرنامج' : 'Program'}</p>
                <p className="text-xl font-bold text-zinc-900 dark:text-white mt-1">
                  {programName}{ageGroupName ? ` - ${ageGroupName}` : ''}
                </p>
              </div>
              <span className="rounded-full bg-orange-100 dark:bg-orange-900/30 px-4 py-1.5 text-xs font-semibold text-orange-700 dark:text-orange-400">
                {isAr ? 'نشط' : 'Current'}
              </span>
            </div>
          </div>

          {/* Player Info Section */}
          <div className="px-5 py-5">
            <div className="flex gap-4">
              {/* Avatar */}
              <div className="h-24 w-24 rounded-2xl overflow-hidden bg-gradient-to-br from-rose-200 to-rose-300 dark:from-rose-400 dark:to-rose-500 flex-shrink-0 shadow-lg">
                {data.user.avatar_url ? (
                  <img src={data.user.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-white">
                    {data.user.first_name?.charAt(0)}{data.user.last_name?.charAt(0)}
                  </div>
                )}
              </div>
              
              {/* Player Stats */}
              <div className="flex-1 space-y-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-zinc-900 dark:text-white">{pointsTotal || 0}</span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{fullName}</p>
                <div className="flex items-center gap-1 text-sm text-zinc-600 dark:text-zinc-300">
                  <span>⚡</span>
                  <span className="font-medium">{isAr ? 'المستوى' : 'Level'} {currentLevel?.level_order || 1}</span>
                  <span className="text-zinc-400 dark:text-zinc-500">·</span>
                  <span className="text-zinc-500 dark:text-zinc-400">
                    {isAr ? (currentLevel?.name_ar || currentLevel?.name || 'المستوى 1') : (currentLevel?.name || 'Level 1')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Circular Progress Section */}
          <div className="px-5 py-4 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex justify-center gap-12">
              <CircularProgress 
                value={sessionsCompleted} 
                max={currentLevelMinSessions} 
                label={isAr ? 'الجلسات' : 'Sessions'} 
              />
              <CircularProgress 
                value={pointsTotal} 
                max={currentLevelMinPoints} 
                label={isAr ? 'النقاط' : 'Points'} 
              />
            </div>
          </div>

          {/* Progress Bars */}
          <div className="px-5 py-4 space-y-4">
            {/* Sessions Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500 dark:text-zinc-400">{isAr ? 'تقدم الجلسات' : 'Sessions progress'}</span>
                <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                  {sessionsCompleted}/{currentLevelMinSessions} · {sessionProgress}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-500 transition-all duration-500" 
                  style={{ width: `${Math.min(sessionProgress, 100)}%` }} 
                />
              </div>
            </div>

            {/* Points Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500 dark:text-zinc-400">{isAr ? 'تقدم النقاط' : 'Points progress'}</span>
                <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                  {pointsTotal}/{currentLevelMinPoints} · {pointProgress}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-500 transition-all duration-500" 
                  style={{ width: `${Math.min(pointProgress, 100)}%` }} 
                />
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="px-5 py-4 border-t border-zinc-100 dark:border-zinc-800">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-800 px-3 py-4 text-center">
                <p className="text-[9px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium">
                  {isAr ? 'نقاط البرنامج' : 'PROGRAM'}
                </p>
                <p className="text-[9px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium">
                  {isAr ? '' : 'POINTS'}
                </p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">{pointsTotal}</p>
              </div>
              <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-800 px-3 py-4 text-center">
                <p className="text-[9px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium">
                  {isAr ? 'آخر نتيجة' : 'LATEST'}
                </p>
                <p className="text-[9px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium">
                  {isAr ? 'NA' : 'NA SCORE'}
                </p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">{latestNaScore}</p>
              </div>
              <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-800 px-3 py-4 text-center">
                <p className="text-[9px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium">
                  {isAr ? 'المعدل' : 'AVERAGE'}
                </p>
                <p className="text-[9px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium">
                  {isAr ? 'NA' : 'NA SCORE'}
                </p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">{averageNaScore}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span>{isAr ? 'البرنامج:' : 'Program:'} {programName}{ageGroupName ? ` - ${ageGroupName}` : ''}</span>
              <span>{isAr ? 'المستوى:' : 'Level:'} {currentLevel?.level_order || 1}</span>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
