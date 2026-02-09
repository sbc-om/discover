import {
  DashboardShell,
  PageHeaderSkeleton,
  Skeleton,
} from '@/components/Skeleton';

export default function SettingsLoading() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <PageHeaderSkeleton hasButton={false} />

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-64 shrink-0">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200/80 dark:border-zinc-800/80 space-y-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <Skeleton key={i} height={44} rounded="xl" />
              ))}
            </div>
          </div>

          <div className="flex-1">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200/80 dark:border-zinc-800/80">
              <Skeleton width={140} height={24} rounded="lg" className="mb-6" />
              <div className="space-y-5">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton width={100} height={16} rounded="md" />
                    <Skeleton height={44} rounded="xl" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
