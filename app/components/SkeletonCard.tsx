export default function SkeletonList() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse-soft rounded-[20px] border border-black/5 bg-white p-5"
        >
          <div className="h-5 w-3/4 rounded-full bg-[#0E4A34]/10" />
          <div className="mt-3 h-3.5 w-full rounded-full bg-[#0E4A34]/10" />
          <div className="mt-2 h-3.5 w-2/3 rounded-full bg-[#0E4A34]/10" />
          <div className="mt-4 flex gap-2">
            <div className="h-6 w-20 rounded-full bg-[#0E4A34]/10" />
            <div className="h-6 w-16 rounded-full bg-[#0E4A34]/10" />
          </div>
          <div className="mt-4 h-9 w-full rounded-xl bg-[#0E4A34]/10" />
        </div>
      ))}
    </div>
  );
}