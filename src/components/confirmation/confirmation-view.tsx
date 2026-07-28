"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { amadeusClient, type Traveler } from "@/services/amadeus";
import { SuccessCheck } from "./success-check";
import { TripSummary } from "./trip-summary";
import { ConfirmationActions } from "./confirmation-actions";

/**
 * Aucun passager n'est persisté entre les écrans (voir recap-view.tsx
 * et payment-view.tsx : seuls les search params circulent). On ne
 * peut donc fournir à createOrder que des voyageurs de gabarit — le
 * PNR généré, lui, est bien réel (mock.client.ts).
 */
function buildPlaceholderTravelers(count: number): Traveler[] {
  return Array.from({ length: count }, (_, index) => ({
    id: String(index + 1),
    dateOfBirth: "",
    name: { firstName: "", lastName: "" },
    gender: "UNSPECIFIED",
    contact: { emailAddress: "", phones: [] },
    documents: [],
  }));
}

export function ConfirmationView() {
  const searchParams = useSearchParams();
  const t = useTranslations("Confirmation");

  const origin = searchParams.get("originLocationCode") ?? "";
  const destination = searchParams.get("destinationLocationCode") ?? "";
  const departureDate = searchParams.get("departureDate") ?? "";
  const offerId = searchParams.get("offerId") ?? "";
  const adults = Number(searchParams.get("adults") ?? "1");

  const hasRequiredParams = Boolean(
    origin && destination && departureDate && offerId
  );

  const { data, isLoading: isLoadingOffer } = useQuery({
    queryKey: ["flight-offers", origin, destination, departureDate, adults] as const,
    queryFn: () =>
      amadeusClient.searchFlights({
        originLocationCode: origin,
        destinationLocationCode: destination,
        departureDate,
        adults,
      }),
    enabled: hasRequiredParams,
  });

  const offer = data?.data.find((candidate) => candidate.id === offerId);

  const { data: orderData, isLoading: isCreatingOrder } = useQuery({
    queryKey: ["flight-order", offerId, adults] as const,
    queryFn: () =>
      amadeusClient.createOrder({
        flightOffers: [offer!],
        travelers: buildPlaceholderTravelers(adults),
      }),
    enabled: Boolean(offer),
    staleTime: Infinity,
  });

  const pnr = orderData?.data.associatedRecords[0]?.reference;

  if (!hasRequiredParams || (!isLoadingOffer && !offer)) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-10 text-center">
        <p className="text-muted-foreground">{t("notFound")}</p>
        <Link href="/" className={buttonVariants({ variant: "default" })}>
          {t("backToHome")}
        </Link>
      </div>
    );
  }

  if (isLoadingOffer || !offer || isCreatingOrder || !pnr) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-10 text-center">
        <p className="text-muted-foreground">{t("loading")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <SuccessCheck />
        <div className="flex flex-col gap-1">
          <h1 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">
            {t("successHeading")}
          </h1>
          <p className="text-muted-foreground">{t("successSubheading")}</p>
        </div>

        <div className="mt-2 flex flex-col items-center gap-1">
          <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {t("pnrLabel")}
          </span>
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 22, mass: 0.6 }}
            className="font-serif text-5xl font-bold tracking-[0.2em] text-foreground tabular-nums sm:text-6xl"
          >
            {pnr}
          </motion.span>
        </div>

        <p className="text-sm text-muted-foreground">{t("emailReminder")}</p>
      </div>

      <TripSummary offer={offer} passengerCount={adults} />
      <ConfirmationActions />
    </div>
  );
}
