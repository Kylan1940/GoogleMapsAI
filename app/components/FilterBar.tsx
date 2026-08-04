"use client";

import { useEffect, useRef, useState } from "react";
import { SlidersHorizontal, Clock, Phone, Globe, Check } from "lucide-react";

export interface PlaceFilters {
  openNow: boolean;
  hasPhone: boolean;
  hasWebsite: boolean;
}

type FilterKey = keyof PlaceFilters;

interface FilterBarProps {
  filters: PlaceFilters;
  onToggle: (key: FilterKey) => void;
  onReset: () => void;
  resultCount: number;
  totalCount: number;
}

const FILTER_OPTIONS: { key: FilterKey; label: string; icon: typeof Clock }[] = [
  { key: "openNow", label: "Buka sekarang", icon: Clock },
  { key: "hasPhone", label: "Ada nomor telepon", icon: Phone },
  { key: "hasWebsite", label: "Ada website", icon: Globe },
];

export default function FilterBar({
  filters,
  onToggle,
  onReset,
  resultCount,
  totalCount,
}: FilterBarProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <div ref={containerRef} className="relative">
        <button
          type="button"
          aria-haspopup="true"
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
          className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-colors duration-200 ${
            open || activeCount > 0
              ? "border-[#0E4A34] bg-[#0E4A34] text-white"
              : "border-black/10 bg-white text-[#3F5147] hover:border-[#0E4A34]/30 hover:bg-[#0E4A34]/5"
          }`}
        >
          <SlidersHorizontal size={14} aria-hidden="true" />
          Filter
          {activeCount > 0 && (
            <span
              className={`flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                open ? "bg-white text-[#0E4A34]" : "bg-[#C8E85A] text-[#0E4A34]"
              }`}
            >
              {activeCount}
            </span>
          )}
        </button>

        <div
          role="menu"
          className={`absolute left-0 z-20 mt-2 w-64 origin-top-left overflow-hidden rounded-2xl border border-black/5 bg-white p-1.5 shadow-[0_18px_40px_rgba(18,41,31,0.18)] transition-all duration-200 ${
            open
              ? "translate-y-0 scale-100 opacity-100"
              : "pointer-events-none -translate-y-1 scale-95 opacity-0"
          }`}
        >
          {FILTER_OPTIONS.map(({ key, label, icon: Icon }) => {
            const checked = filters[key];
            return (
              <button
                key={key}
                type="button"
                role="menuitemcheckbox"
                aria-checked={checked}
                onClick={() => onToggle(key)}
                className="flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-[#3F5147] transition-colors duration-150 hover:bg-black/4"
              >
                <span className="flex items-center gap-2">
                  <Icon size={15} className="text-[#0E4A34]/70" aria-hidden="true" />
                  {label}
                </span>
                <span
                  className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                    checked
                      ? "border-[#0E4A34] bg-[#0E4A34] text-white"
                      : "border-black/20 text-transparent"
                  }`}
                >
                  <Check size={12} aria-hidden="true" />
                </span>
              </button>
            );
          })}

          {activeCount > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="mt-1 flex w-full items-center justify-center rounded-xl px-3 py-2 text-xs font-semibold text-[#3F5147] transition-colors hover:bg-black/4 hover:text-[#0E4A34]"
            >
              Reset filter
            </button>
          )}
        </div>
      </div>

      {activeCount > 0 && (
        <span className="text-xs text-[#3F5147]">
          Menampilkan {resultCount} dari {totalCount} tempat
        </span>
      )}
    </div>
  );
}