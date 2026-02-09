import {
  DashboardShell,
  PageHeaderSkeleton,
  Skeleton,
} from '@/components/Skeleton';

export default function NotificationsLoading() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <PageHeaderSkeleton />

        <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} width={80} height={36} rounded="lg" />
          ))}
        </div>

        <div className="space-y-3">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200/80 dark:border-zinc-800/80">
              <div className="flex items-start gap-4">
                <Skeleton width={44} height={44} rounded="full" className="shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Skeleton width="60%" height={20} rounded="md" />
                    <Skeleton width={60} height={12} rounded="md" />
                  </div>
                  <Skeleton width="90%" height={16} rounded="md" className="mb-2" />
                  <Skeleton width="70%" height={12} rounded="md" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
