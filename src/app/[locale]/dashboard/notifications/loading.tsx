'use client';

import { 
  DashboardLayoutSkeleton, 
  PageHeaderSkeleton
} from '@/components/DashboardSkeleton';
import { SkeletonLoader } from '@/components/LogoLoader';

export default function NotificationsLoading() {
  return (
    <DashboardLayoutSkeleton>
      <div className="space-y-6">
        <PageHeaderSkeleton hasButton={true} />

        {/* Filters */}
        <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          {[1, 2, 3].map((i) => (
            <SkeletonLoader key={i} variant="rectangular" width={80} height={36} className="rounded-lg" />
          ))}
        </div>

        {/* Notification List */}
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-start gap-4">
                <SkeletonLoader variant="circular" width={44} height={44} className="shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <SkeletonLoader variant="text" width="60%" className="h-5" />
                    <SkeletonLoader variant="text" width={60} className="h-3" />
                  </div>
                  <SkeletonLoader variant="text" width="90%" className="h-4 mb-2" />
                  <SkeletonLoader variant="text" width="70%" className="h-3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayoutSkeleton>
  );
}
