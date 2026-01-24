'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bell, CheckCircle2, Clock, XCircle, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ToastProvider';
import useLocale from '@/hooks/useLocale';

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

interface HealthTestData {
  id: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requested_at?: string | null;
  scheduled_at?: string | null;
  test_date?: string | null;
  height?: string | null;
  weight?: string | null;
  blood_pressure?: string | null;
  heart_rate?: number | null;
  notes?: string | null;
  review_notes?: string | null;
  speed_score?: number | null;
  agility_score?: number | null;
  power_score?: number | null;
}

interface ProgramOption {
  id: string;
  name: string;
  name_ar?: string | null;
}

interface AgeGroupOption {
  id: string;
  name: string;
  name_ar?: string | null;
  min_age: number;
  max_age: number;
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

interface PlayerMessage {
  id: string;
  subject?: string | null;
  content: string;
  is_read: boolean;
  created_at: string;
  sender_first_name?: string | null;
  sender_last_name?: string | null;
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
  latestTest?: HealthTestData | null;
  activeRequest?: HealthTestData | null;
  assignment?: AssignmentData | null;
  program_levels?: ProgramLevel[];
  messages?: PlayerMessage[];
  attendance?: AttendanceRecord[];
}

interface PlayerProfileContentProps {
  userId?: string;
  readOnly?: boolean;
}

const formatDate = (value?: string | null, locale?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString(locale === 'ar' ? 'ar' : 'en');
};

const getChartPercent = (value?: number | null) => {
  if (value === null || value === undefined) return 0;
  const max = value <= 10 ? 10 : 100;
  return Math.min(100, Math.max(0, (value / max) * 100));
};

const RadialInsight = ({
  label,
  value,
}: {
  label: string;
  value?: number | null;
}) => {
  const percent = getChartPercent(value);
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 text-center">
      <svg width="46" height="46" className="mx-auto">
        <circle
          cx="23"
          cy="23"
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          className="text-zinc-200 dark:text-zinc-800"
          fill="transparent"
        />
        <circle
          cx="23"
          cy="23"
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          className="text-orange-500"
          fill="transparent"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          transform="rotate(-90 23 23)"
        />
        <text x="23" y="27" textAnchor="middle" className="fill-zinc-800 dark:fill-zinc-100 text-[10px] font-semibold">
          {value ?? 0}
        </text>
      </svg>
      <p className="mt-2 text-[10px] uppercase tracking-widest text-zinc-400">{label}</p>
    </div>
  );
};

