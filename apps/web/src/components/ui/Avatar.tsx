import React from 'react';
import { cn } from './Button';

export interface AvatarProps {
  src?: string;
  initials?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  alt?: string;
  status?: 'online' | 'offline' | 'busy';
  fallbackClassName?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

const statusSizeClasses = {
  xs: 'w-2 h-2 border',
  sm: 'w-2.5 h-2.5 border-2',
  md: 'w-3 h-3 border-2',
  lg: 'w-3.5 h-3.5 border-2',
  xl: 'w-4 h-4 border-2',
};

const statusColors = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  busy: 'bg-red-500',
};

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export function Avatar({
  src,
  initials,
  size = 'md',
  className,
  alt,
  status,
  fallbackClassName,
}: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);

  const showFallback = !src || imageError;
  const displayInitials = initials || (alt ? getInitials(alt) : '?');

  return (
    <div className={cn('relative inline-flex flex-shrink-0', className)}>
      {showFallback ? (
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white font-bold',
            sizeClasses[size],
            fallbackClassName
          )}
          aria-label={alt || 'Avatar'}
        >
          {displayInitials}
        </div>
      ) : (
        <img
          src={src}
          alt={alt || 'Avatar'}
          onError={() => setImageError(true)}
          className={cn(
            'rounded-full object-cover',
            sizeClasses[size]
          )}
        />
      )}
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-white',
            statusSizeClasses[size],
            statusColors[status]
          )}
          aria-label={status}
        />
      )}
    </div>
  );
}

export function AvatarGroup({
  children,
  max = 4,
  size = 'md',
  className,
}: {
  children: React.ReactNode;
  max?: number;
  size?: AvatarProps['size'];
  className?: string;
}) {
  const childArray = React.Children.toArray(children);
  const visibleCount = Math.min(childArray.length, max);
  const remainingCount = childArray.length - visibleCount;

  return (
    <div className={cn('flex items-center', className)}>
      {childArray.slice(0, visibleCount).map((child, index) => (
        <div
          key={index}
          className={cn(
            'ring-2 ring-white rounded-full',
            index > 0 && '-ml-2'
          )}
        >
          {child}
        </div>
      ))}
      {remainingCount > 0 && (
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-gray-100 text-gray-600 font-medium ring-2 ring-white -ml-2',
            sizeClasses[size]
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}
