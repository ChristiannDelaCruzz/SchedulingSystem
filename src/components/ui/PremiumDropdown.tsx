// src/components/ui/PremiumDropdown.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, Search } from 'lucide-react';

export interface DropdownOption {
  value: string | number;
  label: string;
  sublabel?: string;
}

interface PremiumDropdownProps {
  label?: string;
  value: string | number;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  icon?: React.ElementType;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  helperText?: string;
  searchable?: boolean;
}

interface DropdownPosition {
  top: number;
  left: number;
  width: number;
  openUpward: boolean;
}

export const PremiumDropdown: React.FC<PremiumDropdownProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  icon: Icon,
  disabled = false,
  required = false,
  error,
  helperText,
  searchable = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [position, setPosition] = useState<DropdownPosition>({
    top: 0,
    left: 0,
    width: 0,
    openUpward: false,
  });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((o) => String(o.value) === String(value));

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    const estimatedHeight = searchable ? 320 : 260;
    const spaceBelow = viewportHeight - rect.bottom;
    const openUpward = spaceBelow < estimatedHeight && rect.top > estimatedHeight;

    let left = rect.left;
    const width = rect.width;

    if (left + width > viewportWidth - 16) left = viewportWidth - width - 16;
    if (left < 16) left = 16;

    setPosition({
      top: openUpward ? rect.top : rect.bottom + 6,
      left,
      width,
      openUpward,
    });
  }, [searchable]);

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen) updatePosition();
    setIsOpen((v) => !v);
    if (isOpen) setSearchQuery('');
  };

  useEffect(() => {
    if (!isOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        panelRef.current &&
        !panelRef.current.contains(target)
      ) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    const id = setTimeout(() => document.addEventListener('mousedown', onClickOutside), 0);
    return () => {
      clearTimeout(id);
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && searchable && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen, searchable]);

  useEffect(() => {
    if (!isOpen) return;
    const update = () => updatePosition();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [isOpen, updatePosition]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen]);

  const filteredOptions =
    searchable && searchQuery
      ? options.filter(
          (o) =>
            o.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (o.sublabel || '').toLowerCase().includes(searchQuery.toLowerCase())
        )
      : options;

  const handleSelect = (optionValue: string | number) => {
    onChange(String(optionValue));
    setIsOpen(false);
    setSearchQuery('');
  };

  const panel =
    isOpen && !disabled
      ? createPortal(
          <div
            ref={panelRef}
            className="fixed bg-white border-2 border-slate-200 rounded-2xl shadow-2xl shadow-slate-900/10 overflow-hidden"
            style={{
              top: position.openUpward ? 'auto' : position.top,
              bottom: position.openUpward ? window.innerHeight - position.top + 6 : 'auto',
              left: position.left,
              width: position.width,
              zIndex: 99999,
            }}
          >
            {searchable && (
              <div className="p-3 border-b border-slate-100 bg-slate-50/70">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-9 pr-3 py-2 bg-white border-2 border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-cyan/10 focus:border-cyan"
                  />
                </div>
              </div>
            )}

            <div style={{ maxHeight: '240px', overflowY: 'auto' }} className="dropdown-scroll py-1">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Search className="w-5 h-5 text-slate-300 mx-auto mb-1.5" />
                  <p className="text-xs text-slate-500">No options found</p>
                </div>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = String(option.value) === String(value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelect(option.value)}
                      className={`
                        w-full flex items-center gap-3 px-3.5 py-2.5 text-left text-sm transition-colors
                        ${
                          isSelected
                            ? 'bg-cyan-50 text-cyan-900 font-semibold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }
                      `}
                    >
                      <span className="flex-1 min-w-0">
                        <span className="block font-medium truncate">{option.label}</span>
                        {option.sublabel && (
                          <span
                            className={`block text-xs mt-0.5 truncate ${
                              isSelected ? 'text-cyan-600' : 'text-slate-500'
                            }`}
                          >
                            {option.sublabel}
                          </span>
                        )}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-cyan-600 flex-shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div className="relative w-full">
      {label && (
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 bg-white text-left text-sm font-medium
          transition-all duration-200
          ${
            disabled
              ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
              : error
              ? 'border-red-300 hover:border-red-400'
              : isOpen
              ? 'border-cyan ring-4 ring-cyan/10'
              : 'border-slate-200 hover:border-slate-300 focus:outline-none focus:ring-4 focus:ring-cyan/10 focus:border-cyan'
          }
        `}
      >
        {Icon && (
          <Icon
            className={`w-4 h-4 flex-shrink-0 ${disabled ? 'text-slate-300' : 'text-cyan-600'}`}
          />
        )}

        <span className="flex-1 truncate">
          {selectedOption ? (
            <span className="text-slate-900 font-semibold">
              {selectedOption.label}
              {selectedOption.sublabel && (
                <span className="text-slate-500 font-normal"> — {selectedOption.sublabel}</span>
              )}
            </span>
          ) : (
            <span className="text-slate-500">{placeholder}</span>
          )}
        </span>

        <ChevronDown
          className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${
            disabled ? 'text-slate-300' : 'text-slate-400'
          } ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {panel}

      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
      {helperText && !error && <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>}
    </div>
  );
};

export default PremiumDropdown;