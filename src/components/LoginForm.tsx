'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import TopNavbar from '@/components/TopNavbar';
import Footer from '@/components/Footer';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';

interface LoginFormProps {
  locale: string;
}

// Professional Logo Loading Component - Simple with shake
const LogoLoader = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' | 'xl' }) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <motion.div
        className="relative"
        animate={{
          rotate: [0, -2, 2, -2, 2, 0],
          scale: [1, 1.02, 1, 1.02, 1],
        }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          repeatDelay: 0.8,
          ease: "easeInOut",
        }}
      >
        {/* Subtle glow behind logo */}
        <motion.div
          className={`absolute inset-0 ${sizeClasses[size]} rounded-2xl bg-gradient-to-br from-orange-500/30 to-amber-500/30 blur-2xl`}
          animate={{ 
            opacity: [0.3, 0.6, 0.3],
            scale: [0.8, 1.1, 0.8],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Logo */}
        <img
          src="/logo/icon-black.png"
          alt="Loading"
          className={`${sizeClasses[size]} object-contain relative z-10 dark:hidden`}
        />
        <img
          src="/logo/icon-white.png"
          alt="Loading"
          className={`${sizeClasses[size]} object-contain relative z-10 hidden dark:block`}
        />
      </motion.div>
    </div>
  );
};

// Full page loading overlay - Clean and simple
const FullPageLoader = ({ isAr }: { isAr: boolean }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] bg-white dark:bg-zinc-950 flex items-center justify-center"
  >
    <div className="text-center">
      <LogoLoader size="xl" />
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 text-sm font-medium text-zinc-400 dark:text-zinc-500"
      >
        {isAr ? 'جاري تسجيل الدخول...' : 'Signing in...'}
      </motion.p>
    </div>
  </motion.div>
);



