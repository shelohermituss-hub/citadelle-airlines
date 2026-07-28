"use client";

import { useLocale, useTranslations } from "next-intl";
import type { FlightOffer } from "@/services/amadeus";
import { FlightSummaryHeader } from "@/components/booking/flight-summary-header";
import { useCurrency } from "@/components/providers/currency-provider";

export function BookingSummary({
  offer,
  passengerCount,
}: {
  offer: FlightOffer;
  passengerCount: number;
}) {
  const locale = useLocale();
  const t = useTranslations("BookingSummary");
  const { format } = useCurrency();

  const unitPrice = Number(offer.price.total);
  const total = unitPrice * passengerCount;

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 shadow-card">
      <h2 className="text-title text-foreground">{t("heading")}</h2>

      <div className="border-b border-border pb-4">
        <FlightSummaryHeader offer={offer} />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{t("passengersLabel", { count: passengerCount })}</span>
          <span>
            {format(unitPrice, locale)} {t("priceEach")}
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="text-title text-foreground">{t("total")}</span>
          <span className="text-2xl font-bold tabular-nums text-foreground">
            {format(total, locale)}
          </span>
        </div>
      </div>
    </div>
  );
}
