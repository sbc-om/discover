import LogoLoader from '@/components/LogoLoader';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-zinc-950 flex items-center justify-center">
      <div className="text-center">
        <LogoLoader size="xl" />
        <p className="mt-6 text-sm font-medium text-zinc-400 dark:text-zinc-500 animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
}
