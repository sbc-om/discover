import {
  DashboardShell,
  StatsCardSkeleton,
  Skeleton,
  SkeletonCard,
} from '@/components/Skeleton';

export default function CoachLoading() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SkeletonCard>
              <div className="flex items-center justify-between mb-6">
                <Skeleton width={140} height={24} rounded="lg" />
                <div className="flex items-center gap-2">
                  <Skeleton width={36} height={36} rounded="lg" />
                  <Skeleton width={100} height={20} rounded="md" />
                  <Skeleton width={36} height={36} rounded="lg" />
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 35 }, (_, i) => (
                  <Skeleton key={i} height={40} rounded="lg" />
                ))}
              </div>
            </SkeletonCard>
          </div>

          <SkeletonCard>
            <Skeleton width="60%" height={20} rounded="md" className="mb-4" />
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} height={16} rounded="md" />
              ))}
            </div>
          </SkeletonCard>
        </div>

        <SkeletonCard>
          <Skeleton width={120} height={24} rounded="lg" className="mb-6" />
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col items-center">
                <Skeleton width={64} height={64} rounded="full" className="mb-2" />
                <Skeleton width="80%" height={16} rounded="md" className="mb-1" />
                <Skeleton width="50%" height={12} rounded="md" />
              </div>
            ))}
          </div>
        </SkeletonCard>
      </div>
    </DashboardShell>
  );
}
