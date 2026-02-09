import {
  DashboardShell,
  PageHeaderSkeleton,
  Skeleton,
} from '@/components/Skeleton';

export default function ProgramsLoading() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <PageHeaderSkeleton />

        <div className="flex flex-wrap items-center gap-3">
          <Skeleton width={220} height={42} rounded="xl" />
          <Skeleton width={160} height={42} rounded="xl" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800/80">
              <Skeleton height={192} rounded="sm" className="rounded-b-none" />
              <div className="p-5 space-y-3">
                <Skeleton width="80%" height={24} rounded="md" />
                <Skeleton height={16} rounded="md" />
                <Skeleton width="85%" height={16} rounded="md" />
                <div className="flex items-center gap-2">
                  <Skeleton width={70} height={24} rounded="full" />
                  <Skeleton width={90} height={24} rounded="full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
