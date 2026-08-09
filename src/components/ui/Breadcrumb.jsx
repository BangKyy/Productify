import React from 'react';
import { House, CaretRight } from '@phosphor-icons/react';

/**
 * Breadcrumb Component for PRoductify
 * 
 * Props:
 * - items: Array of objects [{ label: string, tab?: string, icon?: ReactComponent }]
 * - setActiveTab: Function callback to change application view tab
 */
export const Breadcrumb = ({ items = [], setActiveTab }) => {
  return (
    <nav 
      aria-label="Breadcrumb navigation"
      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md text-xs font-medium text-slate-400 shadow-sm"
    >
      {/* Home / Beranda Base Link */}
      <button
        type="button"
        onClick={() => setActiveTab && setActiveTab('overview')}
        className="flex items-center gap-1.5 hover:text-purple-400 transition-colors cursor-pointer"
        title="Kembali ke Beranda"
      >
        <House className="w-3.5 h-3.5 text-purple-400 shrink-0" />
        <span>Beranda</span>
      </button>

      {/* Dynamic Breadcrumb Items */}
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const Icon = item.icon;

        return (
          <React.Fragment key={index}>
            <CaretRight className="w-3 h-3 text-slate-600 shrink-0" />

            {isLast ? (
              <span className="flex items-center gap-1.5 font-bold text-white bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded-md border border-purple-500/20">
                {Icon && <Icon className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
                <span>{item.label}</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => item.tab && setActiveTab && setActiveTab(item.tab)}
                className="flex items-center gap-1.5 hover:text-purple-400 transition-colors cursor-pointer"
              >
                {Icon && <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                <span>{item.label}</span>
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
