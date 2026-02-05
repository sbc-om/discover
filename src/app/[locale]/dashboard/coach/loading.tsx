'use client';

import { 
  DashboardLayoutSkeleton, 
  StatsCardSkeleton,
  ContentCardSkeleton
} from '@/components/DashboardSkeleton';
import { SkeletonLoader } from '@/components/LogoLoader';

export default function CoachLoading() {
  return (
    <DashboardLayoutSkeleton>
      <div className="space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Schedule */}
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-6">
              <SkeletonLoader variant="text" width={140} className="h-6" />
              <div className="flex items-center gap-2">
                <SkeletonLoader variant="rectangular" width={36} height={36} className="rounded-lg" />
                <SkeletonLoader variant="text" width={100} className="h-5" />
                <SkeletonLoader variant="rectangular" width={36} height={36} className="rounded-lg" />
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, i) => (
                <SkeletonLoader key={i} variant="rectangular" height={40} className="rounded-lg" />
              ))}
            </div>
          </div>

          {/* Today's Sessions */}
          <ContentCardSkeleton />
        </div>

        {/* Players Section */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
          <SkeletonLoader variant="text" width={120} className="h-6 mb-6" />
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="text-center">
                <SkeletonLoader variant="circular" width={64} height={64} className="mx-auto mb-2" />
                <SkeletonLoader variant="text" width="80%" className="h-4 mx-auto mb-1" />
                <SkeletonLoader variant="text" width="50%" className="h-3 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayoutSkeleton>
  );
}
