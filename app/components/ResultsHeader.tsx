"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check, ArrowDownWideNarrow } from "lucide-react";

const OPTIONS = [
  { value: "relevance", label: "Paling relevan" },
  { value: "price", label: "Paling murah" },
  { value: "rating", label: "Rating tertinggi" },
];

interface ResultsHeaderProps {
  count: number;
  sortBy: string;
  onSortChange: (value: string) => void;
}

export default function ResultsHeader({ count, sortBy, onSortChange }: ResultsHeaderProps) {
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

  const current = OPTIONS.find((o) => o.value === sortBy) ?? OPTIONS[0];

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="font-display text-xl font-semibold text-[#12291F] sm:text-2xl">
          Hasil Pencarian
        </h2>
        <p className="mt-1 text-sm text-[#3F5147]">Ditemukan {count} tempat</p>
      </div>

      <div ref={containerRef} className="relative w-full sm:w-auto">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={`Urutkan berdasarkan, saat ini: ${current.label}`}
          onClick={() => setOpen((prev) => !prev)}
          className={`flex w-full items-center gap-2.5 rounded-2xl border bg-white px-4 py-2.5 text-sm font-semibold text-[#12291F] shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0E4A34]/40 sm:w-56 ${
            open
              ? "border-[#0E4A34]/40 ring-2 ring-[#0E4A34]/20"
              : "border-black/10 hover:border-[#0E4A34]/30 hover:shadow-md"
          }`}
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0E4A34]/10 text-[#0E4A34]">
            <ArrowDownWideNarrow size={14} aria-hidden="true" />
          </span>
          <span className="flex-1 text-left">
            <span className="block text-[10px] font-medium uppercase tracking-wide text-[#3F5147]/70">
              Urutkan
            </span>
            <span className="block leading-tight">{current.label}</span>
          </span>
          <ChevronDown
            size={16}
            className={`shrink-0 text-[#0E4A34] transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          />
        </button>

        <ul
          role="listbox"
          className={`absolute right-0 z-20 mt-2 w-full origin-top overflow-hidden rounded-2xl border border-black/5 bg-white p-1.5 shadow-[0_18px_40px_rgba(18,41,31,0.18)] transition-all duration-200 sm:w-56 ${
            open
              ? "translate-y-0 scale-100 opacity-100"
              : "pointer-events-none -translate-y-1 scale-95 opacity-0"
          }`}
        >
          {OPTIONS.map((option) => {
            const isSelected = option.value === sortBy;
            return (
              <li key={option.value} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => {
                    onSortChange(option.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-colors duration-150 ${
                    isSelected
                      ? "bg-[#C8E85A]/35 font-semibold text-[#0E4A34]"
                      : "text-[#3F5147] hover:bg-black/[0.04]"
                  }`}
                >
                  {option.label}
                  {isSelected && <Check size={15} aria-hidden="true" />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}