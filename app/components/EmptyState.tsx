import { SearchCheck } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-[22px] border border-dashed border-[#0E4A34]/20 bg-white/50 px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0E4A34]/10 text-[#0E4A34]">
        <SearchCheck size={26} aria-hidden="true" />
      </span>
      <h3 className="mt-5 font-display text-lg font-semibold text-[#12291F]">
        Mau cari tempat apa?
      </h3>
      <p className="mt-2 max-w-[360px] text-sm leading-relaxed text-[#3F5147]">
        Masukkan pencarian dengan bahasa natural, lalu biarkan AI membantu menemukan tempat yang
        sesuai.
      </p>
    </div>
  );
}