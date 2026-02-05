'use client';

import { SkeletonLoader } from '@/components/LogoLoader';

// Reusable Dashboard Layout Skeleton
export function DashboardLayoutSkeleton({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <SkeletonLoader variant="circular" width={40} height={40} />
            <SkeletonLoader variant="text" width={100} className="h-5 hidden sm:block" />
          </div>
          <div className="flex items-center gap-2">
            <SkeletonLoader variant="circular" width={36} height={36} />
            <SkeletonLoader variant="circular" width={36} height={36} />
            <SkeletonLoader variant="circular" width={40} height={40} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6">
        <div className="container mx-auto max-w-7xl">
          {children}
        </div>
      </main>

      {/* Bottom Dock Skeleton */}
      <div className="sticky bottom-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-800 p-3">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonLoader key={i} variant="circular" width={44} height={44} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Stats Card Skeleton
export function StatsCardSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between mb-3">
        <SkeletonLoader variant="circular" width={44} height={44} />
        <SkeletonLoader variant="text" width={50} className="h-4" />
      </div>
      <SkeletonLoader variant="text" width="50%" className="h-7 mb-1" />
      <SkeletonLoader variant="text" width="70%" className="h-4" />
    </div>
  );
}

// Content Card Skeleton
export function ContentCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 ${className}`}>
      <div className="flex items-center gap-4 mb-4">
        <SkeletonLoader variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <SkeletonLoader variant="text" width="60%" className="h-5" />
          <SkeletonLoader variant="text" width="40%" className="h-3" />
        </div>
      </div>
      <SkeletonLoader variant="rectangular" height={100} className="rounded-lg mb-4" />
      <div className="space-y-2">
        <SkeletonLoader variant="text" width="100%" className="h-4" />
        <SkeletonLoader variant="text" width="80%" className="h-4" />
      </div>
    </div>
  );
}

// Table Skeleton
export function TableSkeletonCompact({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
      {/* Header */}
      <div className="flex gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800 mb-4">
        {Array.from({ length: columns }).map((_, i) => (
          <SkeletonLoader key={i} variant="text" className="flex-1 h-4" />
        ))}
      </div>
      {/* Rows */}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <SkeletonLoader key={colIndex} variant="text" className="flex-1 h-4" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Page Header Skeleton
export function PageHeaderSkeleton({ hasButton = true }: { hasButton?: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <SkeletonLoader variant="text" width={180} className="h-8 mb-2" />
        <SkeletonLoader variant="text" width={280} className="h-4" />
      </div>
      {hasButton && (
        <SkeletonLoader variant="rectangular" width={140} height={40} className="rounded-xl" />
      )}
    </div>
  );
}
