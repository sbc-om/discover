'use client';

import { 
  DashboardLayoutSkeleton, 
  PageHeaderSkeleton
} from '@/components/DashboardSkeleton';
import { SkeletonLoader } from '@/components/LogoLoader';

export default function AcademiesLoading() {
  return (
    <DashboardLayoutSkeleton>
      <div className="space-y-6">
        <PageHeaderSkeleton hasButton={true} />

        {/* Filter */}
        <div className="flex items-center gap-3">
          <SkeletonLoader variant="rectangular" width={250} height={42} className="rounded-xl" />
        </div>

        {/* Academy Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
              <SkeletonLoader variant="rectangular" className="w-full h-40" />
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <SkeletonLoader variant="circular" width={48} height={48} />
                  <div className="flex-1">
                    <SkeletonLoader variant="text" width="70%" className="h-5 mb-2" />
                    <SkeletonLoader variant="text" width="50%" className="h-3" />
                  </div>
                </div>
                <div className="space-y-2">
                  <SkeletonLoader variant="text" width="90%" className="h-4" />
                  <SkeletonLoader variant="text" width="70%" className="h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayoutSkeleton>
  );
}
