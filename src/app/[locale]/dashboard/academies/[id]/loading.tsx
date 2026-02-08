export default function Loading() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Back button skeleton */}
      <div className="h-10 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
      
      {/* Header card skeleton */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="h-32 bg-zinc-200 dark:bg-zinc-800" />
        <div className="px-6 pb-6">
          <div className="relative -mt-16 mb-4">
            <div className="w-32 h-32 rounded-2xl bg-zinc-200 dark:bg-zinc-800 border-4 border-white dark:border-zinc-900" />
          </div>
          <div className="h-8 w-64 bg-zinc-200 dark:bg-zinc-800 rounded-lg mb-2" />
          <div className="h-6 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
        </div>
      </div>
      
      {/* Details grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-lg mb-4" />
            <div className="space-y-3">
              <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="h-4 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
