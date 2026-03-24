import { cn } from './Button';

export interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  showPercentage?: boolean;
  className?: string;
  animate?: boolean;
}

const sizeClasses = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

const variantClasses = {
  default: 'bg-blue-600',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
};

export function ProgressBar({
  value,
  max = 100,
  variant = 'default',
  size = 'md',
  showLabel = false,
  label,
  showPercentage = false,
  className,
  animate = true,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn('w-full', className)}>
      {(showLabel || showPercentage) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs text-gray-600">{label}</span>}
          {showPercentage && (
            <span className="text-xs font-medium text-gray-700">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div
        className={cn('w-full bg-gray-100 rounded-full overflow-hidden', sizeClasses[size])}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all',
            variantClasses[variant],
            animate && 'transition-all duration-500 ease-out'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: 'default' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  className?: string;
}

export function CircularProgress({
  value,
  max = 100,
  size = 64,
  strokeWidth = 6,
  variant = 'default',
  showLabel = true,
  className,
}: CircularProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const strokeColors = {
    default: '#3b82f6',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="#e5e7eb"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={strokeColors[variant]}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {showLabel && (
        <span className="absolute text-xs font-semibold text-gray-700">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
}

export interface BoostSpendBarProps {
  spent: number;
  budget: number;
  currency?: string;
  className?: string;
}

export function BoostSpendBar({
  spent,
  budget,
  currency = '₹',
  className,
}: BoostSpendBarProps) {
  const percentage = (spent / budget) * 100;
  const isOverBudget = percentage > 100;
  const isNearLimit = percentage > 80;

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex justify-between text-xs">
        <span className="text-gray-500">
          Spent: {currency}{spent.toLocaleString('en-IN')}
        </span>
        <span className="text-gray-500">
          Budget: {currency}{budget.toLocaleString('en-IN')}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            isOverBudget ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : 'bg-blue-500'
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}
