'use client';

import { useEffect, useMemo, useState } from 'react';
import { Award, Loader2, Send, User } from 'lucide-react';
import useLocale from '@/hooks/useLocale';
import { useToast } from '@/components/ToastProvider';

interface PlayerOption {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string | null;
}

interface MedalRequest {
  id: string;
  medal_type: string;
  achievement_description?: string | null;
  status: string;
  requested_date: string;
  delivery_date?: string | null;
  user_id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string | null;
  academy_name?: string | null;
  academy_name_ar?: string | null;
}

export default function MedalRequestsContent() {
  const { locale } = useLocale();
  const isAr = locale === 'ar';
  const { showToast } = useToast();

  const [roleName, setRoleName] = useState<string>('');
  const [players, setPlayers] = useState<PlayerOption[]>([]);
  const [requests, setRequests] = useState<MedalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deliveryDates, setDeliveryDates] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    user_id: '',
    medal_type: '',
    achievement_description: '',
  });

  const fetchRole = async () => {
    const response = await fetch('/api/auth/me');
    if (!response.ok) return;
    const data = await response.json();
    setRoleName(data.roleName || '');
  };

  const fetchPlayers = async () => {
    const response = await fetch('/api/users?role=player&limit=200');
    const data = await response.json();
    if (response.ok) {
      setPlayers(data.users || []);
    }
  };

  const fetchRequests = async () => {
    const response = await fetch('/api/medal-requests');
    const data = await response.json();
    if (response.ok) {
      setRequests(data.requests || []);
      const dates = (data.requests || []).reduce((acc: Record<string, string>, request: MedalRequest) => {
        acc[request.id] = request.delivery_date || '';
        return acc;
      }, {});
      setDeliveryDates(dates);
    }
  };

  useEffect(() => {
    const boot = async () => {
      setLoading(true);
      await fetchRole();
      await fetchPlayers();
      await fetchRequests();
      setLoading(false);
    };
    boot();
  }, []);

  const handleSubmit = async () => {
    if (!form.user_id || !form.medal_type) {
      showToast('error', isAr ? 'اختر اللاعب ونوع الميدالية' : 'Select player and medal type');
      return;
    }
    try {
      setSaving(true);
      const response = await fetch('/api/medal-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit request');
      }
      setForm({ user_id: '', medal_type: '', achievement_description: '' });
      await fetchRequests();
      showToast('success', isAr ? 'تم إرسال الطلب' : 'Request submitted');
    } catch (error: any) {
      showToast('error', error.message || (isAr ? 'تعذر إرسال الطلب' : 'Failed to submit request'));
    } finally {
      setSaving(false);
    }
  };

  const medalOptions = useMemo(() => (
    [
      { value: 'gold', label: isAr ? 'ذهبية' : 'Gold' },
      { value: 'silver', label: isAr ? 'فضية' : 'Silver' },
      { value: 'bronze', label: isAr ? 'برونزية' : 'Bronze' },
    ]
  ), [isAr]);

  const formatDate = (value?: string | null) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString(isAr ? 'ar' : 'en');
  };

  const handleUpdateRequest = async (requestId: string, status: 'approved' | 'rejected') => {
    const deliveryDate = deliveryDates[requestId];
    if (status === 'approved' && !deliveryDate) {
      showToast('error', isAr ? 'حدد تاريخ التسليم أولاً' : 'Select a delivery date first');
      return;
    }
    try {
      setSaving(true);
      const response = await fetch(`/api/medal-requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          delivery_date: deliveryDate || null,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update request');
      }
      await fetchRequests();
      showToast('success', isAr ? 'تم تحديث الطلب' : 'Request updated');
    } catch (error: any) {
      showToast('error', error.message || (isAr ? 'تعذر تحديث الطلب' : 'Failed to update request'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-zinc-500">
        {isAr ? 'جاري التحميل...' : 'Loading...'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          {isAr ? 'طلبات الميداليات' : 'Medal Requests'}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {isAr ? 'إرسال طلبات الميداليات ومتابعتها.' : 'Submit medal requests and track them.'}
        </p>
      </div>

      {roleName === 'academy_manager' && (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-zinc-100">
            <Award className="h-4 w-4" />
            {isAr ? 'طلب جديد' : 'New request'}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">{isAr ? 'اللاعب' : 'Player'}</label>
              <select
                value={form.user_id}
                onChange={(e) => setForm((prev) => ({ ...prev, user_id: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm"
              >
                <option value="">{isAr ? 'اختر لاعب' : 'Select player'}</option>
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.first_name} {player.last_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">{isAr ? 'نوع الميدالية' : 'Medal type'}</label>
              <select
                value={form.medal_type}
                onChange={(e) => setForm((prev) => ({ ...prev, medal_type: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm"
              >
                <option value="">{isAr ? 'اختر نوع الميدالية' : 'Select type'}</option>
                {medalOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">{isAr ? 'الإنجاز' : 'Achievement'}</label>
            <textarea
              value={form.achievement_description}
              onChange={(e) => setForm((prev) => ({ ...prev, achievement_description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {isAr ? 'إرسال الطلب' : 'Submit request'}
          </button>
        </div>
      )}

      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          <User className="h-4 w-4" />
          {isAr ? 'الطلبات' : 'Requests'}
        </div>
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {requests.length === 0 ? (
            <div className="p-6 text-sm text-zinc-500 dark:text-zinc-400">
              {isAr ? 'لا توجد طلبات بعد.' : 'No requests yet.'}
            </div>
          ) : (
            requests.map((request) => (
              <div key={request.id} className="p-4 flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
                      {request.avatar_url ? (
                        <img src={request.avatar_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-4 w-4 text-zinc-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                        {request.first_name} {request.last_name}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {request.medal_type} · {request.status}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
                    <p>{isAr ? 'تاريخ الطلب:' : 'Requested:'} {formatDate(request.requested_date)}</p>
                    <p>{isAr ? 'تاريخ التسليم:' : 'Delivery:'} {formatDate(request.delivery_date)}</p>
                  </div>
                </div>

                {request.achievement_description && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-3xl">
                    {request.achievement_description}
                  </p>
                )}

                {roleName === 'admin' && request.status === 'pending' && (
                  <div className="flex flex-col md:flex-row md:items-center gap-3">
                    <div className="flex-1">
                      <label className="block text-xs text-zinc-500 mb-1">
                        {isAr ? 'تاريخ التسليم' : 'Delivery date'}
                      </label>
                      <input
                        type="date"
                        value={deliveryDates[request.id] || ''}
                        onChange={(e) =>
                          setDeliveryDates((prev) => ({ ...prev, [request.id]: e.target.value }))
                        }
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpdateRequest(request.id, 'approved')}
                        disabled={saving}
                        className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold disabled:opacity-50"
                      >
                        {isAr ? 'قبول' : 'Approve'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateRequest(request.id, 'rejected')}
                        disabled={saving}
                        className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold disabled:opacity-50"
                      >
                        {isAr ? 'رفض' : 'Reject'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
