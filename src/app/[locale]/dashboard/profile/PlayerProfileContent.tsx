'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { Bell, ChevronDown, Award, Activity, ArrowLeft, X, ChevronLeft, ChevronRight, Plus, Star, Trash2 } from 'lucide-react';
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
  speed_score?: number | null;
  agility_score?: number | null;
  power_score?: number | null;
  balance_score?: number | null;
  reaction_score?: number | null;
  coordination_score?: number | null;
  flexibility_score?: number | null;
}

interface AssignmentData {
  program_id: string;
  program_name: string;
  program_name_ar?: string | null;
  age_group_id: string;
  age_group_name: string;
  age_group_name_ar?: string | null;
  level_id?: string | null;
  level_name?: string | null;
  level_name_ar?: string | null;
  assigned_level_order?: number | null;
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

interface ProgramEnrollment {
  assignment_id: string;
  program_id: string;
  program_name: string;
  program_name_ar?: string | null;
  program_image?: string | null;
  age_group_id?: string | null;
  age_group_name?: string | null;
  age_group_name_ar?: string | null;
  min_age?: number | null;
  max_age?: number | null;
  level_id?: string | null;
  level_name?: string | null;
  level_name_ar?: string | null;
  level_image?: string | null;
  assigned_level_order?: number | null;
  level_min_sessions?: number | null;
  level_min_points?: number | null;
  is_primary?: boolean;
  enrollment_status?: string;
  assigned_at?: string;
  levels: ProgramLevel[];
  progress: {
    sessions_completed: number;
    points_earned: number;
    notes_count: number;
  };
  recent_attendance?: AttendanceRecord[];
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

interface ProfileResponse {
  user: ProfileUser;
  profile?: PlayerProfileData | null;
  profileComplete: boolean;
  latestTest?: HealthTestData | null;
  assignment?: AssignmentData | null;
  programs?: ProgramEnrollment[];
  program_levels?: ProgramLevel[];
  attendance?: AttendanceRecord[];
}

interface PlayerProfileContentProps {
  userId?: string;
  readOnly?: boolean;
}

const getChartPercent = (value?: number | null) => {
  if (value === null || value === undefined) return 0;
  const max = value <= 10 ? 10 : 100;
  return Math.min(100, Math.max(0, (value / max) * 100));
};

const RadialInsight = ({ label, value }: { label: string; value?: number | null }) => {
  const percent = getChartPercent(value);
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="rounded-xl bg-gradient-to-r from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 border border-zinc-300 dark:border-zinc-700 p-3 text-center">
      <svg width="46" height="46" className="mx-auto">
        <circle cx="23" cy="23" r={radius} stroke="currentColor" strokeWidth="4" className="text-zinc-300 dark:text-zinc-700" fill="transparent" />
        <circle cx="23" cy="23" r={radius} stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-orange-500" fill="transparent" strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={offset} transform="rotate(-90 23 23)" />
        <text x="23" y="27" textAnchor="middle" className="fill-zinc-800 dark:fill-white text-[10px] font-semibold">{value ?? 0}</text>
      </svg>
      <p className="mt-2 text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{label}</p>
    </div>
  );
};

export default function PlayerProfileContent({ userId, readOnly }: PlayerProfileContentProps) {
  const { locale } = useLocale();
  const isAr = locale === 'ar';
  const router = useRouter();
  const { showToast } = useToast();
  const programsSliderRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [removingProgram, setRemovingProgram] = useState<string | null>(null);
  const [data, setData] = useState<ProfileResponse | null>(null);
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [ageGroups, setAgeGroups] = useState<AgeGroupOption[]>([]);
  const [formLevels, setFormLevels] = useState<ProgramLevel[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [assignmentForm, setAssignmentForm] = useState({ program_id: '', age_group_id: '', level_id: '' });
  const [form, setForm] = useState({ sport: '', position: '', bio: '', goals: '' });
  const [profileFormOpen, setProfileFormOpen] = useState(false);
  const [showAddProgramForm, setShowAddProgramForm] = useState(false);
  const [activeProgramIndex, setActiveProgramIndex] = useState(0);

  const isAdminView = Boolean(userId);
  const canManagePlayer = Boolean(userId) && (currentRole === 'admin' || currentRole === 'academy_manager');
  const endpoint = useMemo(() => userId ? `/api/player-profile/${userId}` : '/api/player-profile', [userId]);

  const fetchUnreadCount = async () => {
    try {
      const query = isAdminView && userId ? `?unread_only=true&user_id=${userId}` : '?unread_only=true';
      const response = await fetch(`/api/notifications${query}`);
      const data = await response.json();
      if (response.ok) setUnreadCount(data.unread_count || 0);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(endpoint);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || 'Failed to load profile');
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
          level_id: payload.assignment.level_id || ''
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
      const response = await fetch('/api/programs?limit=100');
      const payload = await response.json();
      if (response.ok) setPrograms(payload.programs || []);
    } catch (error) {
      console.error('Failed to load programs:', error);
    }
  };

  const fetchAgeGroups = async (programId: string) => {
    if (!programId) { setAgeGroups([]); return; }
    try {
      const response = await fetch(`/api/programs/${programId}/age-groups`);
      const payload = await response.json();
      if (response.ok) setAgeGroups(payload.age_groups || []);
    } catch (error) {
      console.error('Failed to load age groups:', error);
    }
  };

  const fetchLevelsForForm = async (programId: string) => {
    if (!programId) { setFormLevels([]); return; }
    try {
      const response = await fetch(`/api/programs/${programId}/levels`);
      const payload = await response.json();
      if (response.ok) setFormLevels(payload.levels || []);
    } catch (error) {
      console.error('Failed to load levels:', error);
    }
  };

  useEffect(() => { fetchProfile(); fetchUnreadCount(); }, [endpoint]);
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const payload = await response.json();
        if (response.ok) setCurrentRole(payload.roleName || null);
      } catch (error) {
        console.error('Failed to fetch user role:', error);
      }
    };
    fetchCurrentUser();
  }, []);
  useEffect(() => { if (canManagePlayer) fetchPrograms(); }, [canManagePlayer]);
  useEffect(() => { 
    if (canManagePlayer && assignmentForm.program_id) {
      fetchAgeGroups(assignmentForm.program_id);
      fetchLevelsForForm(assignmentForm.program_id);
    }
  }, [assignmentForm.program_id, canManagePlayer]);

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
      if (!response.ok) throw new Error(payload.message || 'Failed to save profile');
      setData((prev) => prev ? { ...prev, profile: payload.profile, profileComplete: payload.profileComplete } : prev);
      showToast('success', isAr ? 'تم حفظ الملف' : 'Profile saved');
    } catch (error: any) {
      showToast('error', error.message || (isAr ? 'تعذر حفظ الملف' : 'Failed to save profile'));
    } finally {
      setSaving(false);
    }
  };

  const handleAssignProgram = async () => {
    if (!userId || !assignmentForm.program_id || !assignmentForm.age_group_id) {
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
          level_id: assignmentForm.level_id || null
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || 'Failed to assign program');
      showToast('success', isAr ? 'تم إضافة البرنامج' : 'Program added');
      setShowAddProgramForm(false);
      setAssignmentForm({ program_id: '', age_group_id: '', level_id: '' });
      await fetchProfile();
    } catch (error: any) {
      showToast('error', error.message || (isAr ? 'تعذر إضافة البرنامج' : 'Failed to add program'));
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveProgram = async (assignmentId: string) => {
    if (!confirm(isAr ? 'هل تريد إزالة هذا البرنامج؟' : 'Remove this program?')) return;
    try {
      setRemovingProgram(assignmentId);
      const response = await fetch(`/api/player-programs?id=${assignmentId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to remove program');
      showToast('success', isAr ? 'تمت إزالة البرنامج' : 'Program removed');
      await fetchProfile();
      setActiveProgramIndex(0);
    } catch (error: any) {
      showToast('error', error.message || (isAr ? 'تعذر إزالة البرنامج' : 'Failed to remove program'));
    } finally {
      setRemovingProgram(null);
    }
  };

  const handleSetPrimaryProgram = async (assignmentId: string) => {
    try {
      const response = await fetch('/api/player-programs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: assignmentId, is_primary: true }),
      });
      if (!response.ok) throw new Error('Failed to set primary');
      showToast('success', isAr ? 'تم تعيين كبرنامج رئيسي' : 'Set as primary');
      await fetchProfile();
    } catch (error: any) {
      showToast('error', error.message);
    }
  };

  const scrollPrograms = (direction: 'left' | 'right') => {
    if (!programsSliderRef.current) return;
    const scrollAmount = 300;
    programsSliderRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  const userName = `${data.user.first_name} ${data.user.last_name}`.trim().toUpperCase();
  const academyName = isAr ? data.user.academy_name_ar || data.user.academy_name : data.user.academy_name || data.user.academy_name_ar;
  const profileComplete = data.profileComplete;
  const playerPrograms = data.programs || [];
  const latestTest = data.latestTest;
  
  // For backward compatibility, get overall stats
  const attendance = data.attendance || [];
  const sessionsCompleted = attendance.filter((r) => r.present).length;
  const pointsTotal = attendance.reduce((sum, r) => sum + (r.score || 0), 0);
  const notesCount = attendance.filter((r) => r.notes).length;
  
  // Active program from slider
  const activeProgram = playerPrograms[activeProgramIndex] || null;
  const activeLevels = activeProgram?.levels?.filter((level) => level.is_active) || [];
  const sortedLevels = [...activeLevels].sort((a, b) => a.level_order - b.level_order);
  
  // Use the active program's data for display
  const programSessionsCompleted = activeProgram?.progress?.sessions_completed || 0;
  const programPointsTotal = activeProgram?.progress?.points_earned || 0;
  const programNotesCount = activeProgram?.progress?.notes_count || 0;
  
  // Use assigned level if available
  const assignedLevelFromList = activeProgram?.level_id 
    ? sortedLevels.find(l => l.id === activeProgram.level_id) 
    : null;
  // If level_id exists but not found in list, create a virtual level object from assignment data
  const assignedLevel = assignedLevelFromList || (activeProgram?.level_id && activeProgram?.assigned_level_order ? {
    id: activeProgram.level_id,
    name: activeProgram.level_name || `Level ${activeProgram.assigned_level_order}`,
    name_ar: activeProgram.level_name_ar,
    level_order: activeProgram.assigned_level_order,
    min_sessions: activeProgram.level_min_sessions || 0,
    min_points: activeProgram.level_min_points || 0,
    is_active: true,
    image_url: activeProgram.level_image
  } : null);
  const calculatedLevel = sortedLevels.reduce((acc, level) => {
    if (programSessionsCompleted >= level.min_sessions && programPointsTotal >= level.min_points) return level;
    return acc;
  }, sortedLevels[0] || null);
  const currentLevel = assignedLevel || calculatedLevel;

  const totalProgress = currentLevel ? Math.round(((programSessionsCompleted / (currentLevel.min_sessions || 1)) + (programPointsTotal / (currentLevel.min_points || 1))) / 2 * 100) : 0;
  const sessionProgress = currentLevel?.min_sessions ? Math.round((programSessionsCompleted / currentLevel.min_sessions) * 100) : 0;
  const pointProgress = currentLevel?.min_points ? Math.round((programPointsTotal / currentLevel.min_points) * 100) : 0;

  return (
    <div className="mx-auto w-full max-w-[390px] pb-8">
      {/* Back Button - Only show for Admin and Academy Manager */}
      {(currentRole === 'admin' || currentRole === 'academy_manager') && (
        <div className="mb-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isAr ? 'رجوع' : 'Back'}</span>
          </button>
        </div>
      )}

      {/* Main Card */}
      <div className="rounded-3xl border-2 border-zinc-300 dark:border-zinc-800 bg-gradient-to-b from-white to-zinc-100 dark:from-zinc-900 dark:to-zinc-950 p-4 shadow-[0_20px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-base font-bold text-zinc-900 dark:text-white tracking-wide">{userName}</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              {academyName || (isAr ? 'أكاديمية غير محددة' : 'NO ACADEMY')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push(`/${locale}/dashboard/notifications${isAdminView && userId ? `?user_id=${userId}` : ''}`)}
            className="relative h-9 w-9 rounded-full border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center"
          >
            <Bell className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Player Image - Square */}
        <div className="rounded-2xl border-2 border-zinc-300 dark:border-zinc-700 bg-zinc-200 dark:bg-zinc-800 overflow-hidden shadow-lg">
          <div className="aspect-square w-full bg-zinc-300 dark:bg-zinc-700">
            {data.user.avatar_url ? (
              <img src={data.user.avatar_url} alt="" className="h-full w-full object-contain bg-white dark:bg-zinc-800" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-6xl font-bold text-zinc-400 dark:text-zinc-500">
                {data.user.first_name?.charAt(0)}{data.user.last_name?.charAt(0)}
              </div>
            )}
          </div>
        </div>

        {/* Stats Box */}
        <div className="mt-3 relative z-0 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-gradient-to-r from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 px-4 pt-8 pb-4">
          {/* TRACK Button */}
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-10">
            <button
              type="button"
              className="rounded-full border-2 border-zinc-900 bg-orange-500 px-10 py-2 text-[12px] font-bold uppercase tracking-[0.15em] text-black shadow-lg hover:bg-orange-400 transition-colors"
            >
              {isAr ? 'تتبع' : 'TRACK'}
            </button>
          </div>
          <div className="grid grid-cols-3 items-center text-center">
            <div>
              <p className="text-[10px] uppercase tracking-[0.1em] text-zinc-500 font-medium">{isAr ? 'نقاط' : 'POINTS'}</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">{pointsTotal}</p>
            </div>
            <div className="flex items-center justify-center">
              <img src="/logo/icon-black.png" alt="DNA" className="h-8 w-8 opacity-60 dark:hidden" />
              <img src="/logo/icon-white.png" alt="DNA" className="h-8 w-8 opacity-60 hidden dark:block" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.1em] text-zinc-500 font-medium">{isAr ? 'جلسات' : 'SESSIONS'}</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">{sessionsCompleted}</p>
            </div>
          </div>
        </div>

        {/* WHO I AM Section */}
        <div className="relative mt-3 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-gradient-to-r from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 px-5 pb-5 pt-10">
          <span className="absolute -top-6 left-1/2 -translate-x-1/2 rounded-full border-2 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-5 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-900 dark:text-white shadow-sm">
            {isAr ? 'من أنا' : 'WHO I AM'}
          </span>
          <p className="text-[12px] leading-relaxed text-zinc-700 dark:text-zinc-300 text-center">
            {data.profile?.bio || (isAr ? 'لم يتم إضافة نبذة بعد.' : 'No bio yet.')}
          </p>
        </div>

        {/* PROGRAMS Section - Slider */}
        <div className="relative mt-3 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-gradient-to-r from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 px-3 pb-5 pt-10">
          <span className="absolute -top-6 left-1/2 -translate-x-1/2 rounded-full border-2 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-5 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-900 dark:text-white shadow-sm flex items-center gap-2">
            {isAr ? 'البرامج' : 'PROGRAMS'}
            {playerPrograms.length > 0 && (
              <span className="bg-orange-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">{playerPrograms.length}</span>
            )}
          </span>
        
        {playerPrograms.length > 0 ? (
          <div className="space-y-3">
            {/* Programs Slider */}
            {playerPrograms.length > 1 && (
              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  onClick={() => setActiveProgramIndex(Math.max(0, activeProgramIndex - 1))}
                  disabled={activeProgramIndex === 0}
                  className="p-1.5 rounded-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                </button>
                <div className="flex items-center gap-1.5">
                  {playerPrograms.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveProgramIndex(idx)}
                      className={`h-2 rounded-full transition-all ${
                        idx === activeProgramIndex 
                          ? 'w-6 bg-orange-500' 
                          : 'w-2 bg-zinc-400 dark:bg-zinc-600 hover:bg-zinc-500'
                      }`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setActiveProgramIndex(Math.min(playerPrograms.length - 1, activeProgramIndex + 1))}
                  disabled={activeProgramIndex === playerPrograms.length - 1}
                  className="p-1.5 rounded-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                </button>
              </div>
            )}

            {/* Active Program Card */}
            {activeProgram && (
              <div className="relative">
                {/* Program Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-12 w-12 rounded-xl overflow-hidden bg-zinc-300 dark:bg-zinc-700 flex-shrink-0">
                    {activeProgram.program_image ? (
                      <img src={activeProgram.program_image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-zinc-500 text-[10px]">
                        {(isAr ? activeProgram.program_name_ar : activeProgram.program_name)?.charAt(0) || 'P'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                        {isAr ? activeProgram.program_name_ar || activeProgram.program_name : activeProgram.program_name}
                      </p>
                      {activeProgram.is_primary && (
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                      {isAr ? activeProgram.age_group_name_ar || activeProgram.age_group_name : activeProgram.age_group_name}
                      {activeProgram.min_age && activeProgram.max_age && ` (${activeProgram.min_age}-${activeProgram.max_age})`}
                    </p>
                  </div>
                  {canManagePlayer && (
                    <div className="flex items-center gap-1">
                      {!activeProgram.is_primary && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryProgram(activeProgram.assignment_id)}
                          className="p-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-500/20 text-amber-500"
                          title={isAr ? 'تعيين كرئيسي' : 'Set as primary'}
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveProgram(activeProgram.assignment_id)}
                        disabled={removingProgram === activeProgram.assignment_id}
                        className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 text-red-500"
                        title={isAr ? 'إزالة' : 'Remove'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Level Info */}
                {currentLevel && (
                  <>
                    <div className="mb-2">
                      <p className="text-sm font-bold text-zinc-900 dark:text-white">
                        {isAr ? `المستوى ${currentLevel.level_order}` : `LEVEL ${currentLevel.level_order}`}
                        <span className="text-xs font-normal text-zinc-500 ms-2">
                          {isAr ? currentLevel.name_ar || currentLevel.name : currentLevel.name}
                        </span>
                      </p>
                      <p className="text-[10px] text-orange-500 uppercase tracking-wider">{isAr ? 'قيد التقدم' : 'IN PROGRESS'}</p>
                    </div>

                    {/* Stats Pills */}
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className="rounded-full border border-zinc-400 dark:border-zinc-600 px-3 py-1 text-[10px] text-zinc-700 dark:text-zinc-300">
                        {isAr ? 'حضور' : 'Attended'} : {programSessionsCompleted}
                      </span>
                      <span className="rounded-full border border-zinc-400 dark:border-zinc-600 px-3 py-1 text-[10px] text-zinc-700 dark:text-zinc-300">
                        {isAr ? 'ملاحظات' : 'Notes'} : {programNotesCount}
                      </span>
                      <span className="rounded-full border border-zinc-400 dark:border-zinc-600 px-3 py-1 text-[10px] text-zinc-700 dark:text-zinc-300">
                        {isAr ? 'نقاط' : 'POINT'} : {programPointsTotal}
                      </span>
                    </div>

                    {/* Level Card with Progress */}
                    <div className="flex gap-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-gradient-to-r from-white to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 p-3">
                      <div className="h-20 w-20 rounded-xl overflow-hidden bg-zinc-300 dark:bg-zinc-700 flex-shrink-0">
                        {currentLevel.image_url ? (
                          <img src={currentLevel.image_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-zinc-500 text-xs">
                            L{currentLevel.level_order}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{isAr ? 'التقدم' : 'PROGRESS'}</p>
                          <p className="text-sm font-bold text-zinc-900 dark:text-white">{Math.min(totalProgress, 100)}%</p>
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-[9px] text-zinc-500">
                            <span>{isAr ? 'إجمالي الجلسات' : 'TOTAL SESSION'}</span>
                            <span>{Math.min(sessionProgress, 100)}%</span>
                          </div>
                          <div className="mt-1 h-1.5 w-full rounded-full bg-zinc-300 dark:bg-zinc-700 overflow-hidden">
                            <div className="h-full rounded-full bg-orange-500" style={{ width: `${Math.min(sessionProgress, 100)}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-[9px] text-zinc-500">
                            <span>{isAr ? 'إجمالي النقاط' : 'TOTAL POINT'}</span>
                            <span>{Math.min(pointProgress, 100)}%</span>
                          </div>
                          <div className="mt-1 h-1.5 w-full rounded-full bg-zinc-300 dark:bg-zinc-700 overflow-hidden">
                            <div className="h-full rounded-full bg-orange-500" style={{ width: `${Math.min(pointProgress, 100)}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {!currentLevel && (
                  <p className="text-xs text-zinc-500 text-center py-2">
                    {isAr ? 'لم يتم تعيين مستوى بعد.' : 'No level assigned yet.'}
                  </p>
                )}
              </div>
            )}

            {/* View Player Card Link */}
            <button
              type="button"
              onClick={() => router.push(`/${locale}/dashboard/player-card${isAdminView && userId ? `?user_id=${userId}` : ''}`)}
              className="text-orange-500 text-[11px] font-medium hover:text-orange-400 flex items-center gap-1"
            >
              {isAr ? 'عرض بطاقة اللاعب' : 'View player card'}
              <span>→</span>
            </button>
          </div>
        ) : (
          <p className="text-xs text-zinc-500 text-center py-4">
            {isAr ? 'لم يتم تعيين برنامج بعد.' : 'No program assigned yet.'}
          </p>
        )}

        {/* Add Program Button for Admins */}
        {canManagePlayer && (
          <button
            type="button"
            onClick={() => setShowAddProgramForm(true)}
            className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-xl border-2 border-dashed border-zinc-400 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 text-sm hover:border-orange-500 hover:text-orange-500 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {isAr ? 'إضافة برنامج' : 'Add Program'}
          </button>
        )}
        </div>

        {/* Insight Section - Health Tests */}
        <div className="relative mt-3 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-gradient-to-r from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 px-5 pb-5 pt-10">
          <span className="absolute -top-6 left-1/2 -translate-x-1/2 rounded-full border-2 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-5 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-900 dark:text-white shadow-sm">
            {isAr ? 'مؤشرات' : 'Insight'}
          </span>
          {latestTest && latestTest.status === 'completed' ? (
            <div className="grid grid-cols-3 gap-3">
              <RadialInsight label={isAr ? 'السرعة' : 'SPEED'} value={latestTest?.speed_score} />
              <RadialInsight label={isAr ? 'الرشاقة' : 'AGILITY'} value={latestTest?.agility_score} />
              <RadialInsight label={isAr ? 'القوة' : 'POWER'} value={latestTest?.power_score} />
            </div>
          ) : (
            <p className="text-xs text-zinc-500 text-center py-4">
              {isAr ? 'لا يوجد اختبار بدني مكتمل بعد.' : 'No completed physical test yet.'}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => router.push(`/${locale}/dashboard/profile/achievements${isAdminView && userId ? `?user_id=${userId}` : ''}`)}
            className="flex items-center justify-center gap-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-gradient-to-r from-white to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 py-3 text-sm font-medium text-zinc-900 dark:text-white hover:from-zinc-100 hover:to-zinc-200 dark:hover:from-zinc-700 dark:hover:to-zinc-800 transition-colors"
          >
            <Award className="h-4 w-4 text-orange-500" />
            {isAr ? 'الإنجازات' : 'Achievement'}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/${locale}/dashboard/profile/assessment${isAdminView && userId ? `?user_id=${userId}` : ''}`)}
            className="flex items-center justify-center gap-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-gradient-to-r from-white to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 py-3 text-sm font-medium text-zinc-900 dark:text-white hover:from-zinc-100 hover:to-zinc-200 dark:hover:from-zinc-700 dark:hover:to-zinc-800 transition-colors"
          >
            <Activity className="h-4 w-4 text-orange-500" />
            {isAr ? 'التقییم' : 'Assessment'}
          </button>
        </div>

        {/* Update Profile Section */}
        {(!readOnly || isAdminView) && (
          <div className="mt-4 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-gradient-to-r from-white to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 overflow-hidden">
            <button
              type="button"
              onClick={() => setProfileFormOpen((prev) => !prev)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-zinc-900 dark:text-white"
            >
              <span>{isAr ? 'تحديث الملف الشخصي' : 'Update profile'}</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${profileFormOpen ? 'rotate-180' : ''}`} />
            </button>
            {profileFormOpen && (
              <div className="px-4 pb-4 space-y-3">
                <input
                  value={form.sport}
                  onChange={(e) => setForm((prev) => ({ ...prev, sport: e.target.value }))}
                  placeholder={isAr ? 'الرياضة' : 'Sport'}
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-500"
                />
                <input
                  value={form.position}
                  onChange={(e) => setForm((prev) => ({ ...prev, position: e.target.value }))}
                  placeholder={isAr ? 'المركز' : 'Position'}
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-500"
                />
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
                  placeholder={isAr ? 'نبذة اللاعب' : 'Player bio'}
                  rows={3}
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-500"
                />
                <textarea
                  value={form.goals}
                  onChange={(e) => setForm((prev) => ({ ...prev, goals: e.target.value }))}
                  placeholder={isAr ? 'الأهداف' : 'Goals'}
                  rows={2}
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-500"
                />
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="w-full rounded-xl bg-orange-500 text-black py-2.5 text-sm font-bold hover:bg-orange-600 disabled:opacity-60"
                >
                  {saving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ الملف' : 'Save profile')}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Admin/Academy Manager: Assign Program */}
        {canManagePlayer && (
          <div className="mt-4 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-gradient-to-r from-white to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 p-4 space-y-3">
            <h3 className="text-sm font-medium text-zinc-900 dark:text-white">{isAr ? 'تعيين برنامج' : 'Assign program'}</h3>
            <select
              value={assignmentForm.program_id}
              onChange={(e) => setAssignmentForm({ program_id: e.target.value, age_group_id: '', level_id: '' })}
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-white"
            >
              <option value="">{isAr ? 'اختر البرنامج' : 'Select program'}</option>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>{isAr ? program.name_ar || program.name : program.name}</option>
              ))}
            </select>
            <select
              value={assignmentForm.age_group_id}
              onChange={(e) => setAssignmentForm((prev) => ({ ...prev, age_group_id: e.target.value }))}
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-white"
              disabled={!assignmentForm.program_id}
            >
              <option value="">{isAr ? 'اختر الفئة' : 'Select age group'}</option>
              {ageGroups.map((group) => (
                <option key={group.id} value={group.id}>{isAr ? group.name_ar || group.name : group.name} ({group.min_age}-{group.max_age})</option>
              ))}
            </select>
            <select
              value={assignmentForm.level_id}
              onChange={(e) => setAssignmentForm((prev) => ({ ...prev, level_id: e.target.value }))}
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-white"
              disabled={!assignmentForm.program_id}
            >
              <option value="">{isAr ? 'اختر المستوى (اختياري)' : 'Select level (optional)'}</option>
              {formLevels.filter(l => l.is_active).sort((a, b) => a.level_order - b.level_order).map((level) => (
                <option key={level.id} value={level.id}>
                  {isAr ? `المستوى ${level.level_order}` : `Level ${level.level_order}`} - {isAr ? level.name_ar || level.name : level.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAssignProgram}
              disabled={assigning}
              className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white py-2 text-sm font-semibold hover:from-orange-600 hover:to-amber-600 disabled:opacity-60"
            >
              {assigning ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ البرنامج' : 'Save assignment')}
            </button>
          </div>
        )}

        {/* Footer */}
        <p className="mt-6 text-center text-[10px] uppercase tracking-[0.2em] text-zinc-600">
          {isAr ? 'اكتشف قدراتك الطبيعية' : 'DISCOVER NATURAL ABILITY'}
        </p>
      </div>

      {/* Add Program Modal */}
      {showAddProgramForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5 m-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                {isAr ? 'إضافة برنامج جديد' : 'Add New Program'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddProgramForm(false)}
                className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800"
              >
                <X className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
              </button>
            </div>
            <div className="space-y-3">
              <select
                value={assignmentForm.program_id}
                onChange={(e) => setAssignmentForm({ program_id: e.target.value, age_group_id: '', level_id: '' })}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-white"
              >
                <option value="">{isAr ? 'اختر البرنامج' : 'Select program'}</option>
                {programs.filter(p => !playerPrograms.find(pp => pp.program_id === p.id)).map((program) => (
                  <option key={program.id} value={program.id}>{isAr ? program.name_ar || program.name : program.name}</option>
                ))}
              </select>
              <select
                value={assignmentForm.age_group_id}
                onChange={(e) => setAssignmentForm((prev) => ({ ...prev, age_group_id: e.target.value }))}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-white"
                disabled={!assignmentForm.program_id}
              >
                <option value="">{isAr ? 'اختر الفئة' : 'Select age group'}</option>
                {ageGroups.map((group) => (
                  <option key={group.id} value={group.id}>{isAr ? group.name_ar || group.name : group.name} ({group.min_age}-{group.max_age})</option>
                ))}
              </select>
              <select
                value={assignmentForm.level_id}
                onChange={(e) => setAssignmentForm((prev) => ({ ...prev, level_id: e.target.value }))}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-white"
                disabled={!assignmentForm.program_id}
              >
                <option value="">{isAr ? 'اختر المستوى (اختياري)' : 'Select level (optional)'}</option>
                {formLevels.filter(l => l.is_active).sort((a, b) => a.level_order - b.level_order).map((level) => (
                  <option key={level.id} value={level.id}>
                    {isAr ? `المستوى ${level.level_order}` : `Level ${level.level_order}`} - {isAr ? level.name_ar || level.name : level.name}
                  </option>
                ))}
              </select>
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddProgramForm(false)}
                  className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-700 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleAssignProgram}
                  disabled={assigning || !assignmentForm.program_id || !assignmentForm.age_group_id}
                  className="flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white py-2.5 text-sm font-semibold hover:from-orange-600 hover:to-amber-600 disabled:opacity-60"
                >
                  {assigning ? (isAr ? 'جاري الإضافة...' : 'Adding...') : (isAr ? 'إضافة البرنامج' : 'Add Program')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
