import React, { useState, useEffect } from 'react';
import { X, Check, CaretDown } from '@phosphor-icons/react';

export const BottomSheetSelect = ({
  title = 'Pilihan Opsi',
  options = [],
  value,
  onChange,
  placeholder = 'Pilih opsi...',
  icon: TriggerIcon,
  triggerClassName = '',
  labelPrefix = '',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Close sheet when Escape key is pressed
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Lock body scroll when sheet is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const selectedOption = options.find(opt => String(opt.value) === String(value));
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  const handleSelect = (val) => {
    if (onChange) {
      onChange(val);
    }
    setIsOpen(false);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(true)}
        className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
          disabled ? 'opacity-50 cursor-not-allowed bg-slate-900 border-slate-800 text-slate-500' : triggerClassName || 'bg-slate-900/90 border-slate-800 text-white hover:border-amber-500/40 hover:bg-slate-800'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {TriggerIcon && <TriggerIcon className="w-4 h-4 text-amber-400 shrink-0" />}
          {labelPrefix && <span className="text-slate-400 font-medium shrink-0">{labelPrefix}</span>}
          <span className="truncate">{displayLabel}</span>
        </div>
        <CaretDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
      </button>

      {/* Bottom Sheet Popup Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-slate-900 border border-slate-800/90 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col justify-between animate-slide-up relative overflow-hidden"
          >
            {/* Mobile Drag Indicator Bar */}
            <div className="w-12 h-1.5 rounded-full bg-slate-700/80 mx-auto sm:hidden -mt-1 mb-1" />

            {/* Popup Header with 'X' Close Button */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                {TriggerIcon && <TriggerIcon className="w-5 h-5 text-amber-400 shrink-0" />}
                <h3 className="text-base sm:text-lg font-black text-white truncate">{title}</h3>
              </div>

              {/* 'X' Close Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer border border-slate-700/80 shrink-0"
                aria-label="Tutup"
                title="Tutup (Esc)"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Options List */}
            <div className="space-y-2 overflow-y-auto max-h-[60vh] pr-1 py-1 custom-scrollbar">
              {options.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                const OptionIcon = opt.icon;

                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full p-3.5 rounded-2xl border transition-all flex items-center justify-between text-left cursor-pointer group ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 ring-1 ring-amber-500/30 font-bold'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-200 hover:border-amber-500/40 hover:bg-slate-800/70 font-semibold'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {OptionIcon && (
                        <OptionIcon className={`w-4 h-4 ${opt.iconColor || 'text-amber-400'} shrink-0`} weight="fill" />
                      )}
                      <span className="text-xs sm:text-sm truncate">{opt.label}</span>
                      {opt.badge && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-800 text-slate-400 border border-slate-700">
                          {opt.badge}
                        </span>
                      )}
                    </div>

                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 text-amber-400" weight="bold" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Popup Footer Note */}
            <div className="pt-2 border-t border-slate-800/60 text-center">
              <p className="text-[11px] text-slate-400">
                Tekan opsi untuk memilih atau tombol <strong className="text-amber-300">&quot;X&quot;</strong> di atas untuk menutup.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
