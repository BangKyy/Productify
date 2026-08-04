import React, { createContext, useContext, useState } from 'react';
import { CheckCircle, XCircle, WarningCircle, Info, X } from '@phosphor-icons/react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = ({ message, type = 'info', duration = 4000 }) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const toast = {
    success: (msg) => addToast({ message: msg, type: 'success' }),
    error: (msg) => addToast({ message: msg, type: 'error' }),
    warning: (msg) => addToast({ message: msg, type: 'warning' }),
    info: (msg) => addToast({ message: msg, type: 'info' })
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      
      {/* Toast Render Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map(t => {
          let styles = 'bg-slate-900 text-slate-100 border-slate-700';
          let Icon = Info;
          let iconColor = 'text-indigo-400';

          if (t.type === 'success') {
            styles = 'bg-emerald-950/90 text-emerald-100 border-emerald-500/50 shadow-emerald-900/30';
            Icon = CheckCircle;
            iconColor = 'text-emerald-400';
          } else if (t.type === 'error') {
            styles = 'bg-rose-950/90 text-rose-100 border-rose-500/50 shadow-rose-900/30';
            Icon = XCircle;
            iconColor = 'text-rose-400';
          } else if (t.type === 'warning') {
            styles = 'bg-amber-950/90 text-amber-100 border-amber-500/50 shadow-amber-900/30';
            Icon = WarningCircle;
            iconColor = 'text-amber-400';
          }

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all animate-bounce-short ${styles}`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 shrink-0 ${iconColor}`} />
                <p className="text-xs font-semibold leading-snug">{t.message}</p>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
