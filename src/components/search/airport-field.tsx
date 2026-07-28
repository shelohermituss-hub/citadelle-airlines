"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { PlaneLanding, PlaneTakeoff, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { AirportCode } from "@/services/amadeus";

export function AirportField({
  kind,
  label,
  placeholder,
  value,
  options,
  onChange,
  variant = "standalone",
}: {
  kind: "origin" | "destination";
  label: string;
  placeholder: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  /** "grouped" retire la bordure/le fond propres au champ pour s'imbriquer dans une pilule commune (voir search-form.tsx). */
  variant?: "standalone" | "grouped";
}) {
  const tAirports = useTranslations("Airports");
  const t = useTranslations("SearchForm");
  const Icon = kind === "origin" ? PlaneTakeoff : PlaneLanding;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return options;
    return options.filter((code) => {
      const cityName = tAirports(code as AirportCode).toLowerCase();
      return (
        cityName.includes(normalizedQuery) ||
        code.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [options, query, tAirports]);

  const selectedLabel = value
    ? `${tAirports(value as AirportCode)} (${value})`
    : "";

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) setQuery("");
      }}
    >
      <PopoverTrigger
        render={
          <button
            type="button"
            className={cn(
              "flex min-w-0 flex-1 flex-col gap-1 px-4 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              variant === "standalone"
                ? "rounded-xl border border-border bg-background"
                : "rounded-full"
            )}
          />
        }
      >
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
        <span className="flex min-w-0 items-center gap-2 text-base font-semibold text-foreground">
          <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          {selectedLabel ? (
            <span className="min-w-0 flex-1 truncate">{selectedLabel}</span>
          ) : (
            <span className="min-w-0 flex-1 truncate font-normal text-muted-foreground">
              {placeholder}
            </span>
          )}
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <div className="border-b border-border p-2">
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={placeholder}
              aria-label={placeholder}
              className="pl-8"
            />
          </div>
        </div>
        <ul className="max-h-64 overflow-y-auto p-1" role="listbox">
          {filteredOptions.length === 0 && (
            <li className="px-3 py-2 text-sm text-muted-foreground">
              {t("noAirportResults")}
            </li>
          )}
          {filteredOptions.map((code) => (
            <li key={code}>
              <button
                type="button"
                role="option"
                aria-selected={code === value}
                onClick={() => {
                  onChange(code);
                  setOpen(false);
                  setQuery("");
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-muted",
                  code === value && "bg-muted font-medium text-foreground"
                )}
              >
                <span>{tAirports(code as AirportCode)}</span>
                <span className="text-xs text-muted-foreground">{code}</span>
              </button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
