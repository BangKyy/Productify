import React, { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const DropdownMenu = ({ children }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {React.Children.map(children, (child) => {
        if (!child) return null;
        return React.cloneElement(child, { open, setOpen });
      })}
    </div>
  );
};

export const DropdownMenuTrigger = ({ children, asChild, open, setOpen, className, ...props }) => {
  const handleClick = (e) => {
    e.stopPropagation();
    setOpen(!open);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: handleClick,
      'aria-expanded': open
    });
  }

  return (
    <button
      onClick={handleClick}
      aria-expanded={open}
      className={cn('inline-flex items-center gap-1.5 focus:outline-none', className)}
      {...props}
    >
      {children}
    </button>
  );
};

export const DropdownMenuContent = ({ children, open, setOpen, align = 'right', className }) => {
  if (!open) return null;

  const alignClasses = {
    right: 'right-0',
    left: 'left-0',
    center: 'left-1/2 -translate-x-1/2'
  };

  return (
    <div
      className={cn(
        'absolute z-50 mt-2 min-w-[12rem] overflow-hidden rounded-2xl glass-card p-1.5 shadow-2xl border border-slate-700/80 animate-fade-in focus:outline-none',
        alignClasses[align] || alignClasses.right,
        className
      )}
      onClick={() => setOpen(false)}
    >
      {children}
    </div>
  );
};

export const DropdownMenuItem = ({ children, onClick, className, active, ...props }) => {
  return (
    <div
      onClick={(e) => {
        if (onClick) onClick(e);
      }}
      className={cn(
        'flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl cursor-pointer transition-colors text-slate-300 hover:bg-slate-800 hover:text-white',
        active && 'bg-purple-600/30 text-purple-200 border border-purple-500/40',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const DropdownMenuLabel = ({ children, className }) => (
  <div className={cn('px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider', className)}>
    {children}
  </div>
);

export const DropdownMenuSeparator = ({ className }) => (
  <div className={cn('-mx-1.5 my-1 h-px bg-slate-800', className)} />
);
