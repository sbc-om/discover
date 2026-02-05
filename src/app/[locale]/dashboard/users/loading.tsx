'use client';

import { 
  DashboardLayoutSkeleton, 
  PageHeaderSkeleton,
  TableSkeletonCompact
} from '@/components/DashboardSkeleton';
import { SkeletonLoader } from '@/components/LogoLoader';

export default function UsersLoading() {
  return (
    <DashboardLayoutSkeleton>
      <div className="space-y-6">
        <PageHeaderSkeleton hasButton={true} />

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <SkeletonLoader variant="rectangular" width={220} height={42} className="rounded-xl" />
          <SkeletonLoader variant="rectangular" width={160} height={42} className="rounded-xl" />
        </div>

        {/* Table */}
        <TableSkeletonCompact rows={10} columns={5} />
      </div>
    </DashboardLayoutSkeleton>
  );
}
