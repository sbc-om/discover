'use client';

import { DashboardLayoutSkeleton } from '@/components/DashboardSkeleton';
import { SkeletonLoader } from '@/components/LogoLoader';

export default function MessagesLoading() {
  return (
    <DashboardLayoutSkeleton>
      <div className="flex h-[calc(100vh-12rem)] rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
        {/* Sidebar - Chat List */}
        <div className="w-80 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hidden md:flex flex-col">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
            <SkeletonLoader variant="text" width={120} className="h-6 mb-4" />
            <SkeletonLoader variant="rectangular" height={40} className="rounded-xl w-full" />
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
                <SkeletonLoader variant="circular" width={44} height={44} />
                <div className="flex-1 min-w-0">
                  <SkeletonLoader variant="text" width="70%" className="h-4 mb-2" />
                  <SkeletonLoader variant="text" width="90%" className="h-3" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-zinc-50 dark:bg-zinc-950">
          <div className="p-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <SkeletonLoader variant="circular" width={40} height={40} />
              <div className="flex-1">
                <SkeletonLoader variant="text" width={150} className="h-5 mb-1" />
                <SkeletonLoader variant="text" width={80} className="h-3" />
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 max-w-[70%]">
                <SkeletonLoader variant="circular" width={32} height={32} className="shrink-0" />
                <SkeletonLoader variant="rectangular" width={200 + i * 30} height={50} className="rounded-2xl" />
              </div>
            ))}
          </div>
          <div className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <SkeletonLoader variant="rectangular" height={44} className="rounded-xl flex-1" />
              <SkeletonLoader variant="circular" width={44} height={44} />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayoutSkeleton>
  );
}
