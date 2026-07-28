"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { format } from "date-fns";
import { enUS, fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { TripType } from "./trip-type-toggle";

const DATE_LOCALES = { fr, ht: fr, en: enUS } as const;

function formatDate(date: Date, locale: typeof fr) {
  return format(date, "d MMM yyyy", { locale });
}

export function DateRangeField({
  tripType,
  range,
  onChange,
}: {
  tripType: TripType;
  range: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
}) {
  const t = useTranslations("SearchForm");
  const locale = useLocale() as "fr" | "ht" | "en";
  const dateLocale = DATE_LOCALES[locale];
  const [open, setOpen] = useState(false);

  const calendarLabels = {
    labelPrevious: () => t("previousMonth"),
    labelNext: () => t("nextMonth"),
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className="flex min-w-0 flex-1 items-stretch overflow-hidden rounded-full border border-border bg-background text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        }
      >
        <span className="flex min-w-0 flex-1 flex-col gap-1 px-4 py-2">
          <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <CalendarIcon className="size-3.5" aria-hidden />
            {t("departDate")}
          </span>
          <span className="min-w-0 truncate text-base font-semibold text-foreground">
            {range?.from ? formatDate(range.from, dateLocale) : t("selectDate")}
          </span>
        </span>
        {tripType === "roundtrip" && (
          <span className="flex min-w-0 flex-1 flex-col gap-1 border-l border-border px-4 py-2">
            <span className="text-xs font-medium text-muted-foreground">
              {t("returnDate")}
            </span>
            <span className="min-w-0 truncate text-base font-semibold text-foreground">
              {range?.to ? formatDate(range.to, dateLocale) : t("selectDate")}
            </span>
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        {tripType === "roundtrip" ? (
          <Calendar
            mode="range"
            numberOfMonths={2}
            locale={dateLocale}
            labels={calendarLabels}
            selected={range}
            onSelect={onChange}
            disabled={{ before: today }}
          />
        ) : (
          <Calendar
            mode="single"
            numberOfMonths={2}
            locale={dateLocale}
            labels={calendarLabels}
            selected={range?.from}
            onSelect={(date) =>
              onChange(date ? { from: date, to: undefined } : undefined)
            }
            disabled={{ before: today }}
          />
        )}
        <div className="flex justify-end border-t border-border pt-3">
          <Button
            type="button"
            size="sm"
            onClick={() => setOpen(false)}
            disabled={!range?.from || (tripType === "roundtrip" && !range?.to)}
          >
            {t("done")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
