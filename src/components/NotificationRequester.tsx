'use client';

import { useEffect, useState } from 'react';
import useLocale from '@/hooks/useLocale';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function NotificationRequester() {
  const { locale } = useLocale();
  const isAr = locale === 'ar';
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [supported, setSupported] = useState(true);
  const [configMissing, setConfigMissing] = useState(false);

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setSupported(false);
      return;
    }

    setPermission(Notification.permission);

    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) {
      setConfigMissing(true);
      return;
    }

    const requestPermission = async () => {
      if (Notification.permission === 'default') {
        const result = await Notification.requestPermission();
        setPermission(result);
        if (result === 'granted') {
          await registerAndSubscribe(publicKey);
        }
      } else if (Notification.permission === 'granted') {
        await registerAndSubscribe(publicKey);
      }
    };

    requestPermission();
  }, []);

  const registerAndSubscribe = async (publicKey: string) => {
    const registration = await navigator.serviceWorker.register('/sw.js');
    const existing = await registration.pushManager.getSubscription();

    const subscription = existing || await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey)
    });

    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        userAgent: navigator.userAgent
      })
    });
  };

  if (!supported) return null;

  if (permission === null) return null;

  if (configMissing) {
    return (
      <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-300">
        {isAr ? 'إعدادات إشعارات المتصفح غير مكتملة' : 'Browser push notifications are not configured'}
      </div>
    );
  }

  if (permission === 'granted') return null;

  return (
    <div className="mb-4 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700 dark:border-orange-900/40 dark:bg-orange-900/20 dark:text-orange-300">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <span>
          {isAr
            ? 'الرجاء تفعيل إشعارات المتصفح لتلقي الرسائل'
            : 'Please enable browser notifications to receive messages'}
        </span>
        <button
          type="button"
          onClick={async () => {
            const result = await Notification.requestPermission();
            setPermission(result);
            if (result === 'granted') {
              const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
              if (publicKey) {
                await registerAndSubscribe(publicKey);
              }
            }
          }}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-medium hover:from-orange-600 hover:to-amber-600"
        >
          {isAr ? 'طلب الإذن' : 'Request permission'}
        </button>
      </div>
    </div>
  );
}
