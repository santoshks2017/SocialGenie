export function formatPrice(price: number): string {
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Cr`;
  }
  if (price >= 100000) {
    return `₹${(price / 100000).toFixed(2)} L`;
  }
  if (price >= 1000) {
    return `₹${price.toLocaleString('en-IN')}`;
  }
  return `₹${price}`;
}

export function formatCurrency(amount: number, compact = false): string {
  if (compact && amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatNumber(num: number, compact = false): string {
  if (compact) {
    if (num >= 10000000) {
      return `${(num / 10000000).toFixed(1)}Cr`;
    }
    if (num >= 100000) {
      return `${(num / 100000).toFixed(1)}L`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
  }
  return num.toLocaleString('en-IN');
}

export function formatDate(date: string | Date, format: 'short' | 'long' | 'time' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  switch (format) {
    case 'time':
      return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    case 'long':
      return d.toLocaleDateString('en-IN', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    case 'short':
    default:
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return formatDate(d, 'short');
}

export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getDaysUntil(date: string | Date): number {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  return Math.ceil(diff / 86400000);
}

export function getDaysBetween(start: string | Date, end: string | Date): number {
  const s = typeof start === 'string' ? new Date(start) : start;
  const e = typeof end === 'string' ? new Date(end) : end;
  const diff = e.getTime() - s.getTime();
  return Math.ceil(diff / 86400000);
}

export function isToday(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

export function isThisWeek(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + 1);
  weekStart.setHours(0, 0, 0, 0);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  
  return d >= weekStart && d <= weekEnd;
}

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const VEHICLE_FUEL_TYPES = [
  'Petrol',
  'Diesel',
  'Electric',
  'CNG',
  'Hybrid',
];

export const VEHICLE_TRANSMISSIONS = [
  'Manual',
  'Automatic',
  'AMT',
  'CVT',
  'DCT',
];

export const VEHICLE_CONDITIONS = [
  { value: 'new', label: 'New' },
  { value: 'used', label: 'Used' },
];

export const VEHICLE_STATUSES = [
  { value: 'in_stock', label: 'In Stock', color: 'green' },
  { value: 'reserved', label: 'Reserved', color: 'yellow' },
  { value: 'sold', label: 'Sold', color: 'gray' },
];

export const POST_STATUSES = [
  { value: 'draft', label: 'Draft', color: 'gray' },
  { value: 'scheduled', label: 'Scheduled', color: 'yellow' },
  { value: 'published', label: 'Published', color: 'green' },
  { value: 'failed', label: 'Failed', color: 'red' },
];

export const CAMPAIGN_STATUSES = [
  { value: 'draft', label: 'Draft', color: 'blue' },
  { value: 'active', label: 'Active', color: 'green' },
  { value: 'paused', label: 'Paused', color: 'yellow' },
  { value: 'completed', label: 'Completed', color: 'gray' },
];

export const BUDGET_PRESETS = [500, 1000, 2500, 5000];
export const DURATION_PRESETS = [3, 7, 14, 30];
export const BOOST_RADIUS_PRESETS = [5, 10, 25, 50];
export const AGE_RANGE_PRESETS = { min: 18, max: 65, defaultMin: 25, defaultMax: 55 };

export const PLATFORM_LIMITS = {
  facebook: { caption: 63206, hashtag: 30 },
  instagram: { caption: 2200, hashtag: 30 },
  gmb: { caption: 1500, hashtag: 10 },
};

export const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  hi: 'Hindi',
  ta: 'Tamil',
  te: 'Telugu',
  kn: 'Kannada',
  ml: 'Malayalam',
  mr: 'Marathi',
};

export const REGION_LABELS: Record<string, string> = {
  north_india: 'North India',
  south_india: 'South India',
  east_india: 'East India',
  west_india: 'West India',
  maharashtra: 'Maharashtra',
  karnataka: 'Karnataka',
  tamil_nadu: 'Tamil Nadu',
  kerala: 'Kerala',
  telangana: 'Telangana',
  gujarat: 'Gujarat',
  punjab: 'Punjab',
  rajasthan: 'Rajasthan',
};
