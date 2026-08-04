import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { X } from '@phosphor-icons/react';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div
        className="fixed inset-0"
        onClick={() => onOpenChange && onOpenChange(false)}
      />
      <div className="relative z-10 w-full max-w-lg">
        {React.Children.map(children, (child) => {
          if (!child) return null;
          return React.cloneElement(child, { onClose: () => onOpenChange && onOpenChange(false) });
        })}
      </div>
    </div>
  );
};

export const DialogContent = React.forwardRef(({ className, children, onClose, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'glass-card rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto',
      className
    )}
    {...props}
  >
    {onClose && (
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
    )}
    {children}
  </div>
));
DialogContent.displayName = 'DialogContent';

export const DialogHeader = ({ className, ...props }) => (
  <div className={cn('flex flex-col space-y-1.5 text-left', className)} {...props} />
);
DialogHeader.displayName = 'DialogHeader';

export const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn('text-xl font-extrabold text-white leading-tight', className)}
    {...props}
  />
));
DialogTitle.displayName = 'DialogTitle';

export const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-xs text-slate-400', className)}
    {...props}
  />
));
DialogDescription.displayName = 'DialogDescription';

export const DialogFooter = ({ className, ...props }) => (
  <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-slate-800', className)} {...props} />
);
DialogFooter.displayName = 'DialogFooter';
