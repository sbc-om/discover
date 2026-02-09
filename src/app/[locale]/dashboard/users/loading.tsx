import {
  DashboardShell,
  PageHeaderSkeleton,
  TableSkeleton,
  Skeleton,
} from '@/components/Skeleton';

export default function UsersLoading() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <PageHeaderSkeleton />

        <div className="flex flex-wrap items-center gap-3">
          <Skeleton width={220} height={42} rounded="xl" />
          <Skeleton width={160} height={42} rounded="xl" />
        </div>

        <TableSkeleton rows={10} columns={5} />
      </div>
    </DashboardShell>
  );
}
