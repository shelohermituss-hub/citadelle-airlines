"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { amadeusClient } from "@/services/amadeus";
import { useCurrency } from "@/components/providers/currency-provider";
import { PaymentForm } from "./payment-form";
import { PaymentSummary } from "./payment-summary";
import {
  createPaymentSchema,
  EMPTY_PAYMENT,
  type PaymentFormValues,
} from "./payment-schema";

export function PaymentView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Payment");
  const tPayment = useTranslations("PaymentForm");
  const { format } = useCurrency();

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

  const backToRecapHref = useMemo(() => {
    const params = new URLSearchParams(searchParams);
    return `/recapitulatif?${params.toString()}`;
  }, [searchParams]);

  const schema = useMemo(() => createPaymentSchema(tPayment), [tPayment]);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY_PAYMENT,
  });

  function onSubmit() {
    const params = new URLSearchParams(searchParams);
    router.push(`/confirmation?${params.toString()}`);
  }

  if (!hasRequiredParams || (!isLoading && !offer)) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-10 text-center">
        <p className="text-muted-foreground">{t("notFound")}</p>
        <Link href="/" className={buttonVariants({ variant: "default" })}>
          {t("backToRecap")}
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

  const grandTotal = Number(offer.price.total) * adults;
  const payAmountLabel = format(grandTotal, locale);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link
          href={backToRecapHref}
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          ← {t("backToRecap")}
        </Link>
        <h1 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">
          {t("stepHeading")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("demoNotice")}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            className="flex flex-col gap-6"
          >
            <PaymentForm payAmountLabel={payAmountLabel} />
          </form>
        </FormProvider>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <PaymentSummary offer={offer} passengerCount={adults} />
        </aside>
      </div>
    </div>
  );
}
