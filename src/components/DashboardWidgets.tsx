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
    <div className={`rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 ${className}`}>
      <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
        <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">{title}</h2>
        {action && (
          <button
            onClick={action.onClick}
            className="text-xs font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 transition-colors"
          >
            {action.label}
          </button>
        )}
      </div>
      <div className="p-4">{children}</div>
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
      className="w-full text-left rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-md transition-all group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="h-10 w-10 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30 transition-colors">
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
              {isAr && titleAr ? titleAr : title}
            </p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-2xl font-bold text-zinc-900 dark:text-white">{count}</span>
              {overdueCount !== undefined && overdueCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-semibold">
                  {overdueCount} {isAr ? 'متأخر' : 'overdue'}
                </span>
              )}
              {dueTodayCount !== undefined && dueTodayCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-semibold">
                  {dueTodayCount} {isAr ? 'اليوم' : 'today'}
                </span>
              )}
            </div>
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
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="h-16 w-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 flex items-center justify-center mb-4">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1">{title}</h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-4">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium transition-colors"
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
    success: 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300',
    warning: 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300',
    info: 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300',
  };

  const iconVariants = {
    success: 'text-emerald-600 dark:text-emerald-400',
    warning: 'text-amber-600 dark:text-amber-400',
    info: 'text-blue-600 dark:text-blue-400',
  };

  return (
    <div className={`rounded-xl border p-4 ${variants[variant]}`}>
      <div className="flex items-center gap-3">
        <Icon className={`h-5 w-5 shrink-0 ${iconVariants[variant]}`} />
        <p className="text-sm font-medium">{message}</p>
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
      className={`rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 ${
        onClick ? 'hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-sm transition-all cursor-pointer' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-zinc-900 dark:text-white">{value}</p>
            {trend && (
              <span className={`text-xs font-medium ${trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
            )}
          </div>
        </div>
        <div className="h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Component>
  );
}
