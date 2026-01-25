'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Award, ChevronLeft, Medal, Sparkles, Package } from 'lucide-react';
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
  description?: string | null;
  icon_url?: string | null;
}

const formatDate = (value?: string | null, locale?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString(locale === 'ar' ? 'ar' : 'en');
};

export default function AchievementsContent() {
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
  
  // Medal type selection
  const [medalType, setMedalType] = useState<'virtual' | 'physical'>('virtual');
  const [physicalMedalType, setPhysicalMedalType] = useState('');
  const [physicalMedalDescription, setPhysicalMedalDescription] = useState('');
  const [requestingPhysical, setRequestingPhysical] = useState(false);

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
      if (response.ok && data.roleName) {
        setCurrentRole(data.roleName);
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
      showToast('success', isAr ? 'تم منح الميدالية الافتراضية' : 'Virtual medal awarded');
      setAwardAchievementId('');
      setAwardNote('');
      fetchAchievements();
    } catch (error: any) {
      showToast('error', error.message || 'Failed to award achievement');
    } finally {
      setAwarding(false);
    }
  };

  const handleRequestPhysicalMedal = async () => {
    if (!userId || !physicalMedalType) return;
    try {
      setRequestingPhysical(true);
      const response = await fetch('/api/medal-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          medal_type: physicalMedalType,
          achievement_description: physicalMedalDescription || null,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || 'Failed to request physical medal');
      }
      showToast('success', isAr ? 'تم إرسال طلب الميدالية الفعلية' : 'Physical medal request sent');
      setPhysicalMedalType('');
      setPhysicalMedalDescription('');
    } catch (error: any) {
      showToast('error', error.message || 'Failed to request physical medal');
    } finally {
      setRequestingPhysical(false);
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
      <div className="rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-gradient-to-r from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
          </div>
        ) : achievements.length === 0 ? (
          <div className="text-center py-8">
            <Award className="h-12 w-12 mx-auto text-zinc-400 dark:text-zinc-600" />
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
              {isAr ? 'لا توجد إنجازات بعد.' : 'No achievements yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {achievements.map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-white to-zinc-100 dark:from-zinc-700 dark:to-zinc-800 border border-zinc-300 dark:border-zinc-700 p-3">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-r from-zinc-200 to-zinc-300 dark:from-zinc-600 dark:to-zinc-700 overflow-hidden flex items-center justify-center">
                  {item.icon_url ? (
                    <img src={item.icon_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Award className="h-6 w-6 text-orange-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                    {isAr ? item.title_ar || item.title : item.title}
                  </p>
                  {item.description && (
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
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

        {/* Award Medal Form (Admin/Academy Manager only) */}
        {canAwardAchievement && (
          <div className="pt-4 border-t border-zinc-300 dark:border-zinc-700 space-y-4">
            {/* Medal Type Toggle */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMedalType('virtual')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition ${
                  medalType === 'virtual'
                    ? 'bg-indigo-500 text-white'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                <Sparkles className="h-4 w-4" />
                {isAr ? 'ميدالية افتراضية' : 'Virtual Medal'}
              </button>
              <button
                type="button"
                onClick={() => setMedalType('physical')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition ${
                  medalType === 'physical'
                    ? 'bg-amber-500 text-white'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                <Package className="h-4 w-4" />
                {isAr ? 'ميدالية فعلية' : 'Physical Medal'}
              </button>
            </div>

            {/* Virtual Medal Form */}
            {medalType === 'virtual' && (
              <div className="space-y-4">
                <p className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-500" />
                  {isAr ? 'منح ميدالية افتراضية' : 'Award Virtual Medal'}
                </p>
                
                {/* Achievement Grid with Images */}
                <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto p-1">
                  {achievementsCatalog.map((achievement) => (
                    <button
                      key={achievement.id}
                      type="button"
                      onClick={() => setAwardAchievementId(achievement.id)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                        awardAchievementId === achievement.id
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                          : 'border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-600 bg-white dark:bg-zinc-800'
                      }`}
                    >
                      <div className="h-14 w-14 rounded-xl overflow-hidden bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-700 dark:to-zinc-600 flex items-center justify-center">
                        {achievement.icon_url ? (
                          <img src={achievement.icon_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <Award className="h-7 w-7 text-indigo-500" />
                        )}
                      </div>
                      <span className="text-xs text-zinc-700 dark:text-zinc-300 text-center line-clamp-2 leading-tight font-medium">
                        {isAr ? achievement.title_ar || achievement.title : achievement.title}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Selected Achievement Preview */}
                {awardAchievementId && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
                    {(() => {
                      const selected = achievementsCatalog.find(a => a.id === awardAchievementId);
                      if (!selected) return null;
                      return (
                        <>
                          <div className="h-12 w-12 rounded-xl overflow-hidden bg-white dark:bg-zinc-800 flex items-center justify-center">
                            {selected.icon_url ? (
                              <img src={selected.icon_url} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <Award className="h-6 w-6 text-indigo-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                              {isAr ? selected.title_ar || selected.title : selected.title}
                            </p>
                            {selected.description && (
                              <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-1">
                                {selected.description}
                              </p>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}

                <textarea
                  value={awardNote}
                  onChange={(e) => setAwardNote(e.target.value)}
                  rows={2}
                  placeholder={isAr ? 'ملاحظة (اختياري)' : 'Note (optional)'}
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-500"
                />
                <button
                  type="button"
                  onClick={handleAwardAchievement}
                  disabled={awarding || !awardAchievementId}
                  className="w-full rounded-xl bg-indigo-500 text-white py-3 text-sm font-bold hover:bg-indigo-600 disabled:opacity-60 transition shadow-md flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  {awarding ? (isAr ? 'جاري الإرسال...' : 'Awarding...') : (isAr ? 'منح الميدالية الافتراضية' : 'Award Virtual Medal')}
                </button>
              </div>
            )}

            {/* Physical Medal Form */}
            {medalType === 'physical' && (
              <div className="space-y-4">
                <p className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Package className="h-4 w-4 text-amber-500" />
                  {isAr ? 'طلب ميدالية فعلية' : 'Request Physical Medal'}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {isAr ? 'سيتم إرسال الطلب للإدارة للمراجعة والموافقة' : 'Request will be sent to admin for review and approval'}
                </p>

                {/* Medal Type Selection */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'gold', label: isAr ? 'ذهبي' : 'Gold', color: 'from-yellow-400 to-amber-500' },
                    { value: 'silver', label: isAr ? 'فضي' : 'Silver', color: 'from-zinc-300 to-zinc-400' },
                    { value: 'bronze', label: isAr ? 'برونزي' : 'Bronze', color: 'from-amber-600 to-orange-700' },
                    { value: 'special', label: isAr ? 'خاص' : 'Special', color: 'from-purple-500 to-indigo-600' },
                  ].map((medal) => (
                    <button
                      key={medal.value}
                      type="button"
                      onClick={() => setPhysicalMedalType(medal.value)}
                      className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        physicalMedalType === medal.value
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                          : 'border-zinc-200 dark:border-zinc-700 hover:border-amber-300 dark:hover:border-amber-600 bg-white dark:bg-zinc-800'
                      }`}
                    >
                      <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${medal.color} flex items-center justify-center`}>
                        <Medal className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        {medal.label}
                      </span>
                    </button>
                  ))}
                </div>

                <textarea
                  value={physicalMedalDescription}
                  onChange={(e) => setPhysicalMedalDescription(e.target.value)}
                  rows={3}
                  placeholder={isAr ? 'وصف الإنجاز / سبب الميدالية' : 'Achievement description / Medal reason'}
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-500"
                />
                <button
                  type="button"
                  onClick={handleRequestPhysicalMedal}
                  disabled={requestingPhysical || !physicalMedalType}
                  className="w-full rounded-xl bg-amber-500 text-white py-3 text-sm font-bold hover:bg-amber-600 disabled:opacity-60 transition shadow-md flex items-center justify-center gap-2"
                >
                  <Package className="h-4 w-4" />
                  {requestingPhysical ? (isAr ? 'جاري الإرسال...' : 'Sending...') : (isAr ? 'إرسال طلب الميدالية' : 'Send Medal Request')}
                </button>
              </div>
            )}
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
