'use client';

import { motion } from 'framer-motion';

interface LogoLoaderProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
}

const sizeConfig = {
  xs: { container: 'w-6 h-6', logo: 'w-6 h-6' },
  sm: { container: 'w-10 h-10', logo: 'w-10 h-10' },
  md: { container: 'w-16 h-16', logo: 'w-16 h-16' },
  lg: { container: 'w-24 h-24', logo: 'w-24 h-24' },
  xl: { container: 'w-32 h-32', logo: 'w-32 h-32' },
};

export default function LogoLoader({ 
  size = 'md', 
  text, 
  className = '' 
}: LogoLoaderProps) {
  const config = sizeConfig[size];

  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <motion.div
        className="relative"
        animate={{
          rotate: [0, -2, 2, -2, 2, 0],
          scale: [1, 1.02, 1, 1.02, 1],
        }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          repeatDelay: 0.8,
          ease: "easeInOut",
        }}
      >
        {/* Subtle glow behind logo */}
        <motion.div
          className={`absolute inset-0 ${config.container} rounded-2xl bg-gradient-to-br from-orange-500/30 to-amber-500/30 blur-2xl`}
          animate={{ 
            opacity: [0.3, 0.6, 0.3],
            scale: [0.8, 1.1, 0.8],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Logo */}
        <img
          src="/logo/icon-black.png"
          alt="Loading"
          className={`${config.logo} object-contain relative z-10 dark:hidden`}
        />
        <img
          src="/logo/icon-white.png"
          alt="Loading"
          className={`${config.logo} object-contain relative z-10 hidden dark:block`}
        />
      </motion.div>
      
      {text && (
        <motion.p
          className="text-sm font-medium text-zinc-500 dark:text-zinc-400"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}

// Full page loading overlay component - Simple with just logo
interface FullPageLoaderProps {
  text?: string;
}

export function FullPageLoader({ text }: FullPageLoaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-white dark:bg-zinc-950 flex items-center justify-center"
    >
      <div className="text-center">
        <LogoLoader size="xl" />
        
        {text && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-sm font-medium text-zinc-400 dark:text-zinc-500"
          >
            {text}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}

// Inline loading component for buttons or small areas
interface InlineLoaderProps {
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export function InlineLoader({ size = 'sm', className = '' }: InlineLoaderProps) {
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-current opacity-20"
      />
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-transparent border-t-current"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

// Skeleton loader for content placeholders
interface SkeletonLoaderProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function SkeletonLoader({ 
  className = '', 
  variant = 'text',
  width,
  height 
}: SkeletonLoaderProps) {
  const baseClasses = "bg-zinc-200 dark:bg-zinc-800 animate-pulse";
  
  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style: React.CSSProperties = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'circular' ? width : undefined),
  };

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
}

// Card skeleton for dashboard widgets
export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 ${className}`}>
      <div className="flex items-center gap-4 mb-4">
        <SkeletonLoader variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <SkeletonLoader variant="text" width="60%" />
          <SkeletonLoader variant="text" width="40%" />
        </div>
      </div>
      <SkeletonLoader variant="rectangular" height={100} className="mb-4" />
      <div className="space-y-2">
        <SkeletonLoader variant="text" />
        <SkeletonLoader variant="text" width="80%" />
      </div>
    </div>
  );
}

// Table skeleton
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4 pb-3 border-b border-zinc-200 dark:border-zinc-800">
        {Array.from({ length: columns }).map((_, i) => (
          <SkeletonLoader key={i} variant="text" className="flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 py-2">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <SkeletonLoader key={colIndex} variant="text" className="flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
