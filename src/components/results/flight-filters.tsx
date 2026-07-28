"use client";

import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import type { BrandedFare } from "@/services/amadeus";
import type { TimeOfDay } from "./flight-offer-utils";

export interface FiltersState {
  directOnly: boolean;
  timesOfDay: TimeOfDay[];
  fares: BrandedFare[];
}

export const DEFAULT_FILTERS: FiltersState = {
  directOnly: false,
  timesOfDay: [],
  fares: [],
};

const TIME_OPTIONS: TimeOfDay[] = ["morning", "afternoon", "evening"];
const FARE_OPTIONS: BrandedFare[] = ["ECO", "ECOFLEX", "BUSINESS"];

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

interface Chip {
  key: string;
  label: string;
  onRemove: () => void;
}

export function FlightFilters({
  filters,
  onChange,
  hasStops,
}: {
  filters: FiltersState;
  onChange: (next: FiltersState) => void;
  /** false si aucune offre du résultat n'a d'escale (le filtre "directs" serait inutile) */
  hasStops: boolean;
}) {
  const t = useTranslations("Results");
  const tFare = useTranslations("Fares");

  const hasActiveFilters =
    filters.directOnly || filters.timesOfDay.length > 0 || filters.fares.length > 0;

  const chips: Chip[] = [
    ...(filters.directOnly
      ? [
          {
            key: "directOnly",
            label: t("directOnly"),
            onRemove: () => onChange({ ...filters, directOnly: false }),
          },
        ]
      : []),
    ...filters.timesOfDay.map((option) => ({
      key: `time-${option}`,
      label: t(option),
      onRemove: () =>
        onChange({ ...filters, timesOfDay: toggle(filters.timesOfDay, option) }),
    })),
    ...filters.fares.map((option) => ({
      key: `fare-${option}`,
      label: tFare(option),
      onRemove: () =>
        onChange({ ...filters, fares: toggle(filters.fares, option) }),
    })),
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-lg font-semibold text-foreground">
          {t("filtersHeading")}
        </h2>
        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange(DEFAULT_FILTERS)}
          >
            {t("resetFilters")}
          </Button>
        )}
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <Badge key={chip.key} variant="outline" className="gap-1 py-1 pr-1.5">
              {chip.label}
              <button
                type="button"
                onClick={chip.onRemove}
                aria-label={chip.label}
                className="flex size-3.5 items-center justify-center rounded-full hover:bg-muted"
              >
                <X className="size-3" aria-hidden />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <Accordion multiple defaultValue={["stops", "time", "fare"]}>
        {hasStops && (
          <AccordionItem value="stops">
            <AccordionTrigger>{t("stopsHeading")}</AccordionTrigger>
            <AccordionContent>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Checkbox
                  checked={filters.directOnly}
                  onCheckedChange={(checked) =>
                    onChange({ ...filters, directOnly: checked === true })
                  }
                />
                {t("directOnly")}
              </label>
            </AccordionContent>
          </AccordionItem>
        )}

        <AccordionItem value="time">
          <AccordionTrigger>{t("timeHeading")}</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-3">
              {TIME_OPTIONS.map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <Checkbox
                    checked={filters.timesOfDay.includes(option)}
                    onCheckedChange={() =>
                      onChange({
                        ...filters,
                        timesOfDay: toggle(filters.timesOfDay, option),
                      })
                    }
                  />
                  {t(option)}
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="fare">
          <AccordionTrigger>{t("fareHeading")}</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-3">
              {FARE_OPTIONS.map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <Checkbox
                    checked={filters.fares.includes(option)}
                    onCheckedChange={() =>
                      onChange({ ...filters, fares: toggle(filters.fares, option) })
                    }
                  />
                  {tFare(option)}
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
