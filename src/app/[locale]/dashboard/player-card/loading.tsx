import {
  DashboardShell,
  PageHeaderSkeleton,
  Skeleton,
} from '@/components/Skeleton';

export default function PlayerCardLoading() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <PageHeaderSkeleton />

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 flex justify-center">
            <Skeleton width={320} height={480} rounded="2xl" />
          </div>

          <div className="w-full lg:w-96">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200/80 dark:border-zinc-800/80">
              <Skeleton width={120} height={24} rounded="lg" className="mb-6" />
              <div className="space-y-4">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton width={80} height={16} rounded="md" />
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
