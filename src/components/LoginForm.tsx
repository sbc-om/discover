'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import TopNavbar from '@/components/TopNavbar';
import Footer from '@/components/Footer';
import { FullPageLoader } from '@/components/LogoLoader';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

interface LoginFormProps {
  locale: string;
}

export default function LoginForm({ locale }: LoginFormProps) {
  const isAr = locale === 'ar';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

      setRedirecting(true);
      
      const roleName = data?.user?.roleName;
      const destination = roleName === 'player'
        ? `/${locale}/dashboard/profile`
        : roleName === 'coach'
          ? `/${locale}/dashboard/coach`
          : `/${locale}/dashboard`;

      setTimeout(() => {
        window.location.href = destination;
      }, 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {redirecting && <FullPageLoader text={isAr ? 'جاري تسجيل الدخول...' : 'Signing in...'} />}
      </AnimatePresence>

      <div className="min-h-dvh flex flex-col bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 relative">
        {/* Simple Static Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 -left-40 w-60 sm:w-80 h-60 sm:h-80 bg-orange-300/20 dark:bg-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 -right-40 w-60 sm:w-80 h-60 sm:h-80 bg-amber-300/20 dark:bg-amber-500/10 rounded-full blur-3xl" />
        </div>
        
        <TopNavbar locale={locale as 'en' | 'ar'} />
        
        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 pt-20 pb-6 sm:pt-24 sm:pb-12 relative z-10">
          <div 
            className={`w-full max-w-md transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            {/* Card */}
            <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl rounded-2xl shadow-xl border border-zinc-200/50 dark:border-zinc-800 overflow-hidden">
              {/* Header */}
              <div className="px-5 py-5 sm:p-8 text-center border-b border-zinc-100 dark:border-zinc-800">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shadow-sm">
                    <img
                      src="/logo/icon-black.png"
                      alt="DNA"
                      className="w-8 h-8 sm:w-10 sm:h-10 object-contain dark:hidden"
                    />
                    <img
                      src="/logo/icon-white.png"
                      alt="DNA"
                      className="w-8 h-8 sm:w-10 sm:h-10 object-contain hidden dark:block"
                    />
                  </div>
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                  {isAr ? 'تسجيل الدخول' : 'Welcome Back'}
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm">
                  {isAr ? 'مرحباً بك في Discover' : 'Sign in to continue to Discover'}
                </p>
              </div>

              {/* Form */}
              <div className="px-5 py-5 sm:p-8">
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 sm:mb-2">
                      {isAr ? 'البريد الإلكتروني' : 'Email Address'}
                    </label>
                    <div className="relative">
                      <Mail className={`absolute ${isAr ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
                        focusedField === 'email' ? 'text-orange-500' : 'text-zinc-400'
                      }`} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        required
                        autoComplete="email"
                        inputMode="email"
                        className={`w-full ${isAr ? 'pr-11 pl-4' : 'pl-11 pr-4'} py-3 border-2 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-base transition-all duration-200 placeholder:text-zinc-400 ${
                          focusedField === 'email'
                            ? 'border-orange-500 ring-2 ring-orange-500/20'
                            : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                        }`}
                        placeholder={isAr ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 sm:mb-2">
                      {isAr ? 'كلمة المرور' : 'Password'}
                    </label>
                    <div className="relative">
                      <Lock className={`absolute ${isAr ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
                        focusedField === 'password' ? 'text-orange-500' : 'text-zinc-400'
                      }`} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                        required
                        autoComplete="current-password"
                        className={`w-full ${isAr ? 'pr-11 pl-11' : 'pl-11 pr-11'} py-3 border-2 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-base transition-all duration-200 placeholder:text-zinc-400 ${
                          focusedField === 'password'
                            ? 'border-orange-500 ring-2 ring-orange-500/20'
                            : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                        }`}
                        placeholder={isAr ? 'أدخل كلمة المرور' : 'Enter your password'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute ${isAr ? 'left-1' : 'right-1'} top-1/2 -translate-y-1/2 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors rounded-lg active:bg-zinc-100 dark:active:bg-zinc-700`}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="flex items-center gap-3 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
                      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || redirecting}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-3.5 rounded-xl font-semibold text-base transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-70 active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>{isAr ? 'جاري التحقق...' : 'Verifying...'}</span>
                      </>
                    ) : (
                      <>
                        <span>{isAr ? 'تسجيل الدخول' : 'Sign In'}</span>
                        <ArrowRight className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
                      </>
                    )}
                  </button>
                </form>

                {/* Decorative bottom */}
                <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-zinc-200 dark:border-zinc-800">
                  <p className="text-center text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                    {isAr ? 'منصة إدارة الأكاديميات الرياضية' : 'Sports Academy Management Platform'}
                  </p>
                </div>
              </div>
            </div>

            {/* Help text */}
            <p className="text-center text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-4 sm:mt-6 pb-2">
              {isAr ? 'تحتاج مساعدة؟ تواصل مع الدعم الفني' : 'Need help? Contact support'}
            </p>
          </div>
        </div>
        
        {/* Footer */}
        <Footer locale={locale as 'en' | 'ar'} />
      </div>
    </>
  );
}
