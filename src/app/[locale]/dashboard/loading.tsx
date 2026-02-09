import {
  DashboardShell,
  PageHeaderSkeleton,
  StatsCardSkeleton,
  Skeleton,
  SkeletonCard,
} from '@/components/Skeleton';

export default function DashboardLoading() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <PageHeaderSkeleton hasButton={false} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SkeletonCard>
              <Skeleton width="60%" height={20} rounded="md" className="mb-4" />
              <Skeleton height={120} rounded="xl" className="mb-4" />
              <Skeleton width="80%" height={16} rounded="md" />
            </SkeletonCard>
          </div>
          <SkeletonCard>
            <Skeleton width="50%" height={20} rounded="md" className="mb-4" />
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} height={16} rounded="md" />
              ))}
            </div>
          </SkeletonCard>
        </div>
      </div>
    </DashboardShell>
  );
}
