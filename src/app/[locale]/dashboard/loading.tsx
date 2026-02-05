'use client';

import { 
  DashboardLayoutSkeleton, 
  StatsCardSkeleton, 
  ContentCardSkeleton 
} from '@/components/DashboardSkeleton';
import { SkeletonLoader } from '@/components/LogoLoader';

export default function DashboardLoading() {
  return (
    <DashboardLayoutSkeleton>
      <div className="space-y-6">
        {/* Page Title */}
        <div>
          <SkeletonLoader variant="text" width={200} className="h-8 mb-2" />
          <SkeletonLoader variant="text" width={300} className="h-4" />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>

        {/* Main Content Grid */}
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
