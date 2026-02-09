import {
  DashboardShell,
  PageHeaderSkeleton,
  StatsCardSkeleton,
  Skeleton,
} from '@/components/Skeleton';

export default function WhatsAppLoading() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <PageHeaderSkeleton />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200/80 dark:border-zinc-800/80">
            <Skeleton width={140} height={24} rounded="lg" className="mb-6" />
            <div className="space-y-4">
              <Skeleton height={44} rounded="xl" />
              <Skeleton height={120} rounded="xl" />
              <Skeleton height={44} rounded="xl" />
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200/80 dark:border-zinc-800/80">
            <Skeleton width={160} height={24} rounded="lg" className="mb-6" />
            <div className="space-y-3">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                  <Skeleton width="60%" height={16} rounded="md" className="mb-2" />
                  <Skeleton width="90%" height={16} rounded="md" className="mb-2" />
                  <Skeleton width={80} height={12} rounded="md" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
