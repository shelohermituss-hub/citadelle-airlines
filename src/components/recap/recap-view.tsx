"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { amadeusClient } from "@/services/amadeus";
import { BookingSummary } from "./booking-summary";
import { PassengerAccordion } from "./passenger-accordion";
import {
  createPassengersSchema,
  EMPTY_PASSENGER,
  type PassengersFormValues,
} from "./passenger-schema";

export function RecapView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations("Recap");

  const origin = searchParams.get("originLocationCode") ?? "";
  const destination = searchParams.get("destinationLocationCode") ?? "";
  const departureDate = searchParams.get("departureDate") ?? "";
  const offerId = searchParams.get("offerId") ?? "";
  const adults = Number(searchParams.get("adults") ?? "1");

  const hasRequiredParams = Boolean(
    origin && destination && departureDate && offerId
  );

  const { data, isLoading } = useQuery({
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

  const backToResultsHref = useMemo(() => {
    const params = new URLSearchParams(searchParams);
    params.delete("offerId");
    return `/resultats?${params.toString()}`;
  }, [searchParams]);

  const schema = useMemo(
    () =>
      createPassengersSchema(
        departureDate ? new Date(`${departureDate}T00:00:00`) : new Date(),
        adults
      ),
    [departureDate, adults]
  );

  const form = useForm<PassengersFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      passengers: Array.from({ length: adults }, () => EMPTY_PASSENGER),
    },
  });

  function onSubmit() {
    const params = new URLSearchParams(searchParams);
    router.push(`/paiement?${params.toString()}`);
  }

  if (!hasRequiredParams || (!isLoading && !offer)) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-10 text-center">
        <p className="text-muted-foreground">{t("notFound")}</p>
        <Link href="/" className={buttonVariants({ variant: "default" })}>
          {t("backToResults")}
        </Link>
      </div>
    );
  }

  if (isLoading || !offer) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-10 text-center">
        <p className="text-muted-foreground">{t("loading")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link
          href={backToResultsHref}
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          ← {t("backToResults")}
        </Link>
        <h1 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">
          {t("stepHeading")}
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            className="flex flex-col gap-6"
          >
            <PassengerAccordion count={adults} />
            <Button type="submit" size="lg" className="self-start">
              {t("submit")}
            </Button>
          </form>
        </FormProvider>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <BookingSummary offer={offer} passengerCount={adults} />
        </aside>
      </div>
    </div>
  );
}
