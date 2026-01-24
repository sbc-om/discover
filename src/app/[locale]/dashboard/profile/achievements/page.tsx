'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Award, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ToastProvider';
import useLocale from '@/hooks/useLocale';

interface PlayerAchievement {
  id: string;
  awarded_at: string;
  note?: string | null;
  achievement_id: string;
  title: string;
  title_ar?: string | null;
  description?: string | null;
  icon_url?: string | null;
}

interface AchievementOption {
  id: string;
  title: string;
  title_ar?: string | null;
}

const formatDate = (value?: string | null, locale?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString(locale === 'ar' ? 'ar' : 'en');
};

export default function AchievementsPage() {
  const { locale } = useLocale();
  const isAr = locale === 'ar';
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('user_id');
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState<PlayerAchievement[]>([]);
  const [achievementsCatalog, setAchievementsCatalog] = useState<AchievementOption[]>([]);
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [awardAchievementId, setAwardAchievementId] = useState('');
  const [awardNote, setAwardNote] = useState('');
  const [awarding, setAwarding] = useState(false);

  const isAdminView = Boolean(userId);
  const canAwardAchievement = isAdminView && (currentRole === 'admin' || currentRole === 'academy_manager');

  useEffect(() => {
    fetchAchievements();
    fetchCurrentRole();
    if (isAdminView) {
      fetchAchievementsCatalog();
    }
  }, [userId]);

  const fetchCurrentRole = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      if (response.ok && data.user) {
        setCurrentRole(data.user.role);
      }
    } catch (error) {
      console.error('Failed to fetch role:', error);
    }
  };

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const endpoint = userId ? `/api/player-profile/${userId}` : '/api/player-profile';
      const response = await fetch(endpoint);
      const payload = await response.json();
      if (response.ok) {
        setAchievements(payload.achievements || []);
      }
    } catch (error: any) {
      showToast('error', error.message || 'Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  const fetchAchievementsCatalog = async () => {
    try {
      const response = await fetch('/api/achievements?limit=100');
      const payload = await response.json();
      if (response.ok) {
        setAchievementsCatalog(payload.achievements || []);
      }
    } catch (error) {
      console.error('Failed to fetch achievements catalog:', error);
    }
  };

  const handleAwardAchievement = async () => {
    if (!userId || !awardAchievementId) return;
    try {
      setAwarding(true);
      const response = await fetch('/api/player-achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          achievement_id: awardAchievementId,
          note: awardNote || null,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || 'Failed to award achievement');
      }
      showToast('success', isAr ? 'تم منح الإنجاز' : 'Achievement awarded');
      setAwardAchievementId('');
      setAwardNote('');
      fetchAchievements();
    } catch (error: any) {
      showToast('error', error.message || 'Failed to award achievement');
    } finally {
      setAwarding(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[390px] space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="h-10 w-10 rounded-full border border-zinc-300 dark:border-zinc-700 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <ChevronLeft className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
        </button>
        <h1 className="text-lg font-bold text-zinc-900 dark:text-white">
          {isAr ? 'الإنجازات' : 'Achievement'}
        </h1>
      </div>

      {/* Achievements List */}
      <div className="rounded-2xl border border-zinc-800 bg-gradient-to-r from-zinc-800 to-zinc-900 p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
          </div>
        ) : achievements.length === 0 ? (
          <div className="text-center py-8">
            <Award className="h-12 w-12 mx-auto text-zinc-600" />
            <p className="mt-3 text-sm text-zinc-400">
              {isAr ? 'لا توجد إنجازات بعد.' : 'No achievements yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {achievements.map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-zinc-700 to-zinc-800 border border-zinc-700 p-3">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-r from-zinc-600 to-zinc-700 overflow-hidden flex items-center justify-center">
                  {item.icon_url ? (
                    <img src={item.icon_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Award className="h-6 w-6 text-orange-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">
                    {isAr ? item.title_ar || item.title : item.title}
                  </p>
                  {item.description && (
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {item.description}
                    </p>
                  )}
                  <p className="text-[10px] text-zinc-500 mt-1">
                    {formatDate(item.awarded_at, locale)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Award Achievement Form (Admin only) */}
        {canAwardAchievement && (
          <div className="pt-4 border-t border-zinc-700 space-y-3">
            <p className="text-xs font-semibold text-white">
              {isAr ? 'منح إنجاز جديد' : 'Award new achievement'}
            </p>
            <select
              value={awardAchievementId}
              onChange={(e) => setAwardAchievementId(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
            >
              <option value="">{isAr ? 'اختر الإنجاز' : 'Select achievement'}</option>
              {achievementsCatalog.map((achievement) => (
                <option key={achievement.id} value={achievement.id}>
                  {isAr ? achievement.title_ar || achievement.title : achievement.title}
                </option>
              ))}
            </select>
            <textarea
              value={awardNote}
              onChange={(e) => setAwardNote(e.target.value)}
              rows={2}
              placeholder={isAr ? 'ملاحظة (اختياري)' : 'Note (optional)'}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500"
            />
            <button
              type="button"
              onClick={handleAwardAchievement}
              disabled={awarding || !awardAchievementId}
              className="w-full rounded-xl bg-orange-500 text-black py-2.5 text-sm font-bold hover:bg-orange-600 disabled:opacity-60"
            >
              {awarding ? (isAr ? 'جاري الإرسال...' : 'Awarding...') : (isAr ? 'منح الإنجاز' : 'Award achievement')}
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <p className="text-center text-[10px] uppercase tracking-[0.2em] text-zinc-500 py-4">
        {isAr ? 'اكتشف قدراتك الطبيعية' : 'DISCOVER NATURAL ABILITY'}
      </p>
    </div>
  );
}
