"use client";

import { useTranslations } from "next-intl";
import { ArrowUpDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SortKey = "price" | "duration" | "departure";

export function SortBar({
  value,
  onChange,
  resultsCount,
}: {
  value: SortKey;
  onChange: (value: SortKey) => void;
  resultsCount: number;
}) {
  const t = useTranslations("Results");

  const sortLabels: Record<SortKey, string> = {
    price: t("sortPrice"),
    duration: t("sortDuration"),
    departure: t("sortDeparture"),
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm font-medium text-foreground">
        {t("resultsCount", { count: resultsCount })}
      </p>
      <Select
        value={value}
        onValueChange={(next) => next && onChange(next as SortKey)}
      >
        <SelectTrigger className="w-auto gap-2 border-border bg-card text-sm">
          <ArrowUpDown className="size-3.5 text-muted-foreground" aria-hidden />
          <span className="text-muted-foreground">{t("sortLabel")}:</span>
          <SelectValue>
            {(selected: SortKey | null) => (selected ? sortLabels[selected] : "")}
          </SelectValue>
        </SelectTrigger>
        <SelectContent align="end">
          <SelectItem value="price">{t("sortPrice")}</SelectItem>
          <SelectItem value="duration">{t("sortDuration")}</SelectItem>
          <SelectItem value="departure">{t("sortDeparture")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
