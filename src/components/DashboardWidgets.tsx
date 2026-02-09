import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface DashboardWidgetProps {
  title: string;
  children: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function DashboardWidget({ title, children, action, className = '' }: DashboardWidgetProps) {
  return (
    <div className={`rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-sm ${className}`}>
      <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-4 border-b border-zinc-100 dark:border-zinc-800/60">
        <h2 className="text-base sm:text-lg font-semibold text-zinc-800 dark:text-zinc-100">{title}</h2>
        {action && (
          <button
            onClick={action.onClick}
            className="text-xs font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 transition-colors px-2.5 py-1 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-950/20 active:scale-95"
          >
            {action.label}
          </button>
        )}
      </div>
      <div className="p-3 sm:p-4">{children}</div>
    </div>
  );
}

interface PriorityBadgeProps {
  priority: 'high' | 'medium' | 'low';
  isAr?: boolean;
}

export function PriorityBadge({ priority, isAr = false }: PriorityBadgeProps) {
  const labels = {
    high: isAr ? 'عالية' : 'High',
    medium: isAr ? 'متوسطة' : 'Medium',
    low: isAr ? 'منخفضة' : 'Low',
  };

  const colors = {
    high: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
    medium: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
    low: 'bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${colors[priority]}`}>
      {labels[priority]}
    </span>
  );
}

interface ActionItemCardProps {
  title: string;
  titleAr?: string;
  count: number;
  priority: 'high' | 'medium' | 'low';
  icon: LucideIcon;
  onClick: () => void;
  overdueCount?: number;
  dueTodayCount?: number;
  isAr?: boolean;
}

export function ActionItemCard({
  title,
  titleAr,
  count,
  priority,
  icon: Icon,
  onClick,
  overdueCount,
  dueTodayCount,
  isAr = false,
}: ActionItemCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 p-3 sm:p-4 hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-md transition-all group active:scale-[0.99]"
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 group-hover:from-orange-100 group-hover:to-amber-100 dark:group-hover:from-orange-900/30 dark:group-hover:to-amber-900/30 transition-all">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
            {isAr && titleAr ? titleAr : title}
          </p>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 flex-wrap">
            <span className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">{count}</span>
            {overdueCount !== undefined && overdueCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-semibold">
                {overdueCount} {isAr ? 'متأخر' : 'overdue'}
              </span>
            )}
            {dueTodayCount !== undefined && dueTodayCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-semibold">
                {dueTodayCount} {isAr ? 'اليوم' : 'today'}
              </span>
            )}
          </div>
        </div>
        <PriorityBadge priority={priority} isAr={isAr} />
      </div>
    </button>
  );
}

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center px-4">
      <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 dark:text-emerald-400 flex items-center justify-center mb-3 sm:mb-4">
        <Icon className="h-7 w-7 sm:h-8 sm:w-8" />
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-white mb-1">{title}</h3>
      <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-4">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium transition-colors active:scale-95"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

interface SummaryBannerProps {
  message: string;
  variant: 'success' | 'warning' | 'info';
  icon: LucideIcon;
}

export function SummaryBanner({ message, variant, icon: Icon }: SummaryBannerProps) {
  const variants = {
    success: 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200/70 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300',
    warning: 'bg-amber-50 dark:bg-amber-900/10 border-amber-200/70 dark:border-amber-800/50 text-amber-800 dark:text-amber-300',
    info: 'bg-blue-50 dark:bg-blue-900/10 border-blue-200/70 dark:border-blue-800/50 text-blue-800 dark:text-blue-300',
  };

  const iconVariants = {
    success: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30',
    warning: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30',
    info: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
  };

  return (
    <div className={`rounded-xl border px-3 py-3 sm:px-4 sm:py-3.5 ${variants[variant]}`}>
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div className={`h-8 w-8 sm:h-9 sm:w-9 rounded-lg flex items-center justify-center shrink-0 ${iconVariants[variant]}`}>
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <p className="text-xs sm:text-sm font-medium leading-snug">{message}</p>
      </div>
    </div>
  );
}

interface QuickStatProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
}

export function QuickStat({ label, value, icon: Icon, trend, onClick }: QuickStatProps) {
  const Component = onClick ? 'button' : 'div';
  
  return (
    <Component
      onClick={onClick}
      className={`rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 p-3 sm:p-4 shadow-sm ${
        onClick ? 'hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-md transition-all cursor-pointer active:scale-[0.98]' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mb-0.5 sm:mb-1 truncate">{label}</p>
          <div className="flex items-baseline gap-1.5">
            <p className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">{value}</p>
            {trend && (
              <span className={`text-[10px] sm:text-xs font-medium ${trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
            )}
          </div>
        </div>
        <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-50 dark:from-zinc-800 dark:to-zinc-800/50 text-zinc-600 dark:text-zinc-400 flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
      </div>
    </Component>
  );
}
