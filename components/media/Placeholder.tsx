import { Monogram } from "@/components/ui/Monogram";

/** Shown until `npm run seed:images` has filled the slot. */
export function Placeholder({ slot }: { slot: string }) {
  return (
    <div
      role="img"
      aria-label={`Placeholder image (${slot})`}
      className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(120%_90%_at_30%_20%,#efe6d8_0%,#e2d5c1_45%,#cdbb9f_100%)]"
    >
      <Monogram className="h-1/4 max-h-24 w-auto text-gold-deep/40" />
      <span className="mono absolute bottom-2 left-2 text-ink/50">placeholder — {slot}</span>
    </div>
  );
}
