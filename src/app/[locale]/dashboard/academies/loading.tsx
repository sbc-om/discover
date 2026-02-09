import {
  DashboardShell,
  PageHeaderSkeleton,
  Skeleton,
} from '@/components/Skeleton';

export default function AcademiesLoading() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <PageHeaderSkeleton />

        <Skeleton width={250} height={42} rounded="xl" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800/80">
              <Skeleton height={160} rounded="sm" className="rounded-b-none" />
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <Skeleton width={48} height={48} rounded="full" />
                  <div className="flex-1">
                    <Skeleton width="70%" height={20} rounded="md" className="mb-2" />
                    <Skeleton width="50%" height={12} rounded="md" />
                  </div>
                </div>
                <Skeleton width="90%" height={16} rounded="md" className="mb-2" />
                <Skeleton width="70%" height={16} rounded="md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
