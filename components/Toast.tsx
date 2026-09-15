'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export default function Toast({ toasts, onDismiss }: ToastProps) {
  return (
    <div className="fixed bottom-4 right-4 left-4 z-50 flex flex-col items-center pointer-events-none space-y-2 font-mono">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto w-full max-w-sm p-3 rounded-xl border shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 text-xs animate-toast-slide ${
            t.type === 'success'
              ? 'bg-emerald-950/95 border-emerald-500/80 text-emerald-200 shadow-emerald-500/20'
              : t.type === 'warning'
              ? 'bg-amber-950/95 border-amber-500/80 text-amber-200 shadow-amber-500/20'
              : t.type === 'error'
              ? 'bg-red-950/95 border-red-500/80 text-red-200 shadow-red-500/20'
              : 'bg-cyan-950/95 border-cyan-500/80 text-cyan-200 shadow-cyan-500/20'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {t.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
            {t.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
            {t.type === 'info' && <Info className="w-4 h-4 text-cyan-400 shrink-0" />}
            <span className="truncate font-semibold">{t.message}</span>
          </div>

          <button
            onClick={() => onDismiss(t.id)}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
