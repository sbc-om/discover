export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-zinc-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 w-32 h-32 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 blur-2xl animate-pulse" />
          <img
            src="/logo/icon-black.png"
            alt="Loading"
            className="w-32 h-32 object-contain relative z-10 dark:hidden"
          />
          <img
            src="/logo/icon-white.png"
            alt="Loading"
            className="w-32 h-32 object-contain relative z-10 hidden dark:block"
          />
        </div>
        <p className="text-sm font-medium text-zinc-400 dark:text-zinc-500 animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
}
