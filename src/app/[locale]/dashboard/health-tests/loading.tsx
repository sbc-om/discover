'use client';

import { 
  DashboardLayoutSkeleton, 
  PageHeaderSkeleton,
  TableSkeletonCompact,
  StatsCardSkeleton
} from '@/components/DashboardSkeleton';
import { SkeletonLoader } from '@/components/LogoLoader';

export default function HealthTestsLoading() {
  return (
    <DashboardLayoutSkeleton>
      <div className="space-y-6">
        <PageHeaderSkeleton hasButton={true} />

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <SkeletonLoader variant="rectangular" width={200} height={42} className="rounded-xl" />
          <SkeletonLoader variant="rectangular" width={150} height={42} className="rounded-xl" />
          <SkeletonLoader variant="rectangular" width={180} height={42} className="rounded-xl" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>

        {/* Table */}
        <TableSkeletonCompact rows={8} columns={6} />
      </div>
    </DashboardLayoutSkeleton>
  );
}
