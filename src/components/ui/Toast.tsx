// src/components/ui/Toast.tsx
import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';
import type { ToastType } from '../../types';

interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onRemove: (id: string) => void;
}

const config: Record<
  ToastType,
  {
    Icon: React.ElementType;
    iconColor: string;
    iconBg: string;
    border: string;
    bar: string;
    titleColor: string;
  }
> = {
  success: {
    Icon: CheckCircle2,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50',
    border: 'border-emerald-200',
    bar: 'bg-emerald-500',
    titleColor: 'text-emerald-900',
  },
  error: {
    Icon: XCircle,
    iconColor: 'text-red-600',
    iconBg: 'bg-red-50',
    border: 'border-red-200',
    bar: 'bg-red-500',
    titleColor: 'text-red-900',
  },
  warning: {
    Icon: AlertCircle,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50',
    border: 'border-amber-200',
    bar: 'bg-amber-500',
    titleColor: 'text-amber-900',
  },
  info: {
    Icon: Info,
    iconColor: 'text-cyan-600',
    iconBg: 'bg-cyan-50',
    border: 'border-cyan-200',
    bar: 'bg-cyan-500',
    titleColor: 'text-cyan-900',
  },
};

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 4000,
  onRemove,
}) => {
  const [isLeaving, setIsLeaving] = useState(false);
  const cfg = config[type];
  const Icon = cfg.Icon;

  useEffect(() => {
    const leaveTimer = setTimeout(() => setIsLeaving(true), Math.max(duration - 300, 0));
    return () => clearTimeout(leaveTimer);
  }, [duration]);

  return (
    <div
      className={`
        relative w-full max-w-sm bg-white rounded-2xl border-2 ${cfg.border}
        shadow-2xl shadow-slate-900/10 overflow-hidden
        transition-all duration-300 ease-out
        ${isLeaving ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100 animate-[slideInRight_0.3s_ease-out]'}
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="p-4 flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl ${cfg.iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${cfg.iconColor}`} />
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-bold ${cfg.titleColor} leading-tight`}>{title}</p>
          {message && (
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{message}</p>
          )}
        </div>

        <button
          onClick={() => onRemove(id)}
          className="flex-shrink-0 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress bar */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100">
          <div
            className={`h-full ${cfg.bar}`}
            style={{
              width: '100%',
              animation: `shrinkBar ${duration}ms linear forwards`,
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes shrinkBar {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default Toast;