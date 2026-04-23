import React from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  loading = false,
  variant = 'danger'
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const variants = {
    danger: {
      icon: <AlertTriangle className="w-8 h-8 text-red-600" />,
      bgIcon: 'bg-red-50',
      button: 'bg-red-600 hover:bg-red-700 shadow-red-600/20',
      border: 'border-red-100'
    },
    warning: {
      icon: <AlertTriangle className="w-8 h-8 text-amber-600" />,
      bgIcon: 'bg-amber-50',
      button: 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20',
      border: 'border-amber-100'
    },
    info: {
      icon: <AlertTriangle className="w-8 h-8 text-indigo-600" />,
      bgIcon: 'bg-indigo-50',
      button: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20',
      border: 'border-indigo-100'
    }
  };

  const currentVariant = variants[variant];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className={`w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border ${currentVariant.border} overflow-hidden animate-in zoom-in-95 duration-300`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header / Icon */}
        <div className="pt-10 pb-6 flex flex-col items-center text-center px-8">
          <div className={`w-20 h-20 ${currentVariant.bgIcon} rounded-3xl flex items-center justify-center mb-6 animate-bounce-subtle`}>
            {currentVariant.icon}
          </div>
          
          <h3 className="text-2xl font-black text-slate-900 leading-tight">
            {title}
          </h3>
          <p className="mt-4 text-slate-500 font-medium leading-relaxed">
            {description}
          </p>
        </div>

        {/* Actions */}
        <div className="p-8 bg-slate-50/50 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-6 py-4 bg-white border border-slate-200 text-slate-600 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 px-6 py-4 ${currentVariant.button} text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2`}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