export default function LoginForm({ locale }: LoginFormProps) {
  const isAr = locale === 'ar';
  const router = useRouter();
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

      // Small delay for animation
      setTimeout(() => {
        window.location.href = destination;
      }, 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {redirecting && <FullPageLoader isAr={isAr} />}
      </AnimatePresence>

      <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          {/* Gradient orbs */}
          <motion.div
            className="absolute top-0 -left-40 w-80 h-80 bg-orange-300/30 dark:bg-orange-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 30, 0],
              y: [0, -20, 0],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-0 -right-40 w-80 h-80 bg-amber-300/30 dark:bg-amber-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              x: [0, -30, 0],
              y: [0, 20, 0],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-200/20 dark:bg-orange-600/5 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 180, 360],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
        </div>
        
        <TopNavbar locale={locale as 'en' | 'ar'} />
        
        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-6 pt-24 pb-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 30 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-xl"
          >
            {/* Card */}
            <motion.div
              className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-zinc-200/50 dark:border-zinc-800 overflow-hidden"
              whileHover={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)" }}
              transition={{ duration: 0.3 }}
            >
              {/* Header - Clean & Simple */}
              <div className="p-8 text-center border-b border-zinc-100 dark:border-zinc-800">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                  className="relative w-20 h-20 mx-auto mb-5"
                >
                  {/* Subtle glow */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 blur-xl"
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shadow-sm">
                    <img
                      src="/logo/icon-black.png"
                      alt="DNA"
                      className="w-12 h-12 object-contain dark:hidden"
                    />
                    <img
                      src="/logo/icon-white.png"
                      alt="DNA"
                      className="w-12 h-12 object-contain hidden dark:block"
                    />
                  </div>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-1"
                >
                  {isAr ? 'تسجيل الدخول' : 'Welcome Back'}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-zinc-500 dark:text-zinc-400 text-sm"
                >
                  {isAr ? 'مرحباً بك في Discover' : 'Sign in to continue to Discover'}
                </motion.p>
              </div>

              {/* Form */}
              <div className="p-8 md:p-10 pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Field */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                      {isAr ? 'البريد الإلكتروني' : 'Email Address'}
                    </label>
                    <div className="relative">
                      <motion.div
                        className={`absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 opacity-0 blur transition-opacity duration-300 ${
                          focusedField === 'email' ? 'opacity-20' : ''
                        }`}
                      />
                      <div className="relative">
                        <Mail className={`absolute ${isAr ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                          focusedField === 'email' ? 'text-orange-500' : 'text-zinc-400'
                        }`} />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onFocus={() => setFocusedField('email')}
                          onBlur={() => setFocusedField(null)}
                          required
                          className={`w-full ${isAr ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3.5 border-2 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 transition-all duration-300 placeholder:text-zinc-400 ${
                            focusedField === 'email'
                              ? 'border-orange-500 ring-4 ring-orange-500/10'
                              : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                          }`}
                          placeholder={isAr ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* Password Field */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                      {isAr ? 'كلمة المرور' : 'Password'}
                    </label>
                    <div className="relative">
                      <motion.div
                        className={`absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 opacity-0 blur transition-opacity duration-300 ${
                          focusedField === 'password' ? 'opacity-20' : ''
                        }`}
                      />
                      <div className="relative">
                        <Lock className={`absolute ${isAr ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                          focusedField === 'password' ? 'text-orange-500' : 'text-zinc-400'
                        }`} />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onFocus={() => setFocusedField('password')}
                          onBlur={() => setFocusedField(null)}
                          required
                          className={`w-full ${isAr ? 'pr-12 pl-12' : 'pl-12 pr-12'} py-3.5 border-2 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 transition-all duration-300 placeholder:text-zinc-400 ${
                            focusedField === 'password'
                              ? 'border-orange-500 ring-4 ring-orange-500/10'
                              : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                          }`}
                          placeholder={isAr ? 'أدخل كلمة المرور' : 'Enter your password'}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className={`absolute ${isAr ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors`}
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </motion.div>

                  {/* Error Message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex items-center gap-3 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                          <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 0.5, repeat: 2 }}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          </motion.div>
                          <span>{error}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <motion.button
                      type="submit"
                      disabled={loading || redirecting}
                      className="relative w-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white py-4 rounded-xl font-bold text-lg overflow-hidden group disabled:cursor-not-allowed disabled:opacity-70"
                      whileHover={{ scale: loading ? 1 : 1.02 }}
                      whileTap={{ scale: loading ? 1 : 0.98 }}
                    >
                      {/* Animated shine effect */}
                      {!loading && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                          initial={{ x: '-100%' }}
                          animate={{ x: '200%' }}
                          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                        />
                      )}
                      
                      <span className="relative flex items-center justify-center gap-3">
                        {loading ? (
                          <>
                            <motion.div
                              animate={{ rotate: [0, -3, 3, -3, 3, 0] }}
                              transition={{ duration: 0.4, repeat: Infinity, repeatDelay: 0.5 }}
                            >
                              <img src="/logo/icon-white.png" alt="" className="w-6 h-6" />
                            </motion.div>
                            <span>{isAr ? 'جاري التحقق...' : 'Verifying...'}</span>
                          </>
                        ) : (
                          <>
                            <span>{isAr ? 'تسجيل الدخول' : 'Sign In'}</span>
                            <motion.div
                              animate={{ x: [0, 5, 0] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            >
                              <ArrowRight className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
                            </motion.div>
                          </>
                        )}
                      </span>
                    </motion.button>
                  </motion.div>
                </form>

                {/* Decorative bottom */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800"
                >
                  <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
                    {isAr ? 'منصة إدارة الأكاديميات الرياضية' : 'Sports Academy Management Platform'}
                  </p>
                  <div className="flex justify-center items-center gap-2 mt-3">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Floating help text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-6"
            >
              {isAr ? 'تحتاج مساعدة؟ تواصل مع الدعم الفني' : 'Need help? Contact support'}
            </motion.p>
          </motion.div>
        </div>
        
        {/* Footer */}
        <Footer locale={locale as 'en' | 'ar'} />
      </div>
    </>
  );
}
