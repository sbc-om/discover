import {
  DashboardShell,
  StatsCardSkeleton,
  Skeleton,
  SkeletonCard,
} from '@/components/Skeleton';

export default function ProfileLoading() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800/80">
          <Skeleton height={160} rounded="sm" className="rounded-b-none" />
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
              <Skeleton width={96} height={96} rounded="full" className="border-4 border-white dark:border-zinc-900" />
              <div className="flex-1 pt-2 sm:pt-0 sm:pb-2">
                <Skeleton width={180} height={28} rounded="lg" className="mb-2" />
                <Skeleton width={140} height={16} rounded="md" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SkeletonCard>
              <Skeleton width="60%" height={20} rounded="md" className="mb-4" />
              <Skeleton height={100} rounded="xl" className="mb-3" />
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
