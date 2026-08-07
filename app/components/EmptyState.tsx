import { SearchAlert } from "lucide-react";
import en from "../messages/en";
import id from "../messages/id";

interface EmptyStateProps {
  language: "id" | "en";
}

export default function EmptyState({ language }: EmptyStateProps) {
  const t = language === "id" ? id : en;

  return (
    <div className="flex flex-col items-center justify-center rounded-[22px] border border-dashed border-[#0E4A34]/20 bg-white/50 px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0E4A34]/10 text-[#0E4A34]">
        <SearchAlert size={26} aria-hidden="true" />
      </span>
      <h3 className="mt-5 font-display text-lg font-semibold text-[#12291F]">
        {t.emptyStateTitle}
      </h3>
      <p className="mt-2 max-w-90 text-sm leading-relaxed text-[#3F5147]">
        {t.emptyStateDescription}{" "}
        <a
          href="https://github.com/Kylan1940/GoogleMapsAI/issues/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#0E4A34] underline hover:no-underline"
        >
          GitHub
        </a>
      </p>
    </div>
  );
}