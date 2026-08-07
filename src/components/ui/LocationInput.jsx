import React, { useState, useEffect, useRef } from 'react';
import { MapPin, X, CircleNotch, Sparkle, CaretDown, CaretUp } from '@phosphor-icons/react';
import { getAllFormattedLocations, cleanAreaName } from '../../lib/locationService';

export const LocationInput = ({
  value = '',
  onChange,
  placeholder = 'Blitar, Jawa Timur'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [allLocations, setAllLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const containerRef = useRef(null);
  const isJustSelectedRef = useRef(false);

  // Pre-load all 489+ Kabupaten/Kota + Provinsi combinations in Indonesia
  useEffect(() => {
    const loadLocations = async () => {
      setIsLoading(true);
      const data = await getAllFormattedLocations();
      setAllLocations(data);
      setIsLoading(false);
    };
    loadLocations();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSearchResult = (item) => {
    isJustSelectedRef.current = true;
    if (onChange) onChange(item.formatted);
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    isJustSelectedRef.current = false;
    const val = e.target.value;
    if (onChange) onChange(val);
    if (!isOpen) setIsOpen(true);
  };

  // Filter options based on user text input
  const cleanQ = (value || '').trim().toLowerCase();
  const parts = cleanQ.split(',').map(s => s.trim()).filter(Boolean);

  const filteredOptions = !cleanQ
    ? allLocations
    : allLocations.filter(item => {
        const formattedLower = item.formatted.toLowerCase();
        const rawRegLower = item.regencyName.toLowerCase();
        const provLower = item.provinceName.toLowerCase();

        return parts.every(part => 
          formattedLower.includes(part) || rawRegLower.includes(part) || provLower.includes(part)
        );
      });

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* MAIN TEXT INPUT FIELD */}
      <div className="relative flex items-center">
        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400 pointer-events-none" />
        
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            if (!isJustSelectedRef.current) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          className="w-full pl-10 pr-12 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-purple-500 transition-all placeholder:text-slate-500"
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={() => {
                isJustSelectedRef.current = false;
                if (onChange) onChange('');
                setIsOpen(true);
              }}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Hapus lokasi"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              isJustSelectedRef.current = false;
              setIsOpen(!isOpen);
            }}
            className="p-1 text-slate-400 hover:text-purple-400 rounded-lg transition-colors cursor-pointer"
          >
            {isOpen ? <CaretUp className="w-4 h-4" /> : <CaretDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* DROPDOWN MENU LIST ("Kabupaten/Kota, Provinsi") */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-xl shadow-2xl shadow-purple-950/40 overflow-hidden text-slate-100 animate-in fade-in slide-in-from-top-1 duration-150">
          
          {/* Header Status Bar */}
          <div className="px-3.5 py-2 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-[11px] font-bold text-purple-300">
            <span className="flex items-center gap-1.5">
              <Sparkle className="w-3.5 h-3.5 text-purple-400" />
              {cleanQ ? `Pencarian Lokasi ("${value}")` : 'Daftar Lokasi Kabupaten/Kota & Provinsi'}
            </span>
            {isLoading ? (
              <div className="flex items-center gap-1.5 text-[10px] text-purple-400 font-normal">
                <CircleNotch className="w-3.5 h-3.5 animate-spin" />
                <span>Memuat data...</span>
              </div>
            ) : (
              <span className="text-[10px] text-slate-400 font-normal">
                {filteredOptions.length} Lokasi
              </span>
            )}
          </div>

          {/* Option Items Dropdown Menu List */}
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/40 custom-scrollbar">
            {isLoading ? (
              <div className="flex items-center justify-center py-6 text-slate-400 text-xs gap-2">
                <CircleNotch className="w-4 h-4 animate-spin text-purple-400" />
                <span>Memuat data wilayah Indonesia...</span>
              </div>
            ) : filteredOptions.length > 0 ? (
              filteredOptions.map((item) => (
                <div
                  key={item.code}
                  onClick={() => handleSelectSearchResult(item)}
                  className="flex items-center justify-between px-3.5 py-2.5 hover:bg-purple-600/25 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-purple-200">
                        {item.cleanRegencyName || cleanAreaName(item.regencyName)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Provinsi {item.provinceName}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-semibold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30 shrink-0">
                    {item.formatted}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-5 px-4 text-center text-slate-400 text-xs">
                Lokasi "<strong className="text-slate-200">{value}</strong>" tidak ditemukan. Silakan periksa kembali ejaan nama Kota/Kabupaten atau Provinsi.
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};
