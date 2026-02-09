import { Skeleton } from '@/components/Skeleton';

export default function AcademyDetailLoading() {
  return (
    <div className="space-y-6">
      <Skeleton width={192} height={40} rounded="lg" />

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden">
        <Skeleton height={128} rounded="sm" className="rounded-b-none" />
        <div className="px-6 pb-6">
          <div className="relative -mt-16 mb-4">
            <Skeleton width={128} height={128} rounded="2xl" className="border-4 border-white dark:border-zinc-900" />
          </div>
          <Skeleton width={256} height={32} rounded="lg" className="mb-2" />
          <Skeleton width={192} height={24} rounded="lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-6">
            <Skeleton width={128} height={24} rounded="lg" className="mb-4" />
            <div className="space-y-3">
              <Skeleton height={16} rounded="md" />
              <Skeleton width="75%" height={16} rounded="md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
