'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TopNavbar from '@/components/TopNavbar';
import Footer from '@/components/Footer';

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

      const roleName = data?.user?.roleName;
      const destination = roleName === 'player'
        ? `/${locale}/dashboard/profile`
        : roleName === 'coach'
          ? `/${locale}/dashboard/coach`
          : `/${locale}/dashboard`;

      // Force a full page navigation to ensure server-side session is read
      window.location.href = destination;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-zinc-950 dark:via-orange-950/20 dark:to-zinc-950">
      <TopNavbar locale={locale as 'en' | 'ar'} />
      
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6 pt-24 pb-12">
        <div className="w-full max-w-xl">
          {/* Card */}
          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-orange-200/50 dark:border-orange-900/30 overflow-hidden">
            {/* Header with Gradient */}
            <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 p-8 text-white text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white flex items-center justify-center">
                <img
                  src="/logo/icon-black.png"
                  alt="DNA"
                  className="w-12 h-12 object-contain"
                />
              </div>
              <h1 className="text-3xl font-bold mb-2">{isAr ? 'تسجيل الدخول' : 'Sign In'}</h1>
              <p className="text-orange-100 text-sm">{isAr ? 'مرحباً بك في Discover' : 'Welcome to Discover'}</p>
            </div>

            {/* Form */}
            <div className="p-8 md:p-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                    {isAr ? 'البريد الإلكتروني' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3.5 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all placeholder:text-zinc-400"
                    placeholder={isAr ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                    {isAr ? 'كلمة المرور' : 'Password'}
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3.5 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all placeholder:text-zinc-400"
                    placeholder={isAr ? 'أدخل كلمة المرور' : 'Enter your password'}
                  />
                </div>

                {error && (
                  <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white py-4 rounded-xl font-bold text-lg hover:from-orange-600 hover:via-amber-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {isAr ? 'جاري التحميل...' : 'Loading...'}
                    </span>
                  ) : (
                    isAr ? 'تسجيل الدخول' : 'Sign In'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer locale={locale as 'en' | 'ar'} />
    </div>
  );
}
