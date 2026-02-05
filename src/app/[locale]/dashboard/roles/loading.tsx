'use client';

import { 
  DashboardLayoutSkeleton, 
  PageHeaderSkeleton
} from '@/components/DashboardSkeleton';
import { SkeletonLoader } from '@/components/LogoLoader';

export default function RolesLoading() {
  return (
    <DashboardLayoutSkeleton>
      <div className="space-y-6">
        <PageHeaderSkeleton hasButton={true} />

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <SkeletonLoader variant="circular" width={48} height={48} />
                  <div>
                    <SkeletonLoader variant="text" width={100} className="h-5 mb-1" />
                    <SkeletonLoader variant="text" width={70} className="h-3" />
                  </div>
                </div>
              </div>
              <SkeletonLoader variant="text" width="90%" className="h-4 mb-4" />
              <div className="space-y-2 mb-4">
                <SkeletonLoader variant="text" width={80} className="h-3" />
                <div className="flex flex-wrap gap-1">
                  {[1, 2, 3].map((j) => (
                    <SkeletonLoader key={j} variant="rectangular" width={70} height={24} className="rounded-full" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayoutSkeleton>
  );
}
