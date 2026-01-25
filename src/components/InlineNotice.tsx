'use client';

import { X, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

type NoticeType = 'error' | 'success' | 'info';

interface InlineNoticeProps {
  type?: NoticeType;
  message: string;
  onClose?: () => void;
}

export default function InlineNotice({ type = 'info', message, onClose }: InlineNoticeProps) {
  const styles = {
    error: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200',
    success: 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/40 dark:bg-orange-900/20 dark:text-orange-200',
    info: 'border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-200'
  } as const;

  const icons = {
    error: <AlertTriangle className="w-4 h-4" />,
    success: <CheckCircle2 className="w-4 h-4" />,
    info: <Info className="w-4 h-4" />
  } as const;

  return (
    <div className={`w-full border rounded-xl px-4 py-3 flex items-start gap-3 ${styles[type]}`}>
      <div className="mt-0.5">{icons[type]}</div>
      <p className="text-sm font-medium flex-1">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
