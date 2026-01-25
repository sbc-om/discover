'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ChevronDown, Clock, Loader2, XCircle } from 'lucide-react';
import useLocale from '@/hooks/useLocale';
import { useToast } from '@/components/ToastProvider';
import DateTimePicker from '@/components/DateTimePicker';

interface HealthTestItem {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string | null;
  academy_name?: string | null;
  academy_name_ar?: string | null;
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

interface ResultForm {
  height: string;
  weight: string;
  blood_pressure: string;
  heart_rate: string;
  notes: string;
  speed_score: string;
  agility_score: string;
  power_score: string;
  balance_score: string;
  reaction_score: string;
  coordination_score: string;
  flexibility_score: string;
}

const formatDate = (value?: string | null, locale?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString(locale === 'ar' ? 'ar' : 'en');
};

const toNumber = (value: string) => {
  if (value === '') return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const getChartPercent = (value?: number | null) => {
  if (value === null || value === undefined) return 0;
  const max = value <= 10 ? 10 : 100;
  return Math.min(100, Math.max(0, (value / max) * 100));
};

const RadialStat = ({
  label,
  value,
  accent,
}: {
  label: string;
  value?: number | null;
  accent: string;
}) => {
  const percent = getChartPercent(value);
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 flex items-center gap-3">
      <svg width="48" height="48" className="shrink-0">
        <circle
          cx="24"
          cy="24"
          r={radius}
          stroke="currentColor"
          strokeWidth="3"
          className="text-zinc-200 dark:text-zinc-800"
          fill="transparent"
        />
        <circle
          cx="24"
          cy="24"
          r={radius}
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className={accent}
          fill="transparent"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          transform="rotate(-90 24 24)"
        />
        <text x="24" y="28" textAnchor="middle" className="fill-zinc-800 dark:fill-zinc-100 text-xs font-semibold">
          {value ?? 0}
        </text>
      </svg>
      <div>
        <p className="text-[10px] uppercase tracking-widest text-zinc-400">{label}</p>
        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{value ?? 0}</p>
      </div>
    </div>
  );
};

export default function HealthTestsContent() {
  const { locale } = useLocale();
  const isAr = locale === 'ar';
  const { showToast } = useToast();
  const [tests, setTests] = useState<HealthTestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [scheduleById, setScheduleById] = useState<Record<string, string>>({});
  const [notesById, setNotesById] = useState<Record<string, string>>({});
  const [resultsById, setResultsById] = useState<Record<string, ResultForm>>({});

  const fetchTests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/health-tests');
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || 'Failed to load tests');
      }
      setTests(payload.tests || []);

      const scheduleSeed: Record<string, string> = {};
      const notesSeed: Record<string, string> = {};
      const resultSeed: Record<string, ResultForm> = {};
      (payload.tests || []).forEach((test: HealthTestItem) => {
        scheduleSeed[test.id] = test.scheduled_at ? test.scheduled_at.slice(0, 16) : '';
        notesSeed[test.id] = test.review_notes || '';
        resultSeed[test.id] = {
          height: test.height?.toString() || '',
          weight: test.weight?.toString() || '',
          blood_pressure: test.blood_pressure || '',
          heart_rate: test.heart_rate?.toString() || '',
          notes: test.notes || '',
          speed_score: test.speed_score?.toString() || '',
          agility_score: test.agility_score?.toString() || '',
          power_score: test.power_score?.toString() || '',
          balance_score: test.balance_score?.toString() || '',
          reaction_score: test.reaction_score?.toString() || '',
          coordination_score: test.coordination_score?.toString() || '',
          flexibility_score: test.flexibility_score?.toString() || '',
        };
      });
      setScheduleById(scheduleSeed);
      setNotesById(notesSeed);
      setResultsById(resultSeed);
    } catch (error: any) {
      showToast('error', error.message || (isAr ? 'تعذر تحميل الاختبارات' : 'Failed to load tests'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateTest = async (id: string, payload: Record<string, any>) => {
    try {
      setSavingId(id);
      const response = await fetch(`/api/health-tests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update test');
      }
      showToast('success', isAr ? 'تم تحديث الاختبار' : 'Test updated');
      await fetchTests();
    } catch (error: any) {
      showToast('error', error.message || (isAr ? 'تعذر تحديث الاختبار' : 'Failed to update test'));
    } finally {
      setSavingId(null);
    }
  };

  const filteredTests = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return tests.filter((test) => {
      const statusMatch = statusFilter ? test.status === statusFilter : true;
      const haystack = [
        test.first_name,
        test.last_name,
        test.academy_name,
        test.academy_name_ar,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const queryMatch = normalizedQuery ? haystack.includes(normalizedQuery) : true;
      return statusMatch && queryMatch;
    });
  }, [tests, query, statusFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (tests.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 text-center text-sm text-zinc-500">
        {isAr ? 'لا توجد طلبات حالياً' : 'No requests yet'}
      </div>
    );
  }

  const handlePrint = () => {
    const printable = filteredTests.filter((test) => test.status === 'pending' || test.status === 'approved');
    if (printable.length === 0) {
      showToast('error', isAr ? 'لا توجد طلبات للطباعة' : 'No requests to print');
      return;
    }

    const html = `
      <html lang="${isAr ? 'ar' : 'en'}" dir="${isAr ? 'rtl' : 'ltr'}">
        <head>
          <meta charset="utf-8" />
          <title>${isAr ? 'نماذج الاختبارات' : 'Health Test Forms'}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 24px; color: #111; }
            h1 { font-size: 20px; margin-bottom: 16px; }
            .card { border: 1px solid #ddd; border-radius: 12px; padding: 16px 18px; margin-bottom: 14px; }
            .row { display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
            .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #666; }
            .value { font-size: 13px; font-weight: 600; }
            .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 12px; }
            .field { display: flex; flex-direction: column; gap: 6px; }
            .line { border-bottom: 1px solid #222; height: 22px; }
            .notes { border: 1px solid #222; height: 80px; border-radius: 8px; }
            .status { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
          </style>
        </head>
        <body>
          <h1>${isAr ? 'نماذج الاختبارات الصحية' : 'Health Test Forms'}</h1>
          ${printable
            .map((test) => {
              const name = `${test.first_name} ${test.last_name}`.trim();
              const academyName = isAr ? test.academy_name_ar || test.academy_name : test.academy_name || test.academy_name_ar;
              const statusLabel = isAr
                ? (test.status === 'approved' ? 'تم القبول' : 'قيد الانتظار')
                : test.status;
              return `
                <div class="card">
                  <div class="row">
                    <div>
                      <div class="label">${isAr ? 'اللاعب' : 'Player'}</div>
                      <div class="value">${name}</div>
                      <div class="label" style="margin-top:6px;">${isAr ? 'الأكاديمية' : 'Academy'}</div>
                      <div class="value">${academyName || '-'}</div>
                    </div>
                    <div>
                      <div class="label" style="margin-bottom:4px;">${isAr ? 'الحالة' : 'Status'}</div>
                      <div class="status">${statusLabel}</div>
                      <div class="label" style="margin-top:6px;">${isAr ? 'تاريخ الطلب' : 'Requested'}</div>
                      <div class="value">${formatDate(test.requested_at, locale)}</div>
                      <div class="label" style="margin-top:6px;">${isAr ? 'الموعد' : 'Scheduled'}</div>
                      <div class="value">${formatDate(test.scheduled_at, locale)}</div>
                    </div>
                  </div>
                  <div class="grid">
                    <div class="field">
                      <div class="label">${isAr ? 'الطول (cm)' : 'Height (cm)'}</div>
                      <div class="line"></div>
                    </div>
                    <div class="field">
                      <div class="label">${isAr ? 'الوزن (kg)' : 'Weight (kg)'}</div>
                      <div class="line"></div>
                    </div>
                    <div class="field">
                      <div class="label">${isAr ? 'النبض (bpm)' : 'Heart rate (bpm)'}</div>
                      <div class="line"></div>
                    </div>
                    <div class="field">
                      <div class="label">${isAr ? 'ضغط الدم' : 'Blood pressure'}</div>
                      <div class="line"></div>
                    </div>
                    <div class="field">
                      <div class="label">${isAr ? 'السرعة' : 'Speed'}</div>
                      <div class="line"></div>
                    </div>
                    <div class="field">
                      <div class="label">${isAr ? 'الرشاقة' : 'Agility'}</div>
                      <div class="line"></div>
                    </div>
                    <div class="field">
                      <div class="label">${isAr ? 'التوازن' : 'Balance'}</div>
                      <div class="line"></div>
                    </div>
                    <div class="field">
                      <div class="label">${isAr ? 'القوة' : 'Power'}</div>
                      <div class="line"></div>
                    </div>
                    <div class="field">
                      <div class="label">${isAr ? 'رد الفعل' : 'Reaction'}</div>
                      <div class="line"></div>
                    </div>
                    <div class="field">
                      <div class="label">${isAr ? 'التناسق' : 'Coordination'}</div>
                      <div class="line"></div>
                    </div>
                    <div class="field">
                      <div class="label">${isAr ? 'المرونة' : 'Flexibility'}</div>
                      <div class="line"></div>
                    </div>
                  </div>
                  <div style="margin-top: 12px;">
                    <div class="label">${isAr ? 'ملاحظات الطبيب' : 'Doctor notes'}</div>
                    <div class="notes"></div>
                  </div>
                </div>
              `;
            })
            .join('')}
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) return;
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={isAr ? 'بحث بالاسم أو الأكاديمية' : 'Search by name or academy'}
            className="w-full md:w-64 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full md:w-48 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 px-3 py-2 text-sm"
          >
            <option value="" className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100">
              {isAr ? 'كل الحالات' : 'All statuses'}
            </option>
            <option value="pending" className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100">
              {isAr ? 'قيد الانتظار' : 'Pending'}
            </option>
            <option value="approved" className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100">
              {isAr ? 'تم القبول' : 'Approved'}
            </option>
            <option value="rejected" className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100">
              {isAr ? 'مرفوض' : 'Rejected'}
            </option>
            <option value="completed" className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100">
              {isAr ? 'مكتمل' : 'Completed'}
            </option>
          </select>
        </div>
        <button
          type="button"
          onClick={handlePrint}
          className="self-start md:self-auto rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800"
        >
          {isAr ? 'طباعة النتائج' : 'Print forms'}
        </button>
      </div>

      {filteredTests.map((test) => {
        const userName = `${test.first_name} ${test.last_name}`.trim();
        const academyName = isAr ? test.academy_name_ar || test.academy_name : test.academy_name || test.academy_name_ar;
        const result = resultsById[test.id];
        const statusLabel = isAr
          ? {
              pending: 'قيد الانتظار',
              approved: 'تم القبول',
              rejected: 'مرفوض',
              completed: 'مكتمل',
            }[test.status]
          : test.status;

        const isOpen = expandedId === test.id;

        return (
          <div
            key={test.id}
            className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setExpandedId(isOpen ? null : test.id)}
              className="w-full text-left p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                  {test.avatar_url ? (
                    <img src={test.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                      {test.first_name?.charAt(0)}{test.last_name?.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{userName}</p>
                  <p className="text-xs text-zinc-500">{academyName || (isAr ? 'بدون أكاديمية' : 'No academy')}</p>
                  <p className="text-[10px] text-zinc-400 mt-1">
                    {isAr ? 'طلب' : 'Requested'}: {formatDate(test.requested_at, locale)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 self-start sm:self-auto">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                  test.status === 'pending'
                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                    : test.status === 'approved'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                    : test.status === 'rejected'
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                }`}>
                  {test.status === 'pending' && <Clock className="h-3 w-3" />}
                  {test.status === 'approved' && <CheckCircle2 className="h-3 w-3" />}
                  {test.status === 'rejected' && <XCircle className="h-3 w-3" />}
                  {test.status === 'completed' && <CheckCircle2 className="h-3 w-3" />}
                  {statusLabel}
                </span>
                <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {isOpen && (
              <div className="px-4 sm:px-5 pb-5 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs text-zinc-500">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest">{isAr ? 'طلب' : 'Requested'}</p>
                    <p className="text-sm text-zinc-700 dark:text-zinc-200">{formatDate(test.requested_at, locale)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest">{isAr ? 'موعد' : 'Scheduled'}</p>
                    <p className="text-sm text-zinc-700 dark:text-zinc-200">{formatDate(test.scheduled_at, locale)}</p>
                  </div>
                </div>

            {test.status === 'pending' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    {isAr ? 'تحديد الموعد' : 'Set schedule'}
                  </label>
                  <DateTimePicker
                    value={scheduleById[test.id] || ''}
                    onChange={(val) =>
                      setScheduleById((prev) => ({ ...prev, [test.id]: val }))
                    }
                    mode="datetime"
                    locale={locale}
                    placeholder={isAr ? 'اختر التاريخ والوقت' : 'Select date & time'}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    {isAr ? 'ملاحظات' : 'Notes'}
                  </label>
                  <textarea
                    rows={2}
                    value={notesById[test.id] || ''}
                    onChange={(event) =>
                      setNotesById((prev) => ({ ...prev, [test.id]: event.target.value }))
                    }
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateTest(test.id, {
                        status: 'approved',
                        scheduled_at: scheduleById[test.id],
                        review_notes: notesById[test.id],
                      })
                    }
                    disabled={savingId === test.id}
                    className="rounded-xl bg-emerald-500 text-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-emerald-600 hover:shadow-md disabled:opacity-60"
                  >
                    {isAr ? 'قبول' : 'Approve'}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateTest(test.id, {
                        status: 'rejected',
                        review_notes: notesById[test.id],
                      })
                    }
                    disabled={savingId === test.id}
                    className="rounded-xl bg-red-600 text-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-red-700 hover:shadow-md disabled:opacity-60"
                  >
                    {isAr ? 'رفض' : 'Reject'}
                  </button>
                </div>
              </div>
            )}

            {test.status === 'approved' && result && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                  {isAr ? 'تسجيل النتائج' : 'Record results'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span>{isAr ? 'الطول (cm)' : 'Height (cm)'}</span>
                      <span className="text-zinc-800 dark:text-zinc-100 font-semibold">{result.height || 0}</span>
                    </div>
                    <input
                      type="range"
                      min={120}
                      max={220}
                      step={1}
                      value={result.height || 0}
                      onChange={(event) =>
                        setResultsById((prev) => ({
                          ...prev,
                          [test.id]: { ...prev[test.id], height: event.target.value },
                        }))
                      }
                      list={`height-marks-${test.id}`}
                      className="w-full accent-emerald-500"
                    />
                    <datalist id={`height-marks-${test.id}`}>
                      <option value="120" />
                      <option value="150" />
                      <option value="180" />
                      <option value="210" />
                      <option value="220" />
                    </datalist>
                  </div>
                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span>{isAr ? 'الوزن (kg)' : 'Weight (kg)'}</span>
                      <span className="text-zinc-800 dark:text-zinc-100 font-semibold">{result.weight || 0}</span>
                    </div>
                    <input
                      type="range"
                      min={30}
                      max={140}
                      step={1}
                      value={result.weight || 0}
                      onChange={(event) =>
                        setResultsById((prev) => ({
                          ...prev,
                          [test.id]: { ...prev[test.id], weight: event.target.value },
                        }))
                      }
                      list={`weight-marks-${test.id}`}
                      className="w-full accent-emerald-500"
                    />
                    <datalist id={`weight-marks-${test.id}`}>
                      <option value="40" />
                      <option value="60" />
                      <option value="80" />
                      <option value="100" />
                      <option value="120" />
                    </datalist>
                  </div>
                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span>{isAr ? 'النبض (bpm)' : 'Heart rate (bpm)'}</span>
                      <span className="text-zinc-800 dark:text-zinc-100 font-semibold">{result.heart_rate || 0}</span>
                    </div>
                    <input
                      type="range"
                      min={50}
                      max={200}
                      step={1}
                      value={result.heart_rate || 0}
                      onChange={(event) =>
                        setResultsById((prev) => ({
                          ...prev,
                          [test.id]: { ...prev[test.id], heart_rate: event.target.value },
                        }))
                      }
                      list={`heart-marks-${test.id}`}
                      className="w-full accent-emerald-500"
                    />
                    <datalist id={`heart-marks-${test.id}`}>
                      <option value="60" />
                      <option value="90" />
                      <option value="120" />
                      <option value="150" />
                      <option value="180" />
                    </datalist>
                  </div>
                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span>{isAr ? 'ضغط الدم' : 'Blood pressure'}</span>
                      <span className="text-zinc-800 dark:text-zinc-100 font-semibold">{result.blood_pressure || '-'}</span>
                    </div>
                    <select
                      value={result.blood_pressure}
                      onChange={(event) =>
                        setResultsById((prev) => ({
                          ...prev,
                          [test.id]: { ...prev[test.id], blood_pressure: event.target.value },
                        }))
                      }
                      className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm px-3 py-2"
                    >
                      <option value="">{isAr ? 'اختر' : 'Select'}</option>
                      <option value="90/60">90/60</option>
                      <option value="100/70">100/70</option>
                      <option value="110/70">110/70</option>
                      <option value="120/80">120/80</option>
                      <option value="130/85">130/85</option>
                      <option value="140/90">140/90</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { key: 'speed_score', label: isAr ? 'سرعة' : 'Speed' },
                    { key: 'agility_score', label: isAr ? 'رشاقة' : 'Agility' },
                    { key: 'balance_score', label: isAr ? 'توازن' : 'Balance' },
                    { key: 'power_score', label: isAr ? 'قوة' : 'Power' },
                    { key: 'reaction_score', label: isAr ? 'رد الفعل' : 'Reaction' },
                    { key: 'coordination_score', label: isAr ? 'تناسق' : 'Coordination' },
                    { key: 'flexibility_score', label: isAr ? 'مرونة' : 'Flexibility' },
                  ].map((item) => (
                    <div key={item.key} className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs text-zinc-500">
                        <span>{item.label}</span>
                        <span className="text-zinc-800 dark:text-zinc-100 font-semibold">
                          {result[item.key as keyof ResultForm] || 0}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={10}
                        step={1}
                        value={result[item.key as keyof ResultForm] || 0}
                        onChange={(event) =>
                          setResultsById((prev) => ({
                            ...prev,
                            [test.id]: { ...prev[test.id], [item.key]: event.target.value },
                          }))
                        }
                        list={`${item.key}-marks-${test.id}`}
                        className="w-full accent-blue-500"
                      />
                      <datalist id={`${item.key}-marks-${test.id}`}>
                        <option value="0" />
                        <option value="2" />
                        <option value="4" />
                        <option value="6" />
                        <option value="8" />
                        <option value="10" />
                      </datalist>
                    </div>
                  ))}
                </div>
                <textarea
                  rows={3}
                  placeholder={isAr ? 'ملاحظات' : 'Notes'}
                  value={result.notes}
                  onChange={(event) =>
                    setResultsById((prev) => ({
                      ...prev,
                      [test.id]: { ...prev[test.id], notes: event.target.value },
                    }))
                  }
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      updateTest(test.id, {
                        status: 'completed',
                        scheduled_at: scheduleById[test.id] || test.scheduled_at,
                        height: toNumber(result.height),
                        weight: toNumber(result.weight),
                        blood_pressure: result.blood_pressure || null,
                        heart_rate: toNumber(result.heart_rate),
                        notes: result.notes || null,
                        speed_score: toNumber(result.speed_score),
                        agility_score: toNumber(result.agility_score),
                        power_score: toNumber(result.power_score),
                        balance_score: toNumber(result.balance_score),
                        reaction_score: toNumber(result.reaction_score),
                        coordination_score: toNumber(result.coordination_score),
                        flexibility_score: toNumber(result.flexibility_score),
                      })
                    }
                    disabled={savingId === test.id}
                    className="rounded-xl bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
                  >
                    {isAr ? 'حفظ النتائج' : 'Save results'}
                  </button>
                </div>
              </div>
            )}

            {test.status === 'rejected' && test.review_notes && (
              <div className="rounded-xl border border-red-200 bg-red-50/60 p-3 text-xs text-red-600">
                {test.review_notes}
              </div>
            )}

            {test.status === 'completed' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs text-zinc-600 dark:text-zinc-400">
                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-400">{isAr ? 'طول' : 'Height'}</p>
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{test.height || '-'} cm</p>
                  </div>
                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-400">{isAr ? 'وزن' : 'Weight'}</p>
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{test.weight || '-'} kg</p>
                  </div>
                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-400">{isAr ? 'نبض' : 'Heart'}</p>
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{test.heart_rate || '-'} bpm</p>
                  </div>
                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-400">{isAr ? 'ضغط' : 'Blood'}</p>
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{test.blood_pressure || '-'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <RadialStat
                    label={isAr ? 'سرعة' : 'Speed'}
                    value={test.speed_score}
                    accent="text-emerald-500"
                  />
                  <RadialStat
                    label={isAr ? 'رشاقة' : 'Agility'}
                    value={test.agility_score}
                    accent="text-blue-500"
                  />
                  <RadialStat
                    label={isAr ? 'توازن' : 'Balance'}
                    value={test.balance_score}
                    accent="text-purple-500"
                  />
                  <RadialStat
                    label={isAr ? 'قوة' : 'Power'}
                    value={test.power_score}
                    accent="text-orange-500"
                  />
                  <RadialStat
                    label={isAr ? 'رد الفعل' : 'Reaction'}
                    value={test.reaction_score}
                    accent="text-rose-500"
                  />
                  <RadialStat
                    label={isAr ? 'تناسق' : 'Coordination'}
                    value={test.coordination_score}
                    accent="text-sky-500"
                  />
                  <RadialStat
                    label={isAr ? 'مرونة' : 'Flexibility'}
                    value={test.flexibility_score}
                    accent="text-teal-500"
                  />
                </div>
              </div>
            )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
