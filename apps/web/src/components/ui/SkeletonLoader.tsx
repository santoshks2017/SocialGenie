import React from 'react';
import { cn } from './Button';

export interface SkeletonLoaderProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  className?: string;
  count?: number;
}

export function SkeletonLoader({
  variant = 'rectangular',
  width,
  height,
  className,
  count = 1,
}: SkeletonLoaderProps) {
  const baseClass = 'animate-pulse bg-gray-200';

  const getVariantClass = () => {
    switch (variant) {
      case 'text':
        return 'rounded h-4';
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
      default:
        return 'rounded-lg';
    }
  };

  const style: React.CSSProperties = {
    width: width || (variant === 'circular' ? height : '100%'),
    height: height || (variant === 'text' ? '1rem' : variant === 'circular' ? width : '100%'),
  };

  if (count === 1) {
    return (
      <div
        className={cn(baseClass, getVariantClass(), className)}
        style={style}
      />
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(baseClass, getVariantClass())}
          style={style}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('bg-white rounded-xl border border-gray-100 p-5 space-y-3', className)}>
      <SkeletonLoader variant="rectangular" height={120} className="rounded-lg" />
      <SkeletonLoader variant="text" width="60%" />
      <SkeletonLoader variant="text" width="40%" />
      <div className="flex gap-2 pt-2">
        <SkeletonLoader variant="rectangular" width={60} height={24} className="rounded-full" />
        <SkeletonLoader variant="rectangular" width={60} height={24} className="rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonTable({
  rows = 5,
  columns = 4,
  className,
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div className={cn('bg-white rounded-xl border border-gray-100 overflow-hidden', className)}>
      <div className="border-b bg-gray-50 p-4">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <SkeletonLoader key={i} variant="text" className="flex-1" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-gray-50">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-4 p-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <SkeletonLoader
                key={colIndex}
                variant="text"
                width={colIndex === 0 ? '80%' : colIndex === columns - 1 ? '40%' : '60%'}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
          <SkeletonLoader variant="circular" width={40} height={40} />
          <div className="flex-1 space-y-2">
            <SkeletonLoader variant="text" width="40%" />
            <SkeletonLoader variant="text" width="70%" />
          </div>
        </div>
      ))}
    </div>
  );
}
