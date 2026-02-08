'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Building2, CheckCircle2, ChevronDown, Clock, Loader2, XCircle, Zap, Wind, Scale, Activity, Target, Move3d, StretchHorizontal } from 'lucide-react';
import useLocale from '@/hooks/useLocale';
import { useToast } from '@/components/ToastProvider';
import DateTimePicker from '@/components/DateTimePicker';

// Styled Range Slider Component
interface RangeSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  icon?: React.ReactNode;
  color?: 'orange' | 'emerald' | 'blue' | 'purple' | 'rose' | 'sky' | 'teal' | 'amber';
  unit?: string;
  showScale?: boolean;
}

const colorClasses = {
  orange: 'bg-orange-500',
  emerald: 'bg-emerald-500',
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  rose: 'bg-rose-500',
  sky: 'bg-sky-500',
  teal: 'bg-teal-500',
  amber: 'bg-amber-500',
};

const RangeSlider = ({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  icon,
  color = 'orange',
  unit = '',
  showScale = true,
}: RangeSliderProps) => {
  const totalSteps = Math.floor((max - min) / step);
  // Scale from min to max (0 to 10)
  const scaleSteps = showScale && totalSteps <= 10 
    ? Array.from({ length: totalSteps + 1 }, (_, i) => min + i * step)
    : null;
  
  const percent = ((value - min) / (max - min)) * 100;
  
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
            {icon && <span className="text-white">{icon}</span>}
          </div>
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
        </div>
        <div className={`w-8 h-8 rounded-full ${colorClasses[color]} flex items-center justify-center`}>
          <span className="text-xs font-bold text-white">
            {value}
          </span>
        </div>
      </div>
      
      {/* Slider */}
      <div className="relative h-2">
        <div className="absolute inset-0 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
          <div 
            className={`absolute inset-y-0 left-0 rounded-full ${colorClasses[color]} transition-all duration-150`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        {/* Thumb indicator - centered on the line */}
        <div 
          className={`absolute top-1/2 w-3 h-3 rounded-full ${colorClasses[color]} border-2 border-white dark:border-zinc-900 shadow-md transform -translate-x-1/2 -translate-y-1/2 transition-all duration-150 pointer-events-none`}
          style={{ left: `${percent}%` }}
        />
      </div>
      
      {/* Scale numbers - 0 to 10 from left to right */}
      {scaleSteps && (
        <div className="flex justify-between">
          {scaleSteps.map((num) => (
            <span 
              key={num}
              className="text-xs font-medium text-zinc-400 dark:text-zinc-500"
            >
              {num}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

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
  const searchParams = useSearchParams();
  const statusParam = searchParams.get('status');
  
  const [tests, setTests] = useState<HealthTestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  // Initialize status filter directly from URL
  const [statusFilter, setStatusFilter] = useState(() => statusParam || '');
  const [scheduleById, setScheduleById] = useState<Record<string, string>>({});
  const [notesById, setNotesById] = useState<Record<string, string>>({});
  const [resultsById, setResultsById] = useState<Record<string, ResultForm>>({});

  // Sync filter when URL params change
  useEffect(() => {
    const newFilter = statusParam || '';
    if (newFilter !== statusFilter) {
      setStatusFilter(newFilter);
    }
  }, [statusParam]);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) {
        params.append('status', statusFilter);
      }
      const url = statusFilter ? `/api/health-tests?${params}` : '/api/health-tests';
      const response = await fetch(url);
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
  };statusFilter

  useEffect(() => {
    fetchTests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

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

  // Group tests by academy
  const groupedByAcademy = useMemo(() => {
    const groups: Record<string, { name: string; nameAr: string; tests: HealthTestItem[] }> = {};
    filteredTests.forEach(test => {
      const key = test.academy_name || 'unknown';
      if (!groups[key]) {
        groups[key] = {
          name: test.academy_name || 'Unknown Academy',
          nameAr: test.academy_name_ar || test.academy_name || 'أكاديمية غير معروفة',
          tests: [],
        };
      }
      groups[key].tests.push(test);
    });
    return Object.values(groups).sort((a, b) => b.tests.length - a.tests.length);
  }, [filteredTests]);

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

      {/* Tests List - Grouped by Academy */}
      <div className="space-y-6">
        {filteredTests.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-12 text-center">
            <Clock className="h-12 w-12 mx-auto text-zinc-300 dark:text-zinc-700" />
            <p className="mt-4 text-zinc-500">{isAr ? 'لا توجد طلبات' : 'No requests found'}</p>
          </div>
        ) : groupedByAcademy.map((group) => (
          <div key={group.name} className="space-y-3">
            {/* Academy Header */}
            <div className="flex items-center gap-3 px-1">
              <div className="h-8 w-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <Building2 className="h-4 w-4 text-zinc-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{isAr ? group.nameAr : group.name}</h3>
                <p className="text-xs text-zinc-400">{group.tests.length} {isAr ? 'طلب' : 'request(s)'}</p>
              </div>
            </div>

            {/* Academy Tests */}
            <div className="space-y-3">
      {group.tests.map((test) => {
        const userName = `${test.first_name} ${test.last_name}`.trim();
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
                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                    : test.status === 'rejected'
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
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
              <div className="mt-4 rounded-2xl border border-orange-200 dark:border-orange-900/50 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-900/20 dark:via-amber-900/20 dark:to-yellow-900/20 p-4 space-y-4">
                {/* Header */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
                      {isAr ? 'جدولة الفحص الصحي' : 'Schedule Health Test'}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {isAr ? 'حدد موعد الفحص للاعب' : 'Set appointment date for player'}
                    </p>
                  </div>
                </div>

                {/* Date & Time Picker */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-orange-100 dark:border-orange-900/30 shadow-sm">
                  <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                    <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {isAr ? 'التاريخ والوقت' : 'Date & Time'}
                  </label>
                  <DateTimePicker
                    value={scheduleById[test.id] || ''}
                    onChange={(val: string) =>
                      setScheduleById((prev) => ({ ...prev, [test.id]: val }))
                    }
                    mode="datetime"
                    locale={locale}
                    placeholder={isAr ? 'اختر التاريخ والوقت' : 'Select date & time'}
                    minDate={new Date().toISOString().split('T')[0]}
                    className="w-full"
                  />
                  {scheduleById[test.id] && (
                    <div className="mt-3 flex items-center gap-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span className="text-xs text-emerald-700 dark:text-emerald-400">
                        {isAr ? 'الموعد المحدد: ' : 'Scheduled: '}
                        <span className="font-semibold">
                          {new Date(scheduleById[test.id]).toLocaleString(isAr ? 'ar' : 'en', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-orange-100 dark:border-orange-900/30 shadow-sm">
                  <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                    <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    {isAr ? 'ملاحظات (اختياري)' : 'Notes (optional)'}
                  </label>
                  <textarea
                    rows={2}
                    value={notesById[test.id] || ''}
                    onChange={(event) =>
                      setNotesById((prev) => ({ ...prev, [test.id]: event.target.value }))
                    }
                    placeholder={isAr ? 'أضف ملاحظات حول الموعد...' : 'Add notes about the appointment...'}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2.5 text-sm placeholder:text-zinc-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateTest(test.id, {
                        status: 'approved',
                        scheduled_at: scheduleById[test.id],
                        review_notes: notesById[test.id],
                      })
                    }
                    disabled={savingId === test.id || !scheduleById[test.id]}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-5 py-3 text-sm font-bold shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-600 hover:shadow-xl hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {savingId === test.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    {isAr ? 'قبول وجدولة' : 'Approve & Schedule'}
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
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-red-600 dark:text-red-400 border border-zinc-200 dark:border-zinc-700 px-5 py-3 text-sm font-bold hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-800 disabled:opacity-50 transition-all"
                  >
                    <XCircle className="h-4 w-4" />
                    {isAr ? 'رفض' : 'Reject'}
                  </button>
                </div>

                {/* Helper Text */}
                {!scheduleById[test.id] && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5 mt-1">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {isAr ? 'يرجى تحديد موعد للقبول' : 'Please set a schedule to approve'}
                  </p>
                )}
              </div>
            )}

            {test.status === 'approved' && result && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                  {isAr ? 'تسجيل النتائج' : 'Record results'}
                </h4>
                
                {/* Physical Measurements */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Height - using number input for precision */}
                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                          <Activity className="w-4 h-4 text-emerald-500" />
                        </div>
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          {isAr ? 'الطول' : 'Height'}
                        </span>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-emerald-500/15">
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          {result.height || 0} cm
                        </span>
                      </div>
                    </div>
                    <input
                      type="number"
                      min={120}
                      max={220}
                      value={result.height || ''}
                      placeholder="170"
                      onChange={(e) =>
                        setResultsById((prev) => ({
                          ...prev,
                          [test.id]: { ...prev[test.id], height: e.target.value },
                        }))
                      }
                      className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm px-3 py-2 text-center font-medium"
                    />
                  </div>

                  {/* Weight - using number input for precision */}
                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center">
                          <Scale className="w-4 h-4 text-blue-500" />
                        </div>
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          {isAr ? 'الوزن' : 'Weight'}
                        </span>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-blue-500/15">
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                          {result.weight || 0} kg
                        </span>
                      </div>
                    </div>
                    <input
                      type="number"
                      min={30}
                      max={150}
                      value={result.weight || ''}
                      placeholder="65"
                      onChange={(e) =>
                        setResultsById((prev) => ({
                          ...prev,
                          [test.id]: { ...prev[test.id], weight: e.target.value },
                        }))
                      }
                      className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm px-3 py-2 text-center font-medium"
                    />
                  </div>

                  {/* Heart Rate - using number input */}
                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-rose-500/15 flex items-center justify-center">
                          <Activity className="w-4 h-4 text-rose-500" />
                        </div>
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          {isAr ? 'النبض' : 'Heart Rate'}
                        </span>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-rose-500/15">
                        <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
                          {result.heart_rate || 0} bpm
                        </span>
                      </div>
                    </div>
                    <input
                      type="number"
                      min={50}
                      max={200}
                      value={result.heart_rate || ''}
                      placeholder="72"
                      onChange={(e) =>
                        setResultsById((prev) => ({
                          ...prev,
                          [test.id]: { ...prev[test.id], heart_rate: e.target.value },
                        }))
                      }
                      className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm px-3 py-2 text-center font-medium"
                    />
                  </div>

                  {/* Blood Pressure - dropdown */}
                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center">
                          <Activity className="w-4 h-4 text-purple-500" />
                        </div>
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          {isAr ? 'ضغط الدم' : 'Blood Pressure'}
                        </span>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-purple-500/15">
                        <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                          {result.blood_pressure || '-'}
                        </span>
                      </div>
                    </div>
                    <select
                      value={result.blood_pressure}
                      onChange={(e) =>
                        setResultsById((prev) => ({
                          ...prev,
                          [test.id]: { ...prev[test.id], blood_pressure: e.target.value },
                        }))
                      }
                      className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm px-3 py-2 text-center font-medium"
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

                {/* Performance Scores - styled sliders */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <RangeSlider
                    label={isAr ? 'سرعة' : 'Speed'}
                    value={Number(result.speed_score) || 0}
                    min={0}
                    max={10}
                    onChange={(val) =>
                      setResultsById((prev) => ({
                        ...prev,
                        [test.id]: { ...prev[test.id], speed_score: String(val) },
                      }))
                    }
                    icon={<Zap className="w-4 h-4" />}
                    color="orange"
                  />
                  <RangeSlider
                    label={isAr ? 'رشاقة' : 'Agility'}
                    value={Number(result.agility_score) || 0}
                    min={0}
                    max={10}
                    onChange={(val) =>
                      setResultsById((prev) => ({
                        ...prev,
                        [test.id]: { ...prev[test.id], agility_score: String(val) },
                      }))
                    }
                    icon={<Wind className="w-4 h-4" />}
                    color="amber"
                  />
                  <RangeSlider
                    label={isAr ? 'توازن' : 'Balance'}
                    value={Number(result.balance_score) || 0}
                    min={0}
                    max={10}
                    onChange={(val) =>
                      setResultsById((prev) => ({
                        ...prev,
                        [test.id]: { ...prev[test.id], balance_score: String(val) },
                      }))
                    }
                    icon={<Scale className="w-4 h-4" />}
                    color="purple"
                  />
                  <RangeSlider
                    label={isAr ? 'قوة' : 'Power'}
                    value={Number(result.power_score) || 0}
                    min={0}
                    max={10}
                    onChange={(val) =>
                      setResultsById((prev) => ({
                        ...prev,
                        [test.id]: { ...prev[test.id], power_score: String(val) },
                      }))
                    }
                    icon={<Activity className="w-4 h-4" />}
                    color="rose"
                  />
                  <RangeSlider
                    label={isAr ? 'رد الفعل' : 'Reaction'}
                    value={Number(result.reaction_score) || 0}
                    min={0}
                    max={10}
                    onChange={(val) =>
                      setResultsById((prev) => ({
                        ...prev,
                        [test.id]: { ...prev[test.id], reaction_score: String(val) },
                      }))
                    }
                    icon={<Target className="w-4 h-4" />}
                    color="sky"
                  />
                  <RangeSlider
                    label={isAr ? 'تناسق' : 'Coordination'}
                    value={Number(result.coordination_score) || 0}
                    min={0}
                    max={10}
                    onChange={(val) =>
                      setResultsById((prev) => ({
                        ...prev,
                        [test.id]: { ...prev[test.id], coordination_score: String(val) },
                      }))
                    }
                    icon={<Move3d className="w-4 h-4" />}
                    color="teal"
                  />
                  <RangeSlider
                    label={isAr ? 'مرونة' : 'Flexibility'}
                    value={Number(result.flexibility_score) || 0}
                    min={0}
                    max={10}
                    onChange={(val) =>
                      setResultsById((prev) => ({
                        ...prev,
                        [test.id]: { ...prev[test.id], flexibility_score: String(val) },
                      }))
                    }
                    icon={<StretchHorizontal className="w-4 h-4" />}
                    color="emerald"
                  />
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
                    className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 text-sm font-semibold hover:from-orange-600 hover:to-amber-600 disabled:opacity-60"
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
                    accent="text-orange-500"
                  />
                  <RadialStat
                    label={isAr ? 'رشاقة' : 'Agility'}
                    value={test.agility_score}
                    accent="text-amber-500"
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
          </div>
        ))}
      </div>
    </div>
  );
}
