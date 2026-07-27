"use client";

import { useTranslations } from "next-intl";
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

  return (
    <div className="flex flex-col gap-6">
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

      {hasStops && (
        <fieldset className="flex flex-col gap-3">
          <legend className="text-sm font-medium text-foreground">
            {t("stopsHeading")}
          </legend>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox
              checked={filters.directOnly}
              onCheckedChange={(checked) =>
                onChange({ ...filters, directOnly: checked === true })
              }
            />
            {t("directOnly")}
          </label>
        </fieldset>
      )}

      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-medium text-foreground">
          {t("timeHeading")}
        </legend>
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
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-medium text-foreground">
          {t("fareHeading")}
        </legend>
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
      </fieldset>
    </div>
  );
}
