"use client";

import { useLocale, useTranslations } from "next-intl";
import { Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BrandedFare, FlightOffer } from "@/services/amadeus";
import { useCurrency } from "@/components/providers/currency-provider";
import {
  formatClock,
  getOfferFare,
  hasSeatSelection,
  isModifiable,
  isRefundable,
} from "./flight-offer-utils";

const FARE_ORDER: BrandedFare[] = ["ECO", "ECOFLEX", "BUSINESS"];
const RECOMMENDED_FARE: BrandedFare = "ECOFLEX";

export function FareComparisonDialog({
  open,
  onOpenChange,
  siblings,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Offres partageant le même itinéraire, une par palier tarifaire disponible. */
  siblings: FlightOffer[];
  onSelect: (offer: FlightOffer) => void;
}) {
  const locale = useLocale();
  const t = useTranslations("FareComparison");
  const tFare = useTranslations("Fares");
  const tResults = useTranslations("Results");
  const { format } = useCurrency();

  const reference = siblings[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        {reference && (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">
                {t("title")}
              </DialogTitle>
              <DialogDescription>
                {t("description", {
                  origin: reference.itineraries[0].segments[0].departure.iataCode,
                  destination:
                    reference.itineraries[0].segments.at(-1)!.arrival.iataCode,
                  departure: formatClock(
                    reference.itineraries[0].segments[0].departure.at,
                    locale
                  ),
                  arrival: formatClock(
                    reference.itineraries[0].segments.at(-1)!.arrival.at,
                    locale
                  ),
                })}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 sm:grid-cols-3">
              {FARE_ORDER.map((fareCode) => {
                const offer = siblings.find(
                  (sibling) => getOfferFare(sibling).brandedFare === fareCode
                );
                const isRecommended = fareCode === RECOMMENDED_FARE && Boolean(offer);
                const bagsQuantity = offer
                  ? (getOfferFare(offer).includedCheckedBags.quantity ?? 0)
                  : 0;

                return (
                  <div
                    key={fareCode}
                    className={cn(
                      "relative flex flex-col gap-4 rounded-2xl border bg-card p-5",
                      isRecommended ? "border-primary" : "border-border",
                      !offer && "opacity-60"
                    )}
                  >
                    {isRecommended && (
                      <span className="absolute -top-3 left-4 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                        {t("recommended")}
                      </span>
                    )}

                    <div>
                      <h3 className="font-serif text-lg font-semibold text-foreground">
                        {tFare(fareCode)}
                      </h3>
                      {offer ? (
                        <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
                          {format(offer.price.total, locale)}
                        </p>
                      ) : (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {t("notAvailable")}
                        </p>
                      )}
                    </div>

                    <ul className="flex flex-col gap-2 text-sm">
                      <FareRow
                        included={Boolean(offer) && bagsQuantity > 0}
                        label={
                          offer
                            ? `${t("baggage")} — ${tResults("bagsIncluded", {
                                count: bagsQuantity,
                              })}`
                            : t("baggage")
                        }
                      />
                      <FareRow
                        included={Boolean(offer) && isModifiable(fareCode)}
                        label={t("modification")}
                      />
                      <FareRow
                        included={Boolean(offer) && isRefundable(fareCode)}
                        label={t("refund")}
                      />
                      <FareRow
                        included={Boolean(offer) && hasSeatSelection(fareCode)}
                        label={t("seat")}
                      />
                    </ul>

                    <Button
                      className="mt-auto"
                      disabled={!offer}
                      onClick={() => offer && onSelect(offer)}
                    >
                      {t("select")}
                    </Button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function FareRow({ included, label }: { included: boolean; label: string }) {
  return (
    <li className="flex items-start gap-2">
      {included ? (
        <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
      ) : (
        <X className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
      )}
      <span className={included ? "text-foreground" : "text-muted-foreground"}>
        {label}
      </span>
    </li>
  );
}
