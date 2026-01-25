'use client';

import { useEffect, useMemo, useState } from 'react';
import { Award, Check, Clock, Loader2, Medal, Package, PackageCheck, Send, Truck, X } from 'lucide-react';
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
  shipping_date?: string | null;
  tracking_number?: string | null;
  delivered_at?: string | null;
  review_notes?: string | null;
  user_id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string | null;
  academy_name?: string | null;
  academy_name_ar?: string | null;
}

type StatusType = 'all' | 'pending' | 'approved' | 'rejected' | 'preparing' | 'shipped' | 'delivered';

const STATUS_CONFIG: Record<string, { label: string; labelAr: string; color: string; bgColor: string; icon: any }> = {
  pending: { label: 'Pending', labelAr: 'قيد الانتظار', color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-900/30', icon: Clock },
  approved: { label: 'Approved', labelAr: 'تمت الموافقة', color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30', icon: Check },
  rejected: { label: 'Rejected', labelAr: 'مرفوض', color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/30', icon: X },
  preparing: { label: 'Preparing', labelAr: 'قيد التحضير', color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/30', icon: Package },
  shipped: { label: 'Shipped', labelAr: 'تم الشحن', color: 'text-indigo-600', bgColor: 'bg-indigo-100 dark:bg-indigo-900/30', icon: Truck },
  delivered: { label: 'Delivered', labelAr: 'تم التسليم', color: 'text-emerald-600', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30', icon: PackageCheck },
};

const MEDAL_TYPES: Record<string, { label: string; labelAr: string; gradient: string }> = {
  gold: { label: 'Gold', labelAr: 'ذهبي', gradient: 'from-yellow-400 to-amber-500' },
  silver: { label: 'Silver', labelAr: 'فضي', gradient: 'from-zinc-300 to-zinc-400' },
  bronze: { label: 'Bronze', labelAr: 'برونزي', gradient: 'from-amber-600 to-orange-700' },
  special: { label: 'Special', labelAr: 'خاص', gradient: 'from-purple-500 to-indigo-600' },
};

export default function MedalRequestsContent() {
  const { locale } = useLocale();
  const isAr = locale === 'ar';
  const { showToast } = useToast();

  const [roleName, setRoleName] = useState<string>('');
  const [players, setPlayers] = useState<PlayerOption[]>([]);
  const [requests, setRequests] = useState<MedalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusType>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    user_id: '',
    medal_type: '',
    achievement_description: '',
  });

  const [updateForm, setUpdateForm] = useState({
    delivery_date: '',
    shipping_date: '',
    tracking_number: '',
    review_notes: '',
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
    if (response.ok) setPlayers(data.users || []);
  };

  const fetchRequests = async () => {
    const response = await fetch('/api/medal-requests');
    const data = await response.json();
    if (response.ok) setRequests(data.requests || []);
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

  const filteredRequests = useMemo(() => {
    if (statusFilter === 'all') return requests;
    return requests.filter(r => r.status === statusFilter);
  }, [requests, statusFilter]);

  const stats = useMemo(() => {
    const counts: Record<string, number> = { all: requests.length };
    requests.forEach(r => { counts[r.status] = (counts[r.status] || 0) + 1; });
    return counts;
  }, [requests]);

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
      if (!response.ok) throw new Error(data.message || 'Failed');
      setForm({ user_id: '', medal_type: '', achievement_description: '' });
      await fetchRequests();
      showToast('success', isAr ? 'تم إرسال الطلب' : 'Request submitted');
    } catch (error: any) {
      showToast('error', error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (requestId: string, newStatus: string) => {
    try {
      setSaving(true);
      const payload: any = { status: newStatus };
      if (newStatus === 'approved' && updateForm.delivery_date) payload.delivery_date = updateForm.delivery_date;
      if (newStatus === 'shipped') {
        payload.shipping_date = updateForm.shipping_date || new Date().toISOString().slice(0, 10);
        payload.tracking_number = updateForm.tracking_number;
      }
      if (updateForm.review_notes) payload.review_notes = updateForm.review_notes;

      const response = await fetch('/api/medal-requests/' + requestId, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed');
      await fetchRequests();
      setExpandedId(null);
      setUpdateForm({ delivery_date: '', shipping_date: '', tracking_number: '', review_notes: '' });
      showToast('success', isAr ? 'تم تحديث الطلب' : 'Request updated');
    } catch (error: any) {
      showToast('error', error.message);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (value?: string | null) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString(isAr ? 'ar' : 'en', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getNextStatus = (current: string): string | null => {
    const flow: Record<string, string> = { pending: 'approved', approved: 'preparing', preparing: 'shipped', shipped: 'delivered' };
    return flow[current] || null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
          <Medal className="h-7 w-7 text-amber-500" />
          {isAr ? 'طلبات الميداليات' : 'Medal Requests'}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          {isAr ? 'إدارة طلبات الميداليات الفيزيائية ومتابعة حالتها.' : 'Manage physical medal requests and track their status.'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {(['all', 'pending', 'approved', 'preparing', 'shipped', 'delivered', 'rejected'] as StatusType[]).map((status) => {
          const config = status === 'all' 
            ? { label: 'All', labelAr: 'الكل', color: 'text-zinc-600', bgColor: 'bg-zinc-100 dark:bg-zinc-800', icon: Award }
            : STATUS_CONFIG[status];
          const Icon = config.icon;
          return (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={'rounded-2xl p-4 text-center transition-all ' + (statusFilter === status
                ? 'ring-2 ring-amber-500 ' + config.bgColor
                : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-amber-300')}
            >
              <Icon className={'h-5 w-5 mx-auto ' + config.color} />
              <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-2">{stats[status] || 0}</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{isAr ? config.labelAr : config.label}</p>
            </button>
          );
        })}
      </div>

      {/* New Request Form */}
      {(roleName === 'academy_manager' || roleName === 'admin') && (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4">
          <div className="flex items-center gap-2 text-base font-bold text-zinc-800 dark:text-zinc-100">
            <Send className="h-5 w-5 text-amber-500" />
            {isAr ? 'طلب ميدالية جديدة' : 'New Medal Request'}
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-500">{isAr ? 'اللاعب' : 'Player'}</label>
              <select value={form.user_id} onChange={(e) => setForm(prev => ({ ...prev, user_id: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm">
                <option value="">{isAr ? 'اختر لاعب' : 'Select player'}</option>
                {players.map((p) => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-500">{isAr ? 'نوع الميدالية' : 'Medal Type'}</label>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(MEDAL_TYPES).map(([value, config]) => (
                  <button key={value} type="button" onClick={() => setForm(prev => ({ ...prev, medal_type: value }))}
                    className={'flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ' + (form.medal_type === value
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                      : 'border-zinc-200 dark:border-zinc-700 hover:border-amber-300')}>
                    <div className={'h-6 w-6 rounded-full bg-gradient-to-br ' + config.gradient} />
                    <span className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400">{isAr ? config.labelAr : config.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-500">{isAr ? 'سبب الميدالية' : 'Reason'}</label>
              <input type="text" value={form.achievement_description} onChange={(e) => setForm(prev => ({ ...prev, achievement_description: e.target.value }))}
                placeholder={isAr ? 'وصف الإنجاز...' : 'Achievement description...'} className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm" />
            </div>
          </div>
          <button type="button" onClick={handleSubmit} disabled={saving || !form.user_id || !form.medal_type}
            className="w-full md:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm disabled:opacity-50 transition flex items-center justify-center gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {isAr ? 'إرسال الطلب' : 'Submit Request'}
          </button>
        </div>
      )}

      {/* Requests List */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-12 text-center">
            <Medal className="h-12 w-12 mx-auto text-zinc-300 dark:text-zinc-700" />
            <p className="mt-4 text-zinc-500">{isAr ? 'لا توجد طلبات' : 'No requests found'}</p>
          </div>
        ) : filteredRequests.map((request) => {
          const statusConfig = STATUS_CONFIG[request.status] || STATUS_CONFIG.pending;
          const StatusIcon = statusConfig.icon;
          const medalConfig = MEDAL_TYPES[request.medal_type] || MEDAL_TYPES.gold;
          const isExpanded = expandedId === request.id;
          const nextStatus = getNextStatus(request.status);

          return (
            <div key={request.id} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
              <div className="p-4 flex items-center gap-4">
                <div className={'h-14 w-14 rounded-2xl bg-gradient-to-br ' + medalConfig.gradient + ' flex items-center justify-center shadow-lg flex-shrink-0'}>
                  <Medal className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-zinc-900 dark:text-white">{request.first_name} {request.last_name}</h3>
                    <span className={'px-2 py-0.5 rounded-full text-[10px] font-bold ' + statusConfig.bgColor + ' ' + statusConfig.color}>
                      {isAr ? statusConfig.labelAr : statusConfig.label}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-500">{isAr ? medalConfig.labelAr : medalConfig.label} • {formatDate(request.requested_date)}</p>
                  {request.achievement_description && <p className="text-xs text-zinc-400 mt-1 line-clamp-1">{request.achievement_description}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <div className={'h-10 w-10 rounded-xl ' + statusConfig.bgColor + ' flex items-center justify-center'}>
                    <StatusIcon className={'h-5 w-5 ' + statusConfig.color} />
                  </div>
                  {roleName === 'admin' && request.status !== 'delivered' && request.status !== 'rejected' && (
                    <button type="button" onClick={() => setExpandedId(isExpanded ? null : request.id)}
                      className="px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 text-xs font-medium hover:bg-zinc-200 transition">
                      {isExpanded ? (isAr ? 'إغلاق' : 'Close') : (isAr ? 'إدارة' : 'Manage')}
                    </button>
                  )}
                </div>
              </div>

              {request.status !== 'rejected' && (
                <div className="px-4 pb-4">
                  <div className="flex items-center gap-1">
                    {['pending', 'approved', 'preparing', 'shipped', 'delivered'].map((step, index) => {
                      const stepIndex = ['pending', 'approved', 'preparing', 'shipped', 'delivered'].indexOf(request.status);
                      const isCompleted = index <= stepIndex;
                      return (
                        <div key={step} className="flex items-center flex-1">
                          <div className={'h-2 flex-1 rounded-full ' + (isCompleted ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-700')} />
                          {index < 4 && <div className="w-1" />}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-1">
                    {['pending', 'approved', 'preparing', 'shipped', 'delivered'].map((step) => (
                      <span key={step} className="text-[9px] text-zinc-400">{isAr ? STATUS_CONFIG[step].labelAr : STATUS_CONFIG[step].label}</span>
                    ))}
                  </div>
                </div>
              )}

              {isExpanded && roleName === 'admin' && (
                <div className="border-t border-zinc-100 dark:border-zinc-800 p-4 bg-zinc-50 dark:bg-zinc-800/50 space-y-4">
                  {request.status === 'pending' && (
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-zinc-500">{isAr ? 'تاريخ التسليم المتوقع' : 'Expected Delivery'}</label>
                        <input type="date" value={updateForm.delivery_date} onChange={(e) => setUpdateForm(prev => ({ ...prev, delivery_date: e.target.value }))}
                          className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-zinc-500">{isAr ? 'ملاحظات' : 'Notes'}</label>
                        <input type="text" value={updateForm.review_notes} onChange={(e) => setUpdateForm(prev => ({ ...prev, review_notes: e.target.value }))}
                          placeholder={isAr ? 'ملاحظات...' : 'Notes...'} className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm" />
                      </div>
                    </div>
                  )}
                  {(request.status === 'approved' || request.status === 'preparing') && (
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-zinc-500">{isAr ? 'رقم التتبع' : 'Tracking Number'}</label>
                        <input type="text" value={updateForm.tracking_number} onChange={(e) => setUpdateForm(prev => ({ ...prev, tracking_number: e.target.value }))}
                          className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-zinc-500">{isAr ? 'تاريخ الشحن' : 'Shipping Date'}</label>
                        <input type="date" value={updateForm.shipping_date} onChange={(e) => setUpdateForm(prev => ({ ...prev, shipping_date: e.target.value }))}
                          className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm" />
                      </div>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {request.status === 'pending' && (
                      <>
                        <button type="button" onClick={() => handleUpdateStatus(request.id, 'approved')} disabled={saving || !updateForm.delivery_date}
                          className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                          <Check className="h-4 w-4" />{isAr ? 'موافقة' : 'Approve'}
                        </button>
                        <button type="button" onClick={() => handleUpdateStatus(request.id, 'rejected')} disabled={saving}
                          className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                          <X className="h-4 w-4" />{isAr ? 'رفض' : 'Reject'}
                        </button>
                      </>
                    )}
                    {nextStatus && request.status !== 'pending' && (
                      <button type="button" onClick={() => handleUpdateStatus(request.id, nextStatus)} disabled={saving}
                        className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        {isAr ? 'تحويل إلى: ' + STATUS_CONFIG[nextStatus].labelAr : 'Move to: ' + STATUS_CONFIG[nextStatus].label}
                      </button>
                    )}
                  </div>
                  {(request.delivery_date || request.shipping_date || request.tracking_number) && (
                    <div className="pt-3 border-t border-zinc-200 dark:border-zinc-700 grid gap-2 md:grid-cols-3 text-xs">
                      {request.delivery_date && <div><span className="text-zinc-400">{isAr ? 'التسليم:' : 'Delivery:'}</span> <span className="text-zinc-700 dark:text-zinc-300">{formatDate(request.delivery_date)}</span></div>}
                      {request.shipping_date && <div><span className="text-zinc-400">{isAr ? 'الشحن:' : 'Shipped:'}</span> <span className="text-zinc-700 dark:text-zinc-300">{formatDate(request.shipping_date)}</span></div>}
                      {request.tracking_number && <div><span className="text-zinc-400">{isAr ? 'التتبع:' : 'Tracking:'}</span> <span className="text-zinc-700 dark:text-zinc-300 font-mono">{request.tracking_number}</span></div>}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
