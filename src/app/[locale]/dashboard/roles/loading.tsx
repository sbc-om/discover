import {
  DashboardShell,
  PageHeaderSkeleton,
  Skeleton,
} from '@/components/Skeleton';

export default function RolesLoading() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <PageHeaderSkeleton />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200/80 dark:border-zinc-800/80">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton width={48} height={48} rounded="full" />
                <div className="flex-1">
                  <Skeleton width="60%" height={20} rounded="md" className="mb-1" />
                  <Skeleton width="40%" height={12} rounded="md" />
                </div>
              </div>
              <Skeleton width="90%" height={16} rounded="md" className="mb-3" />
              <div className="flex flex-wrap gap-1">
                {[0, 1, 2].map((j) => (
                  <Skeleton key={j} width={70} height={24} rounded="full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
