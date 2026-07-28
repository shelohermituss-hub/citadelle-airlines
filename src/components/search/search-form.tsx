"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { ArrowLeftRight, Search } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { getDestinationsFrom, getServedAirports } from "@/services/amadeus";
import { TripTypeToggle, type TripType } from "./trip-type-toggle";
import { AirportField } from "./airport-field";
import { DateRangeField } from "./date-range-field";
import { PassengersField } from "./passengers-field";
import { searchFormSchema } from "./search-schema";

export function SearchForm() {
  const t = useTranslations("SearchForm");
  const router = useRouter();

  const [tripType, setTripType] = useState<TripType>("roundtrip");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [passengers, setPassengers] = useState(1);

  const originOptions = getServedAirports();
  const destinationOptions = useMemo(
    () => getDestinationsFrom(origin),
    [origin]
  );

  function handleOriginChange(nextOrigin: string) {
    setOrigin(nextOrigin);
    const validDestinations = getDestinationsFrom(nextOrigin);
    if (!validDestinations.includes(destination)) {
      setDestination("");
    }
  }

  function handleSwap() {
    const nextOrigin = destination;
    const nextDestination = origin;
    setOrigin(nextOrigin);
    setDestination(nextDestination);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const result = searchFormSchema.safeParse({
      tripType,
      origin,
      destination,
      departDate: range?.from,
      returnDate: range?.to,
      passengers,
    });

    if (!result.success) return;

    const params = new URLSearchParams({
      originLocationCode: result.data.origin,
      destinationLocationCode: result.data.destination,
      departureDate: format(result.data.departDate, "yyyy-MM-dd"),
      adults: String(result.data.passengers),
    });
    if (result.data.returnDate) {
      params.set("returnDate", format(result.data.returnDate, "yyyy-MM-dd"));
    }

    router.push(`/resultats?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <TripTypeToggle value={tripType} onChange={setTripType} />

      <div className="flex flex-col gap-3">
        <div className="relative flex flex-1 items-stretch overflow-hidden rounded-full border border-border bg-background">
          <AirportField
            kind="origin"
            label={t("origin")}
            placeholder={t("originPlaceholder")}
            value={origin}
            options={originOptions}
            onChange={handleOriginChange}
            variant="grouped"
          />
          <div className="my-2 w-px bg-border" aria-hidden />
          <AirportField
            kind="destination"
            label={t("destination")}
            placeholder={t("destinationPlaceholder")}
            value={destination}
            options={destinationOptions}
            onChange={setDestination}
            variant="grouped"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-card shadow-card"
            aria-label={t("swapAirports")}
            onClick={handleSwap}
          >
            <ArrowLeftRight className="size-4" aria-hidden />
          </Button>
        </div>

        <DateRangeField tripType={tripType} range={range} onChange={setRange} />
      </div>

      <div className="flex items-center justify-between gap-3">
        <PassengersField value={passengers} onChange={setPassengers} />
        <Button
          type="submit"
          size="icon-lg"
          className="size-14 shrink-0 rounded-full bg-primary text-primary-foreground shadow-card-lg hover:bg-primary/90"
          aria-label={t("search")}
        >
          <Search className="size-5" aria-hidden />
        </Button>
      </div>
    </form>
  );
}
