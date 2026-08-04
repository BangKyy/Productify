import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const badgeVariants = {
  default: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  secondary: 'bg-slate-800 text-slate-300 border-slate-700',
  amber: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  emerald: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  rose: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  outline: 'border-slate-700 text-slate-400'
};

export function Badge({ className, variant = 'default', ...props }) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500',
        badgeVariants[variant] || badgeVariants.default,
        className
      )}
      {...props}
    />
  );
}
