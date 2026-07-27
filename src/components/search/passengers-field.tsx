"use client";

import { useTranslations } from "next-intl";
import { Minus, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const MIN_PASSENGERS = 1;
const MAX_PASSENGERS = 9;

export function PassengersField({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const t = useTranslations("SearchForm");

  return (
    <Popover>
      <PopoverTrigger
        render={
          <button
            type="button"
            className="flex min-w-0 flex-col gap-1 rounded-xl border border-border bg-background px-4 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        }
      >
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Users className="size-3.5" aria-hidden />
          {t("passengers")}
        </span>
        <span className="truncate text-base font-semibold text-foreground">
          {t("passengerCount", { count: value })}
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="start">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">
              {t("adults")}
            </p>
            <p className="text-xs text-muted-foreground">{t("adultsHint")}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="-"
              disabled={value <= MIN_PASSENGERS}
              onClick={() => onChange(Math.max(MIN_PASSENGERS, value - 1))}
            >
              <Minus className="size-3.5" aria-hidden />
            </Button>
            <span className="w-4 text-center text-sm font-semibold tabular-nums">
              {value}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="+"
              disabled={value >= MAX_PASSENGERS}
              onClick={() => onChange(Math.min(MAX_PASSENGERS, value + 1))}
            >
              <Plus className="size-3.5" aria-hidden />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
