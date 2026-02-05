'use client';

import { 
  DashboardLayoutSkeleton, 
  StatsCardSkeleton,
  ContentCardSkeleton
} from '@/components/DashboardSkeleton';
import { SkeletonLoader } from '@/components/LogoLoader';

export default function ProfileLoading() {
  return (
    <DashboardLayoutSkeleton>
      <div className="space-y-6">
        {/* Profile Header Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
          <SkeletonLoader variant="rectangular" className="w-full h-32 lg:h-40" />
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 sm:-mt-14">
              <SkeletonLoader variant="circular" width={96} height={96} className="border-4 border-white dark:border-zinc-900" />
              <div className="flex-1 pt-2 sm:pt-0 sm:pb-2">
                <SkeletonLoader variant="text" width={180} className="h-7 mb-2" />
                <SkeletonLoader variant="text" width={140} className="h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ContentCardSkeleton />
            <ContentCardSkeleton />
          </div>
          <div className="space-y-6">
            <ContentCardSkeleton />
          </div>
        </div>
      </div>
    </DashboardLayoutSkeleton>
  );
}
