import React, { useEffect, useState, createContext, useContext, useCallback } from 'react';
import { cn } from './Button';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

function ToastContainer() {
  const { toasts } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  );
}

export function Toast({
  id,
  type,
  title,
  message,
  duration = 5000,
  action,
  onClose,
}: ToastMessage & { onClose?: () => void }) {
  const [isExiting, setIsExiting] = useState(false);
  const { removeToast } = useToast();

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      removeToast(id);
      onClose?.();
    }, 200);
  }, [id, removeToast, onClose]);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(handleClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, handleClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  const borderColors = {
    success: 'border-l-green-500',
    error: 'border-l-red-500',
    warning: 'border-l-yellow-500',
    info: 'border-l-blue-500',
  };

  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-lg border border-gray-200 border-l-4 overflow-hidden',
        borderColors[type],
        isExiting ? 'animate-slide-out' : 'animate-slide-in'
      )}
      role="alert"
    >
      <div className="p-4 flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          {message && <p className="text-sm text-gray-500 mt-0.5">{message}</p>}
          {action && (
            <button
              onClick={() => {
                action.onClick();
                handleClose();
              }}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 mt-2"
            >
              {action.label}
            </button>
          )}
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {duration > 0 && (
        <div className="h-1 bg-gray-100">
          <div
            className={cn('h-full transition-all ease-linear', {
              'bg-green-500': type === 'success',
              'bg-red-500': type === 'error',
              'bg-yellow-500': type === 'warning',
              'bg-blue-500': type === 'info',
            })}
            style={{ animation: `shrink ${duration}ms linear forwards` }}
          />
        </div>
      )}

      <style>{`
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slide-out {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(100%); }
        }
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-slide-in { animation: slide-in 0.2s ease-out; }
        .animate-slide-out { animation: slide-out 0.2s ease-out; }
      `}</style>
    </div>
  );
}
