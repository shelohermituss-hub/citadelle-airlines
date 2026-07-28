"use client";

import { useLocale, useTranslations } from "next-intl";
import type { FlightOffer } from "@/services/amadeus";
import { FlightSummaryHeader } from "@/components/booking/flight-summary-header";
import { useCurrency } from "@/components/providers/currency-provider";

export function PaymentSummary({
  offer,
  passengerCount,
}: {
  offer: FlightOffer;
  passengerCount: number;
}) {
  const locale = useLocale();
  const t = useTranslations("PaymentSummary");
  const { format } = useCurrency();

  const base = Number(offer.price.base);
  const unitTotal = Number(offer.price.total);
  const taxesAndFees = unitTotal - base;
  const grandTotal = unitTotal * passengerCount;

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 shadow-card">
      <h2 className="text-title text-foreground">{t("heading")}</h2>

      <div className="border-b border-border pb-4">
        <FlightSummaryHeader offer={offer} />
      </div>

      <div className="flex flex-col gap-2 border-b border-border pb-4 text-sm">
        <div className="flex items-center justify-between text-muted-foreground">
          <span>{t("baseFare")}</span>
          <span className="tabular-nums">{format(base, locale)}</span>
        </div>
        <div className="flex items-center justify-between text-muted-foreground">
          <span>{t("taxesAndFees")}</span>
          <span className="tabular-nums">{format(taxesAndFees, locale)}</span>
        </div>
        <div className="flex items-center justify-between font-medium text-foreground">
          <span>{t("perPassenger")}</span>
          <span className="tabular-nums">{format(unitTotal, locale)}</span>
        </div>
        <p className="text-muted-foreground">
          {t("passengersLabel", { count: passengerCount })}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-title text-foreground">{t("total")}</span>
        <span className="text-2xl font-bold tabular-nums text-foreground">
          {format(grandTotal, locale)}
        </span>
      </div>
    </div>
  );
}
