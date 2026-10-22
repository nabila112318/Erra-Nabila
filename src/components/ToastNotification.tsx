import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning';
  title: string;
  message: string;
}

interface ToastNotificationProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  toasts,
  onDismiss,
}) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let borderClass = 'border-emerald-500/50 bg-slate-900/95 text-emerald-400';
        let icon = <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;

        if (toast.type === 'warning') {
          borderClass = 'border-amber-500/50 bg-slate-900/95 text-amber-400';
          icon = <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />;
        } else if (toast.type === 'info') {
          borderClass = 'border-indigo-500/50 bg-slate-900/95 text-indigo-400';
          icon = <Info className="w-4 h-4 text-indigo-400 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto border rounded-xl p-3.5 shadow-2xl backdrop-blur-md flex items-start gap-3 transition-all duration-300 transform translate-y-0 ${borderClass}`}
          >
            {icon}
            <div className="flex-1 text-xs">
              <h5 className="font-bold text-white mb-0.5">{toast.title}</h5>
              <p className="text-slate-300 text-[11px] leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-white p-0.5 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
