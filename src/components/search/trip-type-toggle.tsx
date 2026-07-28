"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export type TripType = "roundtrip" | "oneway";

export function TripTypeToggle({
  value,
  onChange,
}: {
  value: TripType;
  onChange: (value: TripType) => void;
}) {
  const t = useTranslations("SearchForm");

  const options: { value: TripType; label: string }[] = [
    { value: "roundtrip", label: t("tripTypeRoundtrip") },
    { value: "oneway", label: t("tripTypeOneway") },
  ];

  return (
    <div
      role="radiogroup"
      aria-label={t("tripTypeLabel")}
      className="inline-flex w-fit rounded-full border border-border bg-background p-1"
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isActive
                ? "bg-citadelle-noir text-white"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
