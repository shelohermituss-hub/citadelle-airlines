"use client";

import { useTranslations } from "next-intl";
import { PlaneLanding, PlaneTakeoff } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AirportField({
  kind,
  label,
  placeholder,
  value,
  options,
  onChange,
}: {
  kind: "origin" | "destination";
  label: string;
  placeholder: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const tAirports = useTranslations("Airports");
  const Icon = kind === "origin" ? PlaneTakeoff : PlaneLanding;

  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-xl border border-border bg-background px-4 py-2">
      <span className="text-xs font-medium text-muted-foreground">
        {label}
      </span>
      <Select
        value={value}
        onValueChange={(nextValue) => nextValue && onChange(nextValue)}
      >
        <SelectTrigger className="h-auto w-full border-0 bg-transparent p-0 text-base font-semibold text-foreground shadow-none focus-visible:ring-0 [&_svg]:text-muted-foreground">
          <span className="flex items-center gap-2 truncate">
            <Icon className="size-4 shrink-0" aria-hidden />
            <SelectValue placeholder={placeholder} />
          </span>
        </SelectTrigger>
        <SelectContent>
          {options.map((code) => (
            <SelectItem key={code} value={code}>
              {tAirports(code as "PAP" | "CAP" | "JFK" | "MIA" | "SDQ")} ({code})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
