'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft, Clock, CheckCircle2, XCircle, Activity, List } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ToastProvider';
import useLocale from '@/hooks/useLocale';

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
  balance_score?: number | null;
  reaction_score?: number | null;
  coordination_score?: number | null;
  flexibility_score?: number | null;
}

const formatDate = (value?: string | null, locale?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString(locale === 'ar' ? 'ar' : 'en');
};

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
    <div className="rounded-xl bg-gradient-to-r from-zinc-100 to-zinc-200 dark:from-zinc-700 dark:to-zinc-800 border border-zinc-300 dark:border-zinc-700 p-3 text-center">
      <svg width="46" height="46" className="mx-auto">
        <circle cx="23" cy="23" r={radius} stroke="currentColor" strokeWidth="4" className="text-zinc-300 dark:text-zinc-600" fill="transparent" />
        <circle cx="23" cy="23" r={radius} stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-orange-500" fill="transparent" strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={offset} transform="rotate(-90 23 23)" />
        <text x="23" y="27" textAnchor="middle" className="fill-zinc-900 dark:fill-white text-[10px] font-semibold">{value ?? 0}</text>
      </svg>
      <p className="mt-2 text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{label}</p>
    </div>
  );
};

export default function AssessmentContent() {
  const { locale } = useLocale();
  const isAr = locale === 'ar';
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('user_id');
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [latestTest, setLatestTest] = useState<HealthTestData | null>(null);
  const [activeRequest, setActiveRequest] = useState<HealthTestData | null>(null);
  const [allTests, setAllTests] = useState<HealthTestData[]>([]);
  const [showAllTests, setShowAllTests] = useState(false);
  const [allTestsLoading, setAllTestsLoading] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);
  const [currentRole, setCurrentRole] = useState<string | null>(null);

  const isAdminView = Boolean(userId);
  const canSeeAllTests = currentRole === 'admin' || currentRole === 'academy_manager';
  const canSeeTestReviewNotes = currentRole === 'admin' || currentRole === 'academy_manager';

  useEffect(() => {
    fetchProfile();
    fetchCurrentRole();
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

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const endpoint = userId ? `/api/player-profile/${userId}` : '/api/player-profile';
      const response = await fetch(endpoint);
      const payload = await response.json();
      if (response.ok) {
        setLatestTest(payload.latestTest || null);
        setActiveRequest(payload.activeRequest || null);
        setProfileComplete(payload.profileComplete || false);
      }
    } catch (error: any) {
      showToast('error', error.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTests = async () => {
    try {
      setAllTestsLoading(true);
      const params = new URLSearchParams();
      if (isAdminView && userId) {
        params.set('user_id', userId);
      }
      const response = await fetch(`/api/health-tests?${params.toString()}`);
      const payload = await response.json();
      if (response.ok) {
        const completedTests = (payload.tests || []).filter((test: HealthTestData) => test.status === 'completed');
        setAllTests(completedTests);
      }
    } catch (error: any) {
      showToast('error', error.message || 'Failed to load tests');
    } finally {
      setAllTestsLoading(false);
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
      fetchProfile();
    } catch (error: any) {
      showToast('error', error.message || 'Failed to request test');
    } finally {
      setRequesting(false);
    }
  };

  const requestStatus = activeRequest || (latestTest?.status === 'rejected' ? latestTest : null);

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
          {isAr ? 'التقييم البدني' : 'Assessment'}
        </h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
        </div>
      ) : (
        <>
          {/* Request Status */}
          {requestStatus && (
            <div className="rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-gradient-to-r from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 p-4 space-y-3">
              <div className="flex items-center gap-2">
                {requestStatus.status === 'pending' && <Clock className="h-5 w-5 text-orange-500" />}
                {requestStatus.status === 'approved' && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                {requestStatus.status === 'rejected' && <XCircle className="h-5 w-5 text-red-500" />}
                <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                  {requestStatus.status === 'pending' && (isAr ? 'طلب قيد الانتظار' : 'Request pending')}
                  {requestStatus.status === 'approved' && (isAr ? 'تم قبول الطلب' : 'Request approved')}
                  {requestStatus.status === 'rejected' && (isAr ? 'تم رفض الطلب' : 'Request rejected')}
                </span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                {isAr ? 'تاريخ الطلب:' : 'Requested:'} {formatDate(requestStatus.requested_at, locale)}
              </p>
              {requestStatus.scheduled_at && (
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  {isAr ? 'وقت الاختبار:' : 'Scheduled:'} {formatDate(requestStatus.scheduled_at, locale)}
                </p>
              )}
              {requestStatus.review_notes && (
                <p className="text-xs text-red-400">{requestStatus.review_notes}</p>
              )}
            </div>
          )}

          {/* Request Test Button */}
          {profileComplete && !activeRequest && (
            <button
              type="button"
              onClick={handleRequestTest}
              disabled={requesting}
              className="w-full rounded-xl bg-orange-500 text-black py-3 text-sm font-bold hover:bg-orange-600 disabled:opacity-60"
            >
              {requesting ? (isAr ? 'جاري الإرسال...' : 'Submitting...') : (isAr ? 'طلب اختبار بدني' : 'Request physical test')}
            </button>
          )}

          {/* Latest Test Results */}
          {latestTest && latestTest.status === 'completed' && (
            <div className="rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-gradient-to-r from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                  {isAr ? 'نتائج الاختبار' : 'Test Results'}
                </h3>
                <div className="flex items-center gap-2">
                  {canSeeAllTests && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowAllTests((prev) => !prev);
                        if (!showAllTests && allTests.length === 0) {
                          fetchAllTests();
                        }
                      }}
                      className="h-7 w-7 rounded-full border border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                    >
                      <List className="h-4 w-4" />
                    </button>
                  )}
                  <span className="text-xs text-zinc-600 dark:text-zinc-500">{formatDate(latestTest.test_date || latestTest.scheduled_at, locale)}</span>
                </div>
              </div>

              {/* Physical Measurements */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-gradient-to-r from-zinc-100 to-zinc-200 dark:from-zinc-700 dark:to-zinc-800 border border-zinc-300 dark:border-zinc-700 p-3">
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{isAr ? 'طول' : 'Height'}</p>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">{latestTest.height || '-'} cm</p>
                </div>
                <div className="rounded-xl bg-gradient-to-r from-zinc-100 to-zinc-200 dark:from-zinc-700 dark:to-zinc-800 border border-zinc-300 dark:border-zinc-700 p-3">
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{isAr ? 'وزن' : 'Weight'}</p>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">{latestTest.weight || '-'} kg</p>
                </div>
                <div className="rounded-xl bg-gradient-to-r from-zinc-100 to-zinc-200 dark:from-zinc-700 dark:to-zinc-800 border border-zinc-300 dark:border-zinc-700 p-3">
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{isAr ? 'ضغط' : 'Blood'}</p>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">{latestTest.blood_pressure || '-'}</p>
                </div>
                <div className="rounded-xl bg-gradient-to-r from-zinc-100 to-zinc-200 dark:from-zinc-700 dark:to-zinc-800 border border-zinc-300 dark:border-zinc-700 p-3">
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{isAr ? 'نبض' : 'Heart'}</p>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">{latestTest.heart_rate || '-'} bpm</p>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-4 gap-2">
                <RadialInsight label={isAr ? 'السرعة' : 'Speed'} value={latestTest.speed_score} />
                <RadialInsight label={isAr ? 'الرشاقة' : 'Agility'} value={latestTest.agility_score} />
                <RadialInsight label={isAr ? 'القوة' : 'Power'} value={latestTest.power_score} />
                <RadialInsight label={isAr ? 'التوازن' : 'Balance'} value={latestTest.balance_score} />
                <RadialInsight label={isAr ? 'رد الفعل' : 'Reaction'} value={latestTest.reaction_score} />
                <RadialInsight label={isAr ? 'التناسق' : 'Coord.'} value={latestTest.coordination_score} />
                <RadialInsight label={isAr ? 'المرونة' : 'Flex.'} value={latestTest.flexibility_score} />
              </div>

              {canSeeTestReviewNotes && latestTest.notes && (
                <div className="rounded-xl bg-gradient-to-r from-zinc-100 to-zinc-200 dark:from-zinc-700 dark:to-zinc-800 border border-zinc-300 dark:border-zinc-700 p-3">
                  <p className="text-[10px] uppercase tracking-widest text-zinc-600 dark:text-zinc-500">{isAr ? 'ملاحظة الاختبار' : 'Test note'}</p>
                  <p className="mt-2 text-xs text-zinc-700 dark:text-zinc-300">{latestTest.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* All Tests History */}
          {canSeeAllTests && showAllTests && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                {isAr ? 'كل نتائج الاختبارات' : 'All test results'}
              </p>
              {allTestsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                </div>
              ) : allTests.length === 0 ? (
                <p className="text-xs text-zinc-500">{isAr ? 'لا توجد نتائج بعد.' : 'No results yet.'}</p>
              ) : (
                allTests.map((test) => (
                  <div key={test.id} className="rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-gradient-to-r from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-zinc-900 dark:text-white">{formatDate(test.test_date || test.scheduled_at, locale)}</p>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{isAr ? 'مكتمل' : 'Completed'}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <RadialInsight label={isAr ? 'السرعة' : 'Speed'} value={test.speed_score} />
                      <RadialInsight label={isAr ? 'الرشاقة' : 'Agility'} value={test.agility_score} />
                      <RadialInsight label={isAr ? 'القوة' : 'Power'} value={test.power_score} />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* No Test Yet */}
          {!latestTest && !requestStatus && (
            <div className="rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-gradient-to-r from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 p-8 text-center">
              <Activity className="h-12 w-12 mx-auto text-zinc-400 dark:text-zinc-600" />
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                {isAr ? 'لا يوجد اختبار بدني بعد.' : 'No physical test yet.'}
              </p>
            </div>
          )}
        </>
      )}

      {/* Footer */}
      <p className="text-center text-[10px] uppercase tracking-[0.2em] text-zinc-500 py-4">
        {isAr ? 'اكتشف قدراتك الطبيعية' : 'DISCOVER NATURAL ABILITY'}
      </p>
    </div>
  );
}
