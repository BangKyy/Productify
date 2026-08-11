import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const Avatar = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'relative flex h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-slate-700 bg-slate-800 shadow',
      className
    )}
    {...props}
  />
));
Avatar.displayName = 'Avatar';

export const AvatarImage = React.forwardRef(({ className, alt = '', ...props }, ref) => (
  <img
    ref={ref}
    alt={alt}
    loading="lazy"
    decoding="async"
    className={cn('aspect-square h-full w-full object-cover', className)}
    {...props}
  />
));
AvatarImage.displayName = 'AvatarImage';

export const AvatarFallback = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex h-full w-full items-center justify-center rounded-2xl bg-slate-800 text-xs font-bold text-slate-300',
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = 'AvatarFallback';
