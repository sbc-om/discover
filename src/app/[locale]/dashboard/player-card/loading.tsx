'use client';

import { 
  DashboardLayoutSkeleton, 
  PageHeaderSkeleton
} from '@/components/DashboardSkeleton';
import { SkeletonLoader } from '@/components/LogoLoader';

export default function PlayerCardLoading() {
  return (
    <DashboardLayoutSkeleton>
      <div className="space-y-6">
        <PageHeaderSkeleton hasButton={true} />

        {/* Card Preview */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Preview Card */}
          <div className="flex-1 flex justify-center">
            <div className="w-80 h-[480px] rounded-2xl overflow-hidden">
              <SkeletonLoader variant="rectangular" className="w-full h-full" />
            </div>
          </div>

          {/* Settings Panel */}
          <div className="w-full lg:w-96 space-y-4">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
              <SkeletonLoader variant="text" width={120} className="h-6 mb-6" />
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <SkeletonLoader variant="text" width={80} className="h-4" />
                    <SkeletonLoader variant="rectangular" height={44} className="rounded-xl w-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayoutSkeleton>
  );
}
