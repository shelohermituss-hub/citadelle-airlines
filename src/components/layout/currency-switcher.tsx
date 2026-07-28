"use client";

import { useTranslations } from "next-intl";
import { CheckIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useCurrency,
  type CurrencyCode,
} from "@/components/providers/currency-provider";
import { cn } from "@/lib/utils";

const CURRENCIES: CurrencyCode[] = ["USD", "EUR"];

export function CurrencySwitcher({ className }: { className?: string }) {
  const { currency, setCurrency } = useCurrency();
  const t = useTranslations("Currency");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
      >
        <span className="sr-only">{t("changeCurrency")}: </span>
        {currency}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {CURRENCIES.map((code) => (
          <DropdownMenuItem
            key={code}
            aria-current={code === currency ? "true" : undefined}
            onClick={() => setCurrency(code)}
            className="flex items-center justify-between gap-4"
          >
            {t(code)}
            {code === currency && <CheckIcon className="size-4" aria-hidden />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
