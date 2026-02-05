'use client';

import { 
  DashboardLayoutSkeleton, 
  PageHeaderSkeleton,
  StatsCardSkeleton
} from '@/components/DashboardSkeleton';
import { SkeletonLoader } from '@/components/LogoLoader';

export default function WhatsAppLoading() {
  return (
    <DashboardLayoutSkeleton>
      <div className="space-y-6">
        <PageHeaderSkeleton hasButton={true} />

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Message Composer */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
            <SkeletonLoader variant="text" width={140} className="h-6 mb-6" />
            <div className="space-y-4">
              <div className="space-y-2">
                <SkeletonLoader variant="text" width={80} className="h-4" />
                <SkeletonLoader variant="rectangular" height={44} className="rounded-xl w-full" />
              </div>
              <div className="space-y-2">
                <SkeletonLoader variant="text" width={100} className="h-4" />
                <SkeletonLoader variant="rectangular" height={120} className="rounded-xl w-full" />
              </div>
              <SkeletonLoader variant="rectangular" height={44} className="rounded-xl w-full" />
            </div>
          </div>

          {/* Recent Messages */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
            <SkeletonLoader variant="text" width={160} className="h-6 mb-6" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                  <div className="flex items-center justify-between mb-2">
                    <SkeletonLoader variant="text" width={120} className="h-4" />
                    <SkeletonLoader variant="rectangular" width={60} height={22} className="rounded-full" />
                  </div>
                  <SkeletonLoader variant="text" width="90%" className="h-4 mb-2" />
                  <SkeletonLoader variant="text" width={80} className="h-3" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayoutSkeleton>
  );
}
