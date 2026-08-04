import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const buttonVariants = {
  default: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow hover:from-purple-500 hover:to-indigo-500 active:scale-95',
  destructive: 'bg-rose-600 text-white shadow-sm hover:bg-rose-500 active:scale-95',
  outline: 'border border-slate-700 bg-slate-900/60 text-slate-200 hover:bg-slate-800 hover:text-white',
  secondary: 'bg-slate-800 text-slate-100 shadow-sm hover:bg-slate-700',
  ghost: 'text-slate-300 hover:bg-slate-800 hover:text-white',
  gradientAmber: 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold shadow-md hover:from-amber-400 hover:to-orange-400 active:scale-95'
};

const buttonSizes = {
  default: 'h-10 px-4 py-2 text-sm',
  sm: 'h-8 rounded-lg px-3 text-xs',
  lg: 'h-12 rounded-2xl px-6 text-base',
  icon: 'h-9 w-9 p-0 flex items-center justify-center'
};

export const Button = React.forwardRef(({
  className,
  variant = 'default',
  size = 'default',
  children,
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
        buttonVariants[variant] || buttonVariants.default,
        buttonSizes[size] || buttonSizes.default,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';
