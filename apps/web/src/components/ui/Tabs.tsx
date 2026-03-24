import React from 'react';
import { cn } from './Button';

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'underline' | 'pills' | 'buttons';
  size?: 'sm' | 'md';
  className?: string;
  fullWidth?: boolean;
}

const sizeClasses = {
  sm: 'text-xs py-1.5 px-3',
  md: 'text-sm py-2 px-4',
};

export function Tabs({
  tabs,
  activeTab,
  onChange,
  variant = 'underline',
  size = 'md',
  className,
  fullWidth = false,
}: TabsProps) {
  const baseClasses = 'inline-flex items-center justify-center gap-1.5 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

  if (variant === 'underline') {
    return (
      <div className={cn('flex border-b border-gray-200', className)}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && onChange(tab.id)}
            disabled={tab.disabled}
            className={cn(
              baseClasses,
              sizeClasses[size],
              'border-b-2 -mb-px rounded-none',
              fullWidth && 'flex-1',
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              tab.disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="ml-1 bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                {tab.badge > 99 ? '99+' : tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  if (variant === 'pills') {
    return (
      <div className={cn('flex gap-1 flex-wrap', className)}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && onChange(tab.id)}
            disabled={tab.disabled}
            className={cn(
              baseClasses,
              sizeClasses[size],
              'rounded-full border',
              fullWidth && 'flex-1',
              activeTab === tab.id
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600',
              tab.disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="ml-1 bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                {tab.badge > 99 ? '99+' : tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('flex border border-gray-200 rounded-lg p-1 bg-gray-50', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => !tab.disabled && onChange(tab.id)}
          disabled={tab.disabled}
          className={cn(
            baseClasses,
            sizeClasses[size],
            'rounded-md flex-1',
            activeTab === tab.id
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700',
            tab.disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {tab.icon}
          {tab.label}
          {tab.badge !== undefined && tab.badge > 0 && (
            <span className="ml-1 bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
              {tab.badge > 99 ? '99+' : tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export interface TabPanelProps {
  children: React.ReactNode;
  isActive: boolean;
  className?: string;
}

export function TabPanel({ children, isActive, className }: TabPanelProps) {
  if (!isActive) return null;
  return <div className={className}>{children}</div>;
}
