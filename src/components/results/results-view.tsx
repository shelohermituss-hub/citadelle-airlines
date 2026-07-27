"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { format } from "date-fns";
import { enUS, fr } from "date-fns/locale";
import { Link, useRouter } from "@/i18n/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { amadeusClient, type FlightOffer } from "@/services/amadeus";
import { FlightCard } from "./flight-card";
import { FlightCardSkeleton } from "./flight-card-skeleton";
import { DEFAULT_FILTERS, FlightFilters, type FiltersState } from "./flight-filters";
import { SortBar, type SortKey } from "./sort-bar";
import {
  formatDurationMinutes,
  getOfferFare,
  getTimeOfDay,
  isDirect,
} from "./flight-offer-utils";

const DATE_LOCALES = { fr, ht: fr, en: enUS } as const;
const EMPTY_OFFERS: FlightOffer[] = [];

function pickRecommendedId(offers: FlightOffer[]): string | undefined {
  if (offers.length === 0) return undefined;
  const directs = offers.filter(isDirect);
  const pool = directs.length > 0 ? directs : offers;
  return pool.reduce((best, offer) =>
    Number(offer.price.total) < Number(best.price.total) ? offer : best
  ).id;
}

function sortOffers(offers: FlightOffer[], sort: SortKey): FlightOffer[] {
  return [...offers].sort((a, b) => {
    if (sort === "price") return Number(a.price.total) - Number(b.price.total);
    if (sort === "duration") {
      return (
        formatDurationMinutes(a.itineraries[0].duration) -
        formatDurationMinutes(b.itineraries[0].duration)
      );
    }
    return (
      new Date(a.itineraries[0].segments[0].departure.at).getTime() -
      new Date(b.itineraries[0].segments[0].departure.at).getTime()
    );
  });
}

function filterOffers(offers: FlightOffer[], filters: FiltersState): FlightOffer[] {
  return offers.filter((offer) => {
    if (filters.directOnly && !isDirect(offer)) return false;
    if (
      filters.timesOfDay.length > 0 &&
      !filters.timesOfDay.includes(getTimeOfDay(offer))
    ) {
      return false;
    }
    if (
      filters.fares.length > 0 &&
      !filters.fares.includes(getOfferFare(offer).brandedFare)
    ) {
      return false;
    }
    return true;
  });
}

export function ResultsView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Results");
  const tAirports = useTranslations("Airports");

  const [sort, setSort] = useState<SortKey>("price");
  const [filters, setFilters] = useState<FiltersState>(DEFAULT_FILTERS);

  const origin = searchParams.get("originLocationCode") ?? "";
  const destination = searchParams.get("destinationLocationCode") ?? "";
  const departureDate = searchParams.get("departureDate") ?? "";
  const adults = Number(searchParams.get("adults") ?? "1");

  const hasRequiredParams = Boolean(origin && destination && departureDate);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [
      "flight-offers",
      origin,
      destination,
      departureDate,
      adults,
    ] as const,
    queryFn: () =>
      amadeusClient.searchFlights({
        originLocationCode: origin,
        destinationLocationCode: destination,
        departureDate,
        adults,
      }),
    enabled: hasRequiredParams,
  });

  const allOffers = data?.data ?? EMPTY_OFFERS;
  const recommendedId = useMemo(() => pickRecommendedId(allOffers), [allOffers]);
  const hasStops = useMemo(() => allOffers.some((offer) => !isDirect(offer)), [
    allOffers,
  ]);

  const visibleOffers = useMemo(
    () => sortOffers(filterOffers(allOffers, filters), sort),
    [allOffers, filters, sort]
  );

  function handleSelect(offer: FlightOffer) {
    const params = new URLSearchParams(searchParams);
    params.set("offerId", offer.id);
    router.push(`/recapitulatif?${params.toString()}`);
  }

  if (!hasRequiredParams) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-10 text-center">
        <p className="text-muted-foreground">{t("missingParams")}</p>
        <Link href="/" className={buttonVariants({ variant: "default" })}>
          {t("backToSearch")}
        </Link>
      </div>
    );
  }

  const dateLocale = DATE_LOCALES[locale as "fr" | "ht" | "en"];
  const formattedDate = departureDate
    ? format(new Date(`${departureDate}T00:00:00`), "d MMMM yyyy", {
        locale: dateLocale,
      })
    : "";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            ← {t("backToSearch")}
          </Link>
        </div>
        <h1 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">
          {t("heading", {
            origin: tAirports(origin as "PAP" | "CAP" | "JFK" | "MIA" | "SDQ"),
            destination: tAirports(
              destination as "PAP" | "CAP" | "JFK" | "MIA" | "SDQ"
            ),
          })}
        </h1>
        <p className="text-muted-foreground">
          {t("subheading", {
            date: formattedDate,
            passengers: t("passengerCount", { count: adults }),
          })}
        </p>
      </div>

      {isError ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-10 text-center">
          <p className="text-muted-foreground">{t("loadError")}</p>
          <Button variant="outline" onClick={() => refetch()}>
            {t("retry")}
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <FlightFilters
              filters={filters}
              onChange={setFilters}
              hasStops={hasStops}
            />
          </aside>

          <div className="flex flex-col gap-4">
            {!isLoading && (
              <SortBar
                value={sort}
                onChange={setSort}
                resultsCount={visibleOffers.length}
              />
            )}

            {isLoading ? (
              <div className="flex flex-col gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <FlightCardSkeleton key={index} />
                ))}
              </div>
            ) : visibleOffers.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-10 text-center">
                <p className="font-medium text-foreground">{t("noResults")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("noResultsHint")}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {visibleOffers.map((offer) => (
                  <FlightCard
                    key={offer.id}
                    offer={offer}
                    recommended={offer.id === recommendedId}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
