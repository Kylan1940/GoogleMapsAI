"use client";

import { Search, ArrowRight, Loader2 } from "lucide-react";
import en from "../messages/en";
import id from "../messages/id";

interface SearchBarProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  onSearch: () => void;
  loading: boolean;
  language: "id" | "en";
}

export default function SearchBar({
  prompt,
  onPromptChange,
  onSearch,
  loading,
  language,
}: SearchBarProps) {
  const t = language === "id" ? id : en;

  return (
    <section className="mx-auto max-w-180 px-5">
      <div className="flex flex-col gap-3 rounded-[22px] border border-black/5 bg-white/80 p-2.5 shadow-[0_8px_30px_rgba(14,74,52,0.08)] backdrop-blur sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-3 rounded-2xl bg-white px-4 focus-within:ring-2 focus-within:ring-[#0E4A34]/40">
          <Search size={20} className="shrink-0 text-[#0E4A34]/60" aria-hidden="true" />
          <label htmlFor="search-input" className="sr-only">
            {t.search}
          </label>
          <input
            id="search-input"
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSearch();
            }}
            placeholder={t.searchPlaceholder}
            className="h-14.5 w-full bg-transparent text-[15px] text-[#12291F] placeholder:text-[#12291F]/40 focus:outline-none sm:h-15.5"
          />
        </div>

        <button
          onClick={() => onSearch()}
          disabled={loading}
          className="flex h-14.5 w-full items-center justify-center gap-2 rounded-2xl bg-[#0E4A34] px-6 text-[15px] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#123F2B] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 sm:h-15.5 sm:w-auto"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" aria-hidden="true" />
              {t.searching}
            </>
          ) : (
            <>
              {t.searchButton}
              <ArrowRight size={18} aria-hidden="true" />
            </>
          )}
        </button>
      </div>
    </section>
  );
}