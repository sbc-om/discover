'use client';

import { 
  DashboardLayoutSkeleton, 
  PageHeaderSkeleton
} from '@/components/DashboardSkeleton';
import { SkeletonLoader } from '@/components/LogoLoader';

export default function ProgramsLoading() {
  return (
    <DashboardLayoutSkeleton>
      <div className="space-y-6">
        <PageHeaderSkeleton hasButton={true} />

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <SkeletonLoader variant="rectangular" width={220} height={42} className="rounded-xl" />
          <SkeletonLoader variant="rectangular" width={160} height={42} className="rounded-xl" />
        </div>

        {/* Program Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
              <SkeletonLoader variant="rectangular" className="w-full h-48" />
              <div className="p-5">
                <SkeletonLoader variant="text" width="80%" className="h-6 mb-3" />
                <div className="space-y-2 mb-4">
                  <SkeletonLoader variant="text" width="100%" className="h-4" />
                  <SkeletonLoader variant="text" width="85%" className="h-4" />
                </div>
                <div className="flex items-center gap-2">
                  <SkeletonLoader variant="rectangular" width={70} height={24} className="rounded-full" />
                  <SkeletonLoader variant="rectangular" width={90} height={24} className="rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayoutSkeleton>
  );
}
