'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TopNavbar from '@/components/TopNavbar';
import Footer from '@/components/Footer';
import ScrollArea from '@/components/ScrollArea';

interface LoginFormProps {
  locale: string;
}

export default function LoginForm({ locale }: LoginFormProps) {
  const isAr = locale === 'ar';
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json().catch(() => ({}));
      
      if (!res.ok) {
        throw new Error(data?.message || 'Login failed');
      }

      // Force a full page navigation to ensure server-side session is read
      window.location.href = `/${locale}/dashboard`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollArea className="min-h-screen bg-gradient-to-br from-white via-zinc-50 to-zinc-100 dark:from-black dark:via-zinc-950 dark:to-zinc-900">
      <TopNavbar locale={locale as 'en' | 'ar'} />
      <div className="flex items-center justify-center p-6 py-16">
      <div className="w-full max-w-md bg-white dark:bg-zinc-950 rounded-2xl shadow-xl p-8 border border-zinc-200/80 dark:border-zinc-800 ltr:text-left rtl:text-right">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4">
            <img
              src="/logo/icon-black.png"
              alt="DNA"
              className="w-full h-full object-contain dark:hidden"
            />
            <img
              src="/logo/logo-white.png"
              alt="DNA"
              className="w-full h-full object-contain hidden dark:block"
            />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{isAr ? 'تسجيل الدخول' : 'Sign In'}</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">{isAr ? 'اكتشف قدرتك الطبيعية' : 'Discover Natural Ability'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              {isAr ? 'البريد الإلكتروني' : 'Email'}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
              placeholder={isAr ? 'البريد الإلكتروني' : 'Email'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              {isAr ? 'كلمة المرور' : 'Password'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
              placeholder={isAr ? 'كلمة المرور' : 'Password'}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white dark:bg-white dark:text-black py-3 rounded-lg font-semibold hover:bg-zinc-900 dark:hover:bg-zinc-100 transition-colors disabled:opacity-50"
          >
            {loading ? (isAr ? 'جاري التحميل...' : 'Loading...') : (isAr ? 'تسجيل الدخول' : 'Sign In')}
          </button>
        </form>
      </div>
      </div>
      <Footer locale={locale as 'en' | 'ar'} />
    </ScrollArea>
  );
}
