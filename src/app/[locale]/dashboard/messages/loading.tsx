import {
  DashboardShell,
  Skeleton,
} from '@/components/Skeleton';

export default function MessagesLoading() {
  return (
    <DashboardShell>
      <div className="flex h-[calc(100vh-12rem)] rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
        <div className="w-80 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hidden md:flex flex-col">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
            <Skeleton width={120} height={24} rounded="lg" className="mb-4" />
            <Skeleton height={40} rounded="xl" />
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
                <Skeleton width={44} height={44} rounded="full" />
                <div className="flex-1 min-w-0">
                  <Skeleton width="70%" height={16} rounded="md" className="mb-2" />
                  <Skeleton width="90%" height={12} rounded="md" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-zinc-50 dark:bg-zinc-950">
          <div className="p-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <Skeleton width={40} height={40} rounded="full" />
              <div className="flex-1">
                <Skeleton width={150} height={20} rounded="md" className="mb-1" />
                <Skeleton width={80} height={12} rounded="md" />
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {[200, 260, 180].map((w, i) => (
              <div key={i} className="flex gap-3 max-w-[70%]">
                <Skeleton width={32} height={32} rounded="full" className="shrink-0" />
                <Skeleton width={w} height={50} rounded="2xl" />
              </div>
            ))}
          </div>
          <div className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <Skeleton height={44} rounded="xl" className="flex-1" />
              <Skeleton width={44} height={44} rounded="full" />
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
