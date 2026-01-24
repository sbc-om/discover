'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Bell, CheckCheck, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/components/ToastProvider';
import useLocale from '@/hooks/useLocale';

interface Notification {
  id: string;
  subject: string | null;
  content: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  sender_first_name: string | null;
  sender_last_name: string | null;
  sender_avatar: string | null;
}

const formatDate = (value: string, locale: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString(locale === 'ar' ? 'ar' : 'en', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function NotificationsContent() {
  const { locale } = useLocale();
  const isAr = locale === 'ar';
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetUserId = searchParams.get('user_id');
  const { showToast } = useToast();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const query = targetUserId ? `?user_id=${targetUserId}` : '';
      const response = await fetch(`/api/notifications${query}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to load notifications');
      }
      setNotifications(data.notifications || []);
    } catch (error: any) {
      showToast('error', error.message || (isAr ? 'تعذر تحميل الإشعارات' : 'Failed to load notifications'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      setMarkingId(id);
      const response = await fetch(
        `/api/notifications/${id}${targetUserId ? `?user_id=${targetUserId}` : ''}`,
        {
          method: 'PUT',
        }
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to mark as read');
      }
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n))
      );
    } catch (error: any) {
      showToast('error', error.message || (isAr ? 'تعذر تحديث الإشعار' : 'Failed to update notification'));
    } finally {
      setMarkingId(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAll(true);
      const response = await fetch(
        `/api/notifications/read-all${targetUserId ? `?user_id=${targetUserId}` : ''}`,
        {
          method: 'POST',
        }
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to mark all as read');
      }
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true, read_at: n.read_at || new Date().toISOString() }))
      );
      showToast('success', isAr ? 'تم تحديث جميع الإشعارات' : 'All notifications marked as read');
    } catch (error: any) {
      showToast('error', error.message || (isAr ? 'تعذر تحديث الإشعارات' : 'Failed to update notifications'));
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            if (targetUserId) {
              router.push(`/${locale}/dashboard/players/${targetUserId}`);
              return;
            }
            router.push(`/${locale}/dashboard/profile`);
          }}
          className="h-10 w-10 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
        >
          {isAr ? <ArrowRight className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
        </button>
        <h1 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
          {isAr ? 'الإشعارات' : 'Notifications'}
        </h1>
        <div className="w-10" />
      </div>

      {/* Mark all as read */}
      {unreadCount > 0 && (
        <button
          type="button"
          onClick={handleMarkAllAsRead}
          disabled={markingAll}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition disabled:opacity-50"
        >
          {markingAll ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCheck className="h-4 w-4" />
          )}
          {isAr ? 'تحديد الكل كمقروء' : 'Mark all as read'}
        </button>
      )}

      {/* Notifications list */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-zinc-500">
          {isAr ? 'جاري التحميل...' : 'Loading...'}
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 text-center">
          <Bell className="mx-auto h-10 w-10 text-zinc-300 dark:text-zinc-700" />
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
            {isAr ? 'لا توجد إشعارات' : 'No notifications'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-2xl border p-4 transition ${
                notification.is_read
                  ? 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'
                  : 'border-orange-200 dark:border-orange-900/40 bg-orange-50/50 dark:bg-orange-950/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 shrink-0 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
                  {notification.sender_avatar ? (
                    <img src={notification.sender_avatar} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                      {notification.sender_first_name?.charAt(0)}
                      {notification.sender_last_name?.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 truncate">
                      {notification.subject || (isAr ? 'إشعار' : 'Notification')}
                    </p>
                    <span className="text-[10px] text-zinc-400 whitespace-nowrap">
                      {formatDate(notification.created_at, locale)}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {notification.sender_first_name} {notification.sender_last_name}
                  </p>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap">
                    {notification.content}
                  </p>
                  {!notification.is_read && (
                    <button
                      type="button"
                      onClick={() => handleMarkAsRead(notification.id)}
                      disabled={markingId === notification.id}
                      className="mt-3 flex items-center gap-1.5 text-xs font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 disabled:opacity-50"
                    >
                      {markingId === notification.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <CheckCheck className="h-3 w-3" />
                      )}
                      {isAr ? 'تحديد كمقروء' : 'Mark as read'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
