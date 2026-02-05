'use client';

import { 
  DashboardLayoutSkeleton, 
  PageHeaderSkeleton,
  StatsCardSkeleton
} from '@/components/DashboardSkeleton';
import { SkeletonLoader } from '@/components/LogoLoader';

export default function MedalRequestsLoading() {
  return (
    <DashboardLayoutSkeleton>
      <div className="space-y-6">
        <PageHeaderSkeleton hasButton={false} />

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonLoader key={i} variant="rectangular" width={100} height={36} className="rounded-lg" />
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>

        {/* Request Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-3 mb-4">
                <SkeletonLoader variant="circular" width={48} height={48} />
                <div className="flex-1">
                  <SkeletonLoader variant="text" width="70%" className="h-5 mb-1" />
                  <SkeletonLoader variant="text" width="50%" className="h-3" />
                </div>
                <SkeletonLoader variant="rectangular" width={70} height={24} className="rounded-full" />
              </div>
              <div className="space-y-2 mb-4">
                <SkeletonLoader variant="text" width="80%" className="h-4" />
                <SkeletonLoader variant="text" width="60%" className="h-4" />
              </div>
              <div className="flex items-center gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <SkeletonLoader variant="rectangular" height={36} className="rounded-lg flex-1" />
                <SkeletonLoader variant="rectangular" height={36} className="rounded-lg flex-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayoutSkeleton>
  );
}
