"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";

interface HeaderProps {
  language: "id" | "en";
  onLanguageChange: (lang: "id" | "en") => void;
}

function GithubIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

export default function Header({ language, onLanguageChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 h-19 border-b border-black/10 bg-[#0E4A34] shadow-[0_1px_12px_rgba(0,0,0,0.08)] md:h-20">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-5 md:px-8">
        <Link
          href="/"
          className="group flex items-center gap-2.5 text-white transition-opacity hover:opacity-90"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#C8E85A] text-[#0E4A34] transition-transform duration-300 group-hover:-translate-y-0.5">
            <MapPin size={18} strokeWidth={2.5} aria-hidden="true" />
          </span>
          <span className="font-display text-[18px] font-semibold tracking-tight md:text-[20px]">
            GoogleMaps <span className="text-[#C8E85A]">AI</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          
          <div className="flex items-center gap-1 rounded-full border border-white/15 bg-white/5 p-1">
            <button
              onClick={() => onLanguageChange("id")}
              className={`h-8 w-8 rounded-full flex items-center justify-center ${
                language === "id" ? "bg-white" : "hover:bg-white/10"
              }`}
            >
              <span className="fi fi-id rounded-sm"></span>
            </button>

            <button
              onClick={() => onLanguageChange("en")}
              className={`h-8 w-8 rounded-full flex items-center justify-center ${
                language === "en" ? "bg-white" : "hover:bg-white/10"
              }`}
            >
              <span className="fi fi-us rounded-sm"></span>
            </button>
          </div>

          <a
            href="https://github.com/Kylan1940"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-white transition hover:border-white/30 hover:bg-white/10"
          >
            <GithubIcon size={18} />
            <span className="hidden sm:block font-medium">@Kylan1940</span>
          </a>
        </div>
      </div>
    </header>
  );
}
