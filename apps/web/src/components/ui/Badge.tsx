import React from 'react';
import { cn } from './Button';

export interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'lead' | 'complaint';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  dot?: boolean;
}

const variantClasses = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-green-50 text-green-700',
  warning: 'bg-yellow-50 text-yellow-700',
  error: 'bg-red-50 text-red-700',
  info: 'bg-blue-50 text-blue-700',
  lead: 'bg-green-100 text-green-700',
  complaint: 'bg-red-100 text-red-700',
};

const sizeClasses = {
  sm: 'text-[10px] px-1.5 py-0.5',
  md: 'text-xs px-2 py-0.5',
  lg: 'text-sm px-2.5 py-1',
};

export function Badge({
  variant = 'default',
  size = 'md',
  children,
  className,
  icon,
  dot,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-full',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {dot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full', {
            'bg-gray-400': variant === 'default',
            'bg-green-500': variant === 'success' || variant === 'lead',
            'bg-yellow-500': variant === 'warning',
            'bg-red-500': variant === 'error' || variant === 'complaint',
            'bg-blue-500': variant === 'info',
          })}
        />
      )}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
}

export function StatusBadge({
  status,
  size = 'md',
  className,
}: {
  status: 'published' | 'scheduled' | 'draft' | 'failed' | 'active' | 'paused' | 'completed';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const statusConfig: Record<string, { variant: BadgeProps['variant']; label: string }> = {
    published: { variant: 'success', label: 'Published' },
    scheduled: { variant: 'warning', label: 'Scheduled' },
    draft: { variant: 'default', label: 'Draft' },
    failed: { variant: 'error', label: 'Failed' },
    active: { variant: 'success', label: 'Active' },
    paused: { variant: 'warning', label: 'Paused' },
    completed: { variant: 'default', label: 'Completed' },
  };

  const config = statusConfig[status] || statusConfig.draft;

  return (
    <Badge variant={config.variant} size={size} dot className={className}>
      {config.label}
    </Badge>
  );
}

export function PlatformBadge({
  platform,
  size = 'sm',
  className,
}: {
  platform: 'facebook' | 'instagram' | 'gmb';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const platformConfig: Record<string, { label: string; className: string }> = {
    facebook: { label: 'FB', className: 'bg-blue-100 text-blue-700' },
    instagram: { label: 'IG', className: 'bg-pink-100 text-pink-700' },
    gmb: { label: 'GMB', className: 'bg-green-100 text-green-700' },
  };

  const config = platformConfig[platform] || { label: platform.toUpperCase(), className: 'bg-gray-100 text-gray-700' };

  return (
    <span
      className={cn(
        'inline-flex items-center font-bold rounded',
        config.className,
        sizeClasses[size],
        className
      )}
    >
      {config.label}
    </span>
  );
}
