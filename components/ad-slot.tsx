type AdSlotProps = {
  id?: string;
  className?: string;
  minHeight?: number;
};

export function AdSlot({ id = "ad-slot", className = "", minHeight = 90 }: AdSlotProps) {
  return (
    <div
      id={id}
      aria-label="Advertisement"
      className={`mx-auto flex w-full max-w-5xl items-center justify-center overflow-hidden border-y border-black/5 bg-white/60 px-4 py-3 text-center ${className}`}
      style={{ minHeight }}
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/30">Advertisement</span>
    </div>
  );
}
