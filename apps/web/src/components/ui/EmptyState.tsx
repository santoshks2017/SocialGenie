import React from 'react';
import { cn } from './Button';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeConfig = {
  sm: { icon: 'text-3xl', title: 'text-base', desc: 'text-xs', gap: 'gap-2' },
  md: { icon: 'text-4xl', title: 'text-lg', desc: 'text-sm', gap: 'gap-3' },
  lg: { icon: 'text-5xl', title: 'text-xl', desc: 'text-base', gap: 'gap-4' },
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  size = 'md',
}: EmptyStateProps) {
  const config = sizeConfig[size];

  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-12 px-4', className)}>
      {icon && (
        <div className={cn('mb-4 text-gray-300', config.icon)}>
          {icon}
        </div>
      )}
      <h3 className={cn('font-semibold text-gray-700', config.title)}>
        {title}
      </h3>
      {description && (
        <p className={cn('text-gray-500 mt-1 max-w-sm', config.desc)}>
          {description}
        </p>
      )}
      {action && (
        <Button
          onClick={action.onClick}
          variant={action.variant || 'primary'}
          className="mt-4"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

export function EmptyStateInbox({ className }: { className?: string }) {
  return (
    <EmptyState
      icon={<span>📬</span>}
      title="No messages yet"
      description="When customers message you on Facebook, Instagram, or Google, they'll appear here."
      className={className}
    />
  );
}

export function EmptyStatePosts({ className }: { className?: string }) {
  return (
    <EmptyState
      icon={<span>✨</span>}
      title="No posts yet"
      description="Create your first post to start engaging with your audience."
      action={{
        label: 'Create Post',
        onClick: () => (window.location.href = '/create'),
      }}
      className={className}
    />
  );
}

export function EmptyStateInventory({ className }: { className?: string }) {
  return (
    <EmptyState
      icon={<span>🚗</span>}
      title="No vehicles in inventory"
      description="Add vehicles manually or import from a CSV file to get started."
      action={{
        label: 'Add Vehicle',
        onClick: () => {},
      }}
      className={className}
    />
  );
}

export function EmptyStateCalendar({ className }: { className?: string }) {
  return (
    <EmptyState
      icon={<span>📅</span>}
      title="No posts scheduled"
      description="Schedule posts to maintain a consistent presence on social media."
      action={{
        label: 'Create Post',
        onClick: () => (window.location.href = '/create'),
      }}
      className={className}
    />
  );
}

export function EmptyStateSearch({
  query,
  className,
}: {
  query?: string;
  className?: string;
}) {
  return (
    <EmptyState
      icon={<span>🔍</span>}
      title="No results found"
      description={query ? `No results for "${query}". Try a different search term.` : 'No results found.'}
      className={className}
    />
  );
}

export function EmptyStateLeads({ className }: { className?: string }) {
  return (
    <EmptyState
      icon={<span>👥</span>}
      title="No leads yet"
      description="Leads from your posts and campaigns will appear here."
      className={className}
    />
  );
}
