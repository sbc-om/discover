// Pure server component - no 'use client', no framer-motion
// Lightweight skeleton primitives for loading.tsx files

import { type CSSProperties, type ReactNode } from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  children?: ReactNode;
}

const roundedMap = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
};

export function Skeleton({ className = '', width, height, rounded = 'lg', children }: SkeletonProps) {
  const style: CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`bg-zinc-200/70 dark:bg-zinc-800/70 animate-pulse ${roundedMap[rounded]} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

// Common skeleton patterns
export function SkeletonText({ width = '100%', className = '' }: { width?: string | number; className?: string }) {
  return <Skeleton width={width} height={16} rounded="md" className={className} />;
}

export function SkeletonCircle({ size = 40 }: { size?: number }) {
  return <Skeleton width={size} height={size} rounded="full" />;
}

export function SkeletonCard({ className = '', children }: { className?: string; children?: ReactNode }) {
  return (
    <div className={`bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200/80 dark:border-zinc-800/80 ${className}`}>
      {children}
    </div>
  );
}

// Dashboard layout skeleton (header + content + dock)
export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <Skeleton width={40} height={40} rounded="xl" />
            <Skeleton width={100} height={20} rounded="md" className="hidden sm:block" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton width={36} height={36} rounded="full" />
            <Skeleton width={36} height={36} rounded="full" />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto p-6">
        <div className="container mx-auto max-w-7xl">
          {children}
        </div>
      </main>

      {/* Dock */}
      <div className="sticky bottom-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-800 p-3">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} width={44} height={44} rounded="full" />
          ))}
        </div>
      </div>
    </div>
  );
}

// Page header skeleton
export function PageHeaderSkeleton({ hasButton = true }: { hasButton?: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <Skeleton width={180} height={32} rounded="lg" className="mb-2" />
        <Skeleton width={280} height={16} rounded="md" />
      </div>
      {hasButton && <Skeleton width={140} height={40} rounded="xl" />}
    </div>
  );
}

// Stats card skeleton
export function StatsCardSkeleton() {
  return (
    <SkeletonCard>
      <div className="flex items-center justify-between mb-3">
        <Skeleton width={44} height={44} rounded="xl" />
        <Skeleton width={50} height={16} rounded="md" />
      </div>
      <Skeleton width="50%" height={28} rounded="lg" className="mb-1" />
      <Skeleton width="70%" height={16} rounded="md" />
    </SkeletonCard>
  );
}

// Table skeleton
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <SkeletonCard className="p-6">
      <div className="flex gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800 mb-4">
        {Array.from({ length: columns }, (_, i) => (
          <Skeleton key={i} height={16} rounded="md" className="flex-1" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }, (_, r) => (
          <div key={r} className="flex gap-4">
            {Array.from({ length: columns }, (_, c) => (
              <Skeleton key={c} height={16} rounded="md" className="flex-1" />
            ))}
          </div>
        ))}
      </div>
    </SkeletonCard>
  );
}
