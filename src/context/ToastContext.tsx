import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
  showWarning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    if (!message) return;
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    setToasts((prev) => [...prev.slice(-4), { id, message, type }]); // Keep max 5 toasts

    setTimeout(() => {
      removeToast(id);
    }, 3500);
  }, [removeToast]);

  const showSuccess = useCallback((message: string) => showToast(message, 'success'), [showToast]);
  const showError = useCallback((message: string) => showToast(message, 'error'), [showToast]);
  const showInfo = useCallback((message: string) => showToast(message, 'info'), [showToast]);
  const showWarning = useCallback((message: string) => showToast(message, 'warning'), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo, showWarning }}>
      {children}
      {/* Global Floating Toast Container */}
      <div className="fixed bottom-5 left-5 z-[9999] flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none select-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-2xl shadow-xl backdrop-blur-md border text-xs sm:text-sm font-semibold transition-all duration-300 transform translate-y-0 animate-bounce-short ${
              toast.type === 'success'
                ? 'bg-emerald-600/95 text-white border-emerald-500/30'
                : toast.type === 'error'
                ? 'bg-rose-600/95 text-white border-rose-500/30'
                : toast.type === 'warning'
                ? 'bg-amber-500/95 text-white border-amber-400/30'
                : 'bg-[#1877f2]/95 text-white border-blue-400/30'
            }`}
          >
            <div className="flex items-center space-x-2.5 min-w-0 pr-2">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-100" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 shrink-0 text-rose-100" />}
              {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 shrink-0 text-amber-100" />}
              {toast.type === 'info' && <Info className="w-5 h-5 shrink-0 text-blue-100" />}
              <span className="leading-snug truncate">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback safe dummy if used outside provider
    return {
      showToast: (msg: string) => alert(msg),
      showSuccess: (msg: string) => alert(msg),
      showError: (msg: string) => alert(msg),
      showInfo: (msg: string) => alert(msg),
      showWarning: (msg: string) => alert(msg),
    };
  }
  return context;
};