export default function PlayerProfileContent({ userId, readOnly }: PlayerProfileContentProps) {
  const { locale } = useLocale();
  const isAr = locale === 'ar';
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [data, setData] = useState<ProfileResponse | null>(null);
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [ageGroups, setAgeGroups] = useState<AgeGroupOption[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [assignmentForm, setAssignmentForm] = useState({
    program_id: '',
    age_group_id: '',
  });
  const [form, setForm] = useState({
    sport: '',
    position: '',
    bio: '',
    goals: '',
  });
  const [profileFormOpen, setProfileFormOpen] = useState(false);
  const isAdminView = Boolean(userId);

  const endpoint = useMemo(() => {
    return userId ? `/api/player-profile/${userId}` : '/api/player-profile';
  }, [userId]);

  // Fetch unread notification count for players
  const fetchUnreadCount = async () => {
    try {
      const query = isAdminView && userId ? `?unread_only=true&user_id=${userId}` : '?unread_only=true';
      const response = await fetch(`/api/notifications${query}`);
      const data = await response.json();
      if (response.ok) {
        setUnreadCount(data.unread_count || 0);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(endpoint);
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || 'Failed to load profile');
      }
      setData(payload);
      setForm({
        sport: payload.profile?.sport || '',
        position: payload.profile?.position || '',
        bio: payload.profile?.bio || '',
        goals: payload.profile?.goals || '',
      });
      if (payload.assignment) {
        setAssignmentForm({
          program_id: payload.assignment.program_id,
          age_group_id: payload.assignment.age_group_id,
        });
      }
    } catch (error: any) {
      showToast('error', error.message || (isAr ? 'تعذر تحميل الملف' : 'Failed to load profile'));
    } finally {
      setLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      const params = new URLSearchParams({ limit: '100' });
      const response = await fetch(`/api/programs?${params}`);
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || 'Failed to load programs');
      }
      setPrograms(payload.programs || []);
    } catch (error: any) {
      showToast('error', error.message || (isAr ? 'تعذر تحميل البرامج' : 'Failed to load programs'));
    }
  };

  const fetchAgeGroups = async (programId: string) => {
    if (!programId) {
      setAgeGroups([]);
      return;
    }
    try {
      const response = await fetch(`/api/programs/${programId}/age-groups`);
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || 'Failed to load age groups');
      }
      setAgeGroups(payload.age_groups || []);
    } catch (error: any) {
      showToast('error', error.message || (isAr ? 'تعذر تحميل الفئات العمرية' : 'Failed to load age groups'));
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchUnreadCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  useEffect(() => {
    if (!isAdminView) return;
    fetchPrograms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdminView]);

  useEffect(() => {
    if (!isAdminView) return;
    if (assignmentForm.program_id) {
      fetchAgeGroups(assignmentForm.program_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentForm.program_id, isAdminView]);

  const handleSaveProfile = async () => {
    if (!form.sport.trim() || !form.bio.trim()) {
      showToast('error', isAr ? 'يرجى إكمال الرياضة و نبذة اللاعب' : 'Please complete sport and bio');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(userId ? `/api/player-profile/${userId}` : '/api/player-profile', {
        method: userId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || 'Failed to save profile');
      }
      setData((prev) => prev ? { ...prev, profile: payload.profile, profileComplete: payload.profileComplete } : prev);
      showToast('success', isAr ? 'تم حفظ الملف' : 'Profile saved');
    } catch (error: any) {
      showToast('error', error.message || (isAr ? 'تعذر حفظ الملف' : 'Failed to save profile'));
    } finally {
      setSaving(false);
    }
  };

  const handleRequestTest = async () => {
    try {
      setRequesting(true);
      const response = await fetch('/api/health-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: userId ? JSON.stringify({ user_id: userId }) : undefined,
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || 'Failed to request test');
      }
      showToast('success', isAr ? 'تم إرسال طلب الاختبار' : 'Test request submitted');
      await fetchProfile();
    } catch (error: any) {
      showToast('error', error.message || (isAr ? 'تعذر إرسال الطلب' : 'Failed to request test'));
    } finally {
      setRequesting(false);
    }
  };

  const handleAssignProgram = async () => {
    if (!userId) return;
    if (!assignmentForm.program_id || !assignmentForm.age_group_id) {
      showToast('error', isAr ? 'يرجى اختيار البرنامج والفئة العمرية' : 'Select program and age group');
      return;
    }

    try {
      setAssigning(true);
      const response = await fetch('/api/player-programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          program_id: assignmentForm.program_id,
          age_group_id: assignmentForm.age_group_id,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || 'Failed to assign program');
      }
      showToast('success', isAr ? 'تم تحديث البرنامج' : 'Program updated');
      await fetchProfile();
    } catch (error: any) {
      showToast('error', error.message || (isAr ? 'تعذر تحديث البرنامج' : 'Failed to update program'));
    } finally {
      setAssigning(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-20 text-zinc-500">
        {isAr ? 'جاري التحميل...' : 'Loading...'}
      </div>
    );
  }

  const userName = `${data.user.first_name} ${data.user.last_name}`.trim();
  const academyName = isAr ? data.user.academy_name_ar || data.user.academy_name : data.user.academy_name || data.user.academy_name_ar;
  const profileComplete = data.profileComplete;
  const activeRequest = data.activeRequest;
  const latestTest = data.latestTest;
  const requestStatus = activeRequest || (latestTest?.status === 'rejected' ? latestTest : null);
  const assignment = data.assignment;
  const programLevels = data.program_levels || [];
  const messages = data.messages || [];
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
  const assignmentLabel = assignment
    ? isAr
      ? `${assignment.program_name_ar || assignment.program_name} • ${assignment.age_group_name_ar || assignment.age_group_name}`
      : `${assignment.program_name} • ${assignment.age_group_name}`
    : null;

  return (
    <div className="mx-auto w-full max-w-md space-y-5">
      <div className="rounded-[28px] border border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-zinc-100 via-white to-zinc-200 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900 p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{userName}</p>
            <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
              {academyName || (isAr ? 'أكاديمية غير محددة' : 'No academy')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/${locale}/dashboard/notifications${isAdminView && userId ? `?user_id=${userId}` : ''}`
                )
              }
              className="relative h-9 w-9 rounded-full border border-zinc-300/50 dark:border-white/10 bg-white/80 dark:bg-zinc-900/80 flex items-center justify-center"
            >
              <Bell className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
            <div className="h-10 w-10 overflow-hidden rounded-full border border-white/50 bg-zinc-200 dark:bg-zinc-800">
              {data.user.avatar_url ? (
                <img src={data.user.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                  {data.user.first_name?.charAt(0)}{data.user.last_name?.charAt(0)}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-300/40 dark:border-white/10 bg-zinc-100/80 dark:bg-zinc-900/70">
          <div className="aspect-[4/3] w-full bg-gradient-to-br from-zinc-300 via-zinc-200 to-zinc-100 dark:from-zinc-800 dark:via-zinc-900 dark:to-zinc-950">
            {data.user.avatar_url && (
              <img src={data.user.avatar_url} alt="" className="h-full w-full object-cover" />
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center">
          <span className="rounded-full border border-zinc-300/60 bg-white/90 px-4 py-1 text-xs font-semibold uppercase text-zinc-700">
            {(data.profile?.sport || (isAr ? 'رياضة غير محددة' : 'Undefined sport')).toString()}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl bg-zinc-900 text-white py-3">
            <p className="text-[10px] uppercase tracking-widest text-zinc-400">{isAr ? 'نقاط' : 'Points'}</p>
            <p className="text-lg font-semibold">{pointsTotal}</p>
          </div>
          <div className="rounded-xl bg-zinc-900 text-white py-3">
            <p className="text-[10px] uppercase tracking-widest text-zinc-400">{isAr ? 'جلسات' : 'Sessions'}</p>
            <p className="text-lg font-semibold">{sessionsCompleted}</p>
          </div>
          <div className="rounded-xl bg-zinc-900 text-white py-3">
            <p className="text-[10px] uppercase tracking-widest text-zinc-400">{isAr ? 'مستوى' : 'Level'}</p>
            <p className="text-lg font-semibold">{currentLevel?.level_order || 0}</p>
          </div>
        </div>
      </div>

      {!readOnly && !profileComplete && (
        <div className="rounded-2xl border border-orange-200 bg-orange-50/60 p-4 text-sm text-orange-800 dark:border-orange-900/40 dark:bg-orange-950/40 dark:text-orange-200">
          {isAr ? 'يرجى إكمال الملف الشخصي لطلب الاختبار البدني.' : 'Complete your profile to request the physical test.'}
        </div>
      )}

      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-3">
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          {isAr ? 'من أنا' : 'Who I am'}
        </h3>
        <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
          {data.profile?.bio || (isAr ? 'لم يتم إضافة نبذة بعد.' : 'No bio yet.')}
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-3">
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          {isAr ? 'البرنامج' : 'Program'}
        </h3>
        {assignmentLabel ? (
          <div className="space-y-3">
            <p className="text-xs text-zinc-600 dark:text-zinc-400">{assignmentLabel}</p>
            {programLevels.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {programLevels.map((level) => (
                  <div
                    key={level.id}
                    className={`group relative overflow-hidden rounded-2xl border ${currentLevel?.id === level.id ? 'border-orange-400 shadow-lg shadow-orange-500/20' : 'border-zinc-200 dark:border-zinc-800'} bg-gradient-to-br from-white via-zinc-50 to-zinc-100 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900 shadow-sm`}
                  >
                    <div className="flex items-stretch gap-3 p-3">
                      <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-zinc-200/70 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
                        {level.image_url ? (
                          <img src={level.image_url} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-zinc-400">
                            {isAr ? 'بدون صورة' : 'No image'}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] uppercase tracking-widest text-zinc-400">
                          {isAr ? `المستوى ${level.level_order}` : `Level ${level.level_order}`}
                        </p>
                        <p className={`text-sm font-semibold truncate ${currentLevel?.id === level.id ? 'text-orange-600 dark:text-orange-400' : 'text-zinc-800 dark:text-zinc-100'}`}>
                          {isAr ? level.name_ar || level.name : level.name}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-zinc-500">
                          <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200/70 dark:border-zinc-800 px-2 py-0.5">
                            {isAr ? 'جلسات' : 'Sessions'}: {level.min_sessions}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200/70 dark:border-zinc-800 px-2 py-0.5">
                            {isAr ? 'نقاط' : 'Points'}: {level.min_points}
                          </span>
                        </div>
                        <div className="mt-3">
                          <div className="space-y-2">
                            <div>
                              <div className="flex items-center justify-between text-[10px] text-zinc-500">
                                <span>{isAr ? 'تقدم الجلسات' : 'Sessions progress'}</span>
                                <span>{sessionsCompleted}/{level.min_sessions}</span>
                              </div>
                              <div className="mt-1 h-2 w-full rounded-full bg-zinc-200/70 dark:bg-zinc-800 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${currentLevel?.id === level.id ? 'bg-orange-500' : 'bg-zinc-900'}`}
                                  style={{ width: `${level.min_sessions > 0 ? Math.min(100, (sessionsCompleted / level.min_sessions) * 100) : 0}%` }}
                                />
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center justify-between text-[10px] text-zinc-500">
                                <span>{isAr ? 'تقدم النقاط' : 'Points progress'}</span>
                                <span>{pointsTotal}/{level.min_points}</span>
                              </div>
                              <div className="mt-1 h-2 w-full rounded-full bg-zinc-200/70 dark:bg-zinc-800 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${currentLevel?.id === level.id ? 'bg-orange-500' : 'bg-zinc-900'}`}
                                  style={{ width: `${level.min_points > 0 ? Math.min(100, (pointsTotal / level.min_points) * 100) : 0}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {currentLevel?.id === level.id && (
                      <div className="absolute top-2 right-2 rounded-full bg-orange-500 text-white px-2 py-0.5 text-[10px] font-semibold">
                        {isAr ? 'المرحلة الحالية' : 'Current'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {isAr ? 'لا توجد مستويات بعد.' : 'No levels yet.'}
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {isAr ? 'لم يتم تعيين برنامج بعد.' : 'No program assigned yet.'}
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-3">
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          {isAr ? 'الاختبار البدني' : 'Physical Test'}
        </h3>
        {requestStatus ? (
          <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              {requestStatus.status === 'pending' && <Clock className="h-4 w-4 text-orange-500" />}
              {requestStatus.status === 'approved' && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
              {requestStatus.status === 'rejected' && <XCircle className="h-4 w-4 text-red-500" />}
              <span className="font-medium">
                {requestStatus.status === 'pending' && (isAr ? 'طلب قيد الانتظار' : 'Request pending')}
                {requestStatus.status === 'approved' && (isAr ? 'تم قبول الطلب' : 'Request approved')}
                {requestStatus.status === 'rejected' && (isAr ? 'تم رفض الطلب' : 'Request rejected')}
              </span>
            </div>
            <p>{isAr ? 'تاريخ الطلب:' : 'Requested:'} {formatDate(requestStatus.requested_at, locale)}</p>
            {requestStatus.scheduled_at && (
              <p>{isAr ? 'وقت الاختبار:' : 'Scheduled:'} {formatDate(requestStatus.scheduled_at, locale)}</p>
            )}
            {requestStatus.review_notes && (
              <p className="text-red-600 dark:text-red-400">{requestStatus.review_notes}</p>
            )}
          </div>
        ) : (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {isAr ? 'لا يوجد طلب نشط.' : 'No active request.'}
          </p>
        )}

        {(profileComplete && !activeRequest && (!readOnly || isAdminView)) && (
          <button
            type="button"
            onClick={handleRequestTest}
            disabled={requesting}
            className="w-full rounded-xl bg-orange-500 text-white py-2 text-sm font-semibold hover:bg-orange-600 disabled:opacity-60"
          >
            {requesting
              ? (isAr ? 'جاري الإرسال...' : 'Submitting...')
              : (isAr ? 'طلب اختبار بدني' : 'Request physical test')}
          </button>
        )}
      </div>

      {latestTest && latestTest.status === 'completed' && (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
              {isAr ? 'نتائج الاختبار' : 'Test Results'}
            </h3>
            <span className="text-xs text-zinc-500">{formatDate(latestTest.test_date || latestTest.scheduled_at, locale)}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs text-zinc-600 dark:text-zinc-400">
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3">
              <p className="text-[10px] uppercase tracking-widest text-zinc-400">{isAr ? 'طول' : 'Height'}</p>
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{latestTest.height || '-'} cm</p>
            </div>
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3">
              <p className="text-[10px] uppercase tracking-widest text-zinc-400">{isAr ? 'وزن' : 'Weight'}</p>
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{latestTest.weight || '-'} kg</p>
            </div>
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3">
              <p className="text-[10px] uppercase tracking-widest text-zinc-400">{isAr ? 'ضغط' : 'Blood'} </p>
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{latestTest.blood_pressure || '-'}</p>
            </div>
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3">
              <p className="text-[10px] uppercase tracking-widest text-zinc-400">{isAr ? 'نبض' : 'Heart'} </p>
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{latestTest.heart_rate || '-'} bpm</p>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 mb-3">
              {isAr ? 'مؤشرات' : 'Insight'}
            </p>
            <div className="grid grid-cols-3 gap-2">
              <RadialInsight
                label={isAr ? 'السرعة' : 'Speed'}
                value={latestTest.speed_score}
              />
              <RadialInsight
                label={isAr ? 'الرشاقة' : 'Agility'}
                value={latestTest.agility_score}
              />
              <RadialInsight
                label={isAr ? 'القوة' : 'Power'}
                value={latestTest.power_score}
              />
            </div>
          </div>

          {latestTest.notes && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{latestTest.notes}</p>
          )}
        </div>
      )}


      {(!readOnly || isAdminView) && (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          <button
            type="button"
            onClick={() => setProfileFormOpen((prev) => !prev)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-zinc-800 dark:text-zinc-100"
          >
            <span>{isAr ? 'تحديث الملف الشخصي' : 'Update profile'}</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${profileFormOpen ? 'rotate-180' : ''}`} />
          </button>
          {profileFormOpen && (
            <div className="px-4 pb-4 space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    {isAr ? 'الرياضة' : 'Sport'}
                  </label>
                  <input
                    value={form.sport}
                    onChange={(event) => setForm((prev) => ({ ...prev, sport: event.target.value }))}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm text-zinc-800 dark:text-zinc-100"
                    placeholder={isAr ? 'مثال: كرة القدم' : 'e.g. Football'}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    {isAr ? 'المركز' : 'Position'}
                  </label>
                  <input
                    value={form.position}
                    onChange={(event) => setForm((prev) => ({ ...prev, position: event.target.value }))}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm text-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    {isAr ? 'نبذة اللاعب' : 'Player bio'}
                  </label>
                  <textarea
                    value={form.bio}
                    onChange={(event) => setForm((prev) => ({ ...prev, bio: event.target.value }))}
                    rows={3}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm text-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    {isAr ? 'الأهداف' : 'Goals'}
                  </label>
                  <textarea
                    value={form.goals}
                    onChange={(event) => setForm((prev) => ({ ...prev, goals: event.target.value }))}
                    rows={2}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm text-zinc-800 dark:text-zinc-100"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={saving}
                className="w-full rounded-xl bg-zinc-900 text-white py-2 text-sm font-semibold hover:bg-zinc-800 disabled:opacity-60"
              >
                {saving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ الملف' : 'Save profile')}
              </button>
            </div>
          )}
        </div>
      )}

      {isAdminView && (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
            {isAr ? 'تعيين برنامج' : 'Assign program'}
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                {isAr ? 'البرنامج' : 'Program'}
              </label>
              <select
                value={assignmentForm.program_id}
                onChange={(event) =>
                  setAssignmentForm({ program_id: event.target.value, age_group_id: '' })
                }
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm text-zinc-800 dark:text-zinc-100"
              >
                <option value="">{isAr ? 'اختر البرنامج' : 'Select program'}</option>
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {isAr ? program.name_ar || program.name : program.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                {isAr ? 'الفئة العمرية' : 'Age group'}
              </label>
              <select
                value={assignmentForm.age_group_id}
                onChange={(event) =>
                  setAssignmentForm((prev) => ({ ...prev, age_group_id: event.target.value }))
                }
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm text-zinc-800 dark:text-zinc-100"
                disabled={!assignmentForm.program_id}
              >
                <option value="">{isAr ? 'اختر الفئة' : 'Select age group'}</option>
                {ageGroups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {isAr ? group.name_ar || group.name : group.name} ({group.min_age}-{group.max_age})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAssignProgram}
            disabled={assigning}
            className="w-full rounded-xl bg-emerald-600 text-white py-2 text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60"
          >
            {assigning ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ البرنامج' : 'Save assignment')}
          </button>
        </div>
      )}
    </div>
  );
}
