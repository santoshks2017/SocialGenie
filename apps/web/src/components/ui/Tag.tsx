import React from 'react';
import { cn } from './Button';
import { X } from 'lucide-react';

export interface TagProps {
  children: React.ReactNode;
  variant?: 'default' | 'lead' | 'complaint' | 'general' | 'spam';
  size?: 'sm' | 'md' | 'lg';
  removable?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
  className?: string;
}

const variantClasses = {
  default: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  lead: 'bg-green-100 text-green-700 hover:bg-green-200',
  complaint: 'bg-red-100 text-red-700 hover:bg-red-200',
  general: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  spam: 'bg-gray-100 text-gray-500 hover:bg-gray-200',
};

const sizeClasses = {
  sm: 'text-[10px] px-1.5 py-0.5',
  md: 'text-xs px-2 py-0.5',
  lg: 'text-sm px-2.5 py-1',
};

export function Tag({
  children,
  variant = 'default',
  size = 'md',
  removable = false,
  onRemove,
  onClick,
  className,
}: TagProps) {
  const Component = onClick ? 'button' : 'span';

  return (
    <Component
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-full transition-colors',
        variantClasses[variant],
        sizeClasses[size],
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
      {removable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="ml-0.5 hover:bg-black/10 rounded-full p-0.5"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </Component>
  );
}

export function LeadTag({ removable, onRemove, className }: Omit<TagProps, 'variant' | 'children'> & { className?: string }) {
  return (
    <Tag variant="lead" removable={removable} onRemove={onRemove} className={className}>
      Lead
    </Tag>
  );
}

export function ComplaintTag({ removable, onRemove, className }: Omit<TagProps, 'variant' | 'children'> & { className?: string }) {
  return (
    <Tag variant="complaint" removable={removable} onRemove={onRemove} className={className}>
      Complaint
    </Tag>
  );
}

export function GeneralTag({ removable, onRemove, className }: Omit<TagProps, 'variant' | 'children'> & { className?: string }) {
  return (
    <Tag variant="general" removable={removable} onRemove={onRemove} className={className}>
      General
    </Tag>
  );
}

export function SpamTag({ removable, onRemove, className }: Omit<TagProps, 'variant' | 'children'> & { className?: string }) {
  return (
    <Tag variant="spam" removable={removable} onRemove={onRemove} className={className}>
      Spam
    </Tag>
  );
}

export interface TagGroupProps {
  tags: Array<{
    id: string;
    label: string;
    variant?: TagProps['variant'];
  }>;
  onTagClick?: (id: string) => void;
  onTagRemove?: (id: string) => void;
  className?: string;
}

export function TagGroup({ tags, onTagClick, onTagRemove, className }: TagGroupProps) {
  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {tags.map((tag) => (
        <Tag
          key={tag.id}
          variant={tag.variant || 'default'}
          removable={!!onTagRemove}
          onRemove={() => onTagRemove?.(tag.id)}
          onClick={() => onTagClick?.(tag.id)}
        >
          {tag.label}
        </Tag>
      ))}
    </div>
  );
}
