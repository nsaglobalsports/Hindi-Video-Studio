import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export interface DropdownOption<T extends string> {
  value: T;
  label: string;
  secondary?: string;
}

interface StudioDropdownProps<T extends string> {
  id: string;
  label: string;
  value: T;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
  rightAccessory?: React.ReactNode;
}

export function StudioDropdown<T extends string>({
  id,
  label,
  value,
  options,
  onChange,
  rightAccessory,
}: StudioDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((opt) => opt.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-xs font-medium text-[#94A3B8]">
          {label}
        </label>
        {rightAccessory}
      </div>

      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={`flex min-h-[46px] w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] ${
          open
            ? 'border-[#3B82F6] bg-[#0A1124]'
            : 'border-[#1E293B] bg-[#070C1A] hover:border-[#334155]'
        }`}
      >
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-[#F8FAFC]">{selected.label}</div>
          {selected.secondary && (
            <div className="truncate text-xs text-[#64748B]">{selected.secondary}</div>
          )}
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[#94A3B8] transition-transform duration-150 ${
            open ? 'rotate-180 text-[#3B82F6]' : ''
          }`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-labelledby={id}
          className="absolute left-0 right-0 z-40 mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-[#26354D] bg-[#0E172B] p-1.5 shadow-2xl shadow-black/60"
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex min-h-[44px] w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                  isSelected
                    ? 'bg-[#2563EB]/20 text-[#F8FAFC]'
                    : 'text-[#CBD5E1] hover:bg-[#16223B] hover:text-white'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{option.label}</div>
                  {option.secondary && (
                    <div className="truncate text-xs text-[#94A3B8]">{option.secondary}</div>
                  )}
                </div>
                {isSelected && <Check className="h-4 w-4 shrink-0 text-[#3B82F6]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
