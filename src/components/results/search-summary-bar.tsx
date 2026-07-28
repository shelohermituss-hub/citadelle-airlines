"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { format } from "date-fns";
import { enUS, fr } from "date-fns/locale";
import { Pencil } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SearchForm } from "@/components/search/search-form";
import type { AirportCode } from "@/services/amadeus";

const DATE_LOCALES = { fr, ht: fr, en: enUS } as const;

/** Barre de résumé condensée sous la recherche complète (voir accueil.jpg / resultats.jpg de Navan). */
export function SearchSummaryBar({
  origin,
  destination,
  departureDate,
  adults,
}: {
  origin: string;
  destination: string;
  departureDate: string;
  adults: number;
}) {
  const t = useTranslations("Results");
  const tAirports = useTranslations("Airports");
  const locale = useLocale() as "fr" | "ht" | "en";
  const [open, setOpen] = useState(false);

  const dateLocale = DATE_LOCALES[locale];
  const formattedDate = departureDate
    ? format(new Date(`${departureDate}T00:00:00`), "d MMM yyyy", {
        locale: dateLocale,
      })
    : "";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-full border border-border bg-card px-5 py-3 shadow-card">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        <span className="font-serif text-base font-semibold text-foreground">
          {tAirports(origin as AirportCode)} ⇄ {tAirports(destination as AirportCode)}
        </span>
        <span className="text-muted-foreground">· {formattedDate}</span>
        <span className="text-muted-foreground">
          · {t("passengerCount", { count: adults })}
        </span>
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-primary hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          }
        >
          <Pencil className="size-3.5" aria-hidden />
          {t("editSearch")}
        </PopoverTrigger>
        <PopoverContent className="w-[min(90vw,420px)] p-4" align="end">
          <SearchForm
            initialValues={{
              tripType: "oneway",
              origin,
              destination,
              range: { from: new Date(`${departureDate}T00:00:00`), to: undefined },
              passengers: adults,
            }}
            onSubmitted={() => setOpen(false)}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
