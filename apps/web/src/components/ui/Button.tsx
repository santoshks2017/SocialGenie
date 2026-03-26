import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', isLoading, children, ...props }, ref) => {
    const baseStyle = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background h-10 py-2 px-4';
    
    const variants = {
      primary: 'bg-orange-600 text-white hover:bg-orange-700',
      secondary: 'bg-stone-100 text-stone-900 hover:bg-stone-200 border border-stone-200',
      ghost: 'hover:bg-stone-100 hover:text-stone-900 text-stone-600',
      danger: 'bg-red-600 text-white hover:bg-red-700'
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyle, variants[variant], className)}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <span className="mr-2 animate-spin">⚪</span>}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
