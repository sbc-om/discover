'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';

export type ToastType = 'error' | 'success' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  progress: number;
}

interface ToastContextValue {
  showToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);
const TOAST_DURATION = 4000;

function randomId() {
  return Math.random().toString(36).slice(2, 10);
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const content = (
    <div className="fixed bottom-24 sm:bottom-8 left-1/2 -translate-x-1/2 z-[99999] flex flex-col-reverse items-center gap-3 pointer-events-none w-full px-4">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="pointer-events-auto w-full max-w-sm"
            onClick={() => removeToast(toast.id)}
          >
            <div
              className={`relative overflow-hidden rounded-2xl shadow-2xl ${
                toast.type === 'error'
                  ? 'bg-gradient-to-r from-red-600 to-rose-600'
                  : toast.type === 'success'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600'
                  : 'bg-gradient-to-r from-zinc-700 to-zinc-800'
              }`}
            >
              <div className="flex items-center gap-3 px-4 py-3.5 text-white">
                <div className="shrink-0">
                  {toast.type === 'error' ? (
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                  ) : toast.type === 'success' ? (
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <Info className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <p className="text-sm font-medium flex-1 leading-snug">{toast.message}</p>
              </div>
              {/* Progress bar */}
              <div className="h-1 bg-black/10">
                <motion.div
                  className="h-full bg-white/30"
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: TOAST_DURATION / 1000, ease: 'linear' }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );

  return createPortal(content, document.body);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = randomId();
    setToasts((prev) => [...prev, { id, type, message, progress: 100 }]);
    setTimeout(() => removeToast(id), TOAST_DURATION);
  }, [removeToast]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}
