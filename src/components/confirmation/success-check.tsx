import { Check } from "lucide-react";

/** Animation de succès (§7) — pas de librairie externe, tw-animate-css suffit. */
export function SuccessCheck() {
  return (
    <div className="relative flex size-20 shrink-0 items-center justify-center">
      <span className="absolute inset-0 animate-in zoom-in-50 fade-in rounded-full bg-success/15 duration-700" />
      <span className="absolute inset-2 animate-in zoom-in-50 fade-in rounded-full bg-success/25 duration-700 delay-150 fill-mode-both" />
      <span className="relative flex size-14 animate-in zoom-in-50 fade-in items-center justify-center rounded-full bg-success text-success-foreground duration-500 delay-300 fill-mode-both">
        <Check className="size-7" strokeWidth={3} aria-hidden />
      </span>
    </div>
  );
}
