import {
  DashboardShell,
  PageHeaderSkeleton,
  StatsCardSkeleton,
  TableSkeleton,
  Skeleton,
} from '@/components/Skeleton';

export default function PlayersLoading() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <PageHeaderSkeleton />

        <div className="flex flex-wrap items-center gap-3">
          <Skeleton width={200} height={42} rounded="xl" />
          <Skeleton width={150} height={42} rounded="xl" />
          <Skeleton width={150} height={42} rounded="xl" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>

        <TableSkeleton rows={8} columns={6} />
      </div>
    </DashboardShell>
  );
}
