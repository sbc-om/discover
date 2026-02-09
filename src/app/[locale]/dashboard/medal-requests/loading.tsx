import {
  DashboardShell,
  PageHeaderSkeleton,
  StatsCardSkeleton,
  Skeleton,
} from '@/components/Skeleton';

export default function MedalRequestsLoading() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <PageHeaderSkeleton hasButton={false} />

        <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} width={100} height={36} rounded="lg" />
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-200/80 dark:border-zinc-800/80">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton width={48} height={48} rounded="full" />
                <div className="flex-1">
                  <Skeleton width="70%" height={20} rounded="md" className="mb-1" />
                  <Skeleton width="50%" height={12} rounded="md" />
                </div>
                <Skeleton width={70} height={24} rounded="full" />
              </div>
              <Skeleton width="80%" height={16} rounded="md" className="mb-2" />
              <Skeleton width="60%" height={16} rounded="md" className="mb-4" />
              <div className="flex items-center gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <Skeleton height={36} rounded="lg" className="flex-1" />
                <Skeleton height={36} rounded="lg" className="flex-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
