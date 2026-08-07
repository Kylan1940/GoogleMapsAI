"use client";

import { useEffect, useState } from "react";
import en from "../messages/en";
import id from "../messages/id";

interface HeroProps {
  language: "id" | "en";
}

export default function Hero({ language }: HeroProps) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const t = language === "id" ? id : en;

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);

      const timeout = setTimeout(() => {
        setIndex((prev) => (prev + 1) % t.heroQueries.length);
        setVisible(true);
      }, 300);

      return () => clearTimeout(timeout);
    }, 1600);

    return () => clearInterval(interval);
  }, [t.heroQueries.length]);

  const current = t.heroQueries[index];

  return (
    <section className="mx-auto max-w-205 px-5 pb-10 pt-14 text-center md:pt-20">
      <h1 className="flex flex-wrap items-center justify-center gap-x-1 gap-y-1 font-display text-[38px] font-black leading-[0.95] tracking-tight text-[#12291F] sm:text-[52px] md:text-[64px]">
        <span>Google</span>
        <span>Maps</span>
        <span className="relative ml-1 inline-flex items-center rounded-2xl bg-linear-to-br from-[#0E4A34] to-[#123F2B] px-3 text-white shadow-[0_8px_20px_rgba(14,74,52,0.35)]">
          AI
          <span
            className="absolute -right-1.5 -top-1.5 h-3.5 w-3.5 rounded-full bg-[#C8E85A] shadow-[0_0_0_4px_rgba(200,232,90,0.25)] animate-pulse-soft"
            aria-hidden="true"
          />
        </span>
      </h1>

      <p
        className="mx-auto mt-4 flex min-h-16 max-w-150 flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[19px] font-medium leading-snug text-[#2A3B32] sm:text-[22px] md:text-[26px]"
        aria-live="polite"
      >
        <span>{language === "id" ? "Temukan" : "Find"}</span>
        <span
          className={`rounded-md bg-[#0E4A34]/10 px-2 py-0.5 font-semibold text-[#0E4A34] transition-all duration-300 ${
            visible ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"
          }`}
        >
          {current.title}
        </span>
        <span>{language === "id" ? "di" : "in"}</span>
        <span
          className={`border-b-2 border-[#C8E85A] font-semibold text-[#12291F] transition-all duration-300 ${
            visible ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"
          }`}
        >
          {current.location}
        </span>
      </p>

      <p className="mx-auto mt-5 max-w-130 text-[15px] leading-relaxed text-[#3F5147] md:text-base">
        {t.heroDescription}
      </p>
    </section>
  );
}