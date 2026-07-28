"use client";

import { Controller, useFormContext, useWatch } from "react-hook-form";
import { useTranslations } from "next-intl";
import { CheckCircle2, CreditCard, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { FormField } from "@/components/recap/form-field";
import {
  formatCardNumber,
  formatExpiry,
  isCardNumberValid,
  type PaymentFormValues,
} from "./payment-schema";

export function PaymentForm({ payAmountLabel }: { payAmountLabel: string }) {
  const t = useTranslations("PaymentForm");
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<PaymentFormValues>();

  const cardNumber = useWatch({ control, name: "cardNumber" });

  const cardNumberState =
    !cardNumber || cardNumber.replace(/\s+/g, "").length < 13
      ? "empty"
      : isCardNumberValid(cardNumber)
        ? "valid"
        : "invalid";

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-5">
      <h2 className="font-serif text-lg font-semibold text-foreground">
        {t("methodCard")}
      </h2>

      <div className="flex flex-col gap-4">
        <FormField
          label={t("cardholderName")}
          htmlFor="cardholderName"
          error={errors.cardholderName?.message}
        >
          <Input
            id="cardholderName"
            placeholder={t("cardholderNamePlaceholder")}
            autoComplete="cc-name"
            aria-invalid={Boolean(errors.cardholderName)}
            {...register("cardholderName")}
          />
        </FormField>

        <FormField
          label={t("cardNumber")}
          htmlFor="cardNumber"
          error={errors.cardNumber?.message}
        >
          <Controller
            control={control}
            name="cardNumber"
            render={({ field }) => (
              <div className="relative">
                <Input
                  id="cardNumber"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="4111 1111 1111 1111"
                  aria-invalid={Boolean(errors.cardNumber)}
                  value={field.value ?? ""}
                  onChange={(event) =>
                    field.onChange(formatCardNumber(event.target.value))
                  }
                  onBlur={field.onBlur}
                  className="pr-9"
                />
                <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center">
                  {cardNumberState === "valid" && (
                    <CheckCircle2 className="size-4 text-success" aria-hidden />
                  )}
                  {cardNumberState === "invalid" && (
                    <XCircle className="size-4 text-destructive" aria-hidden />
                  )}
                  {cardNumberState === "empty" && (
                    <CreditCard
                      className="size-4 text-muted-foreground"
                      aria-hidden
                    />
                  )}
                </span>
              </div>
            )}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label={t("expiry")}
            htmlFor="expiry"
            error={errors.expiry?.message}
          >
            <Controller
              control={control}
              name="expiry"
              render={({ field }) => (
                <Input
                  id="expiry"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  placeholder={t("expiryPlaceholder")}
                  aria-invalid={Boolean(errors.expiry)}
                  value={field.value ?? ""}
                  onChange={(event) =>
                    field.onChange(formatExpiry(event.target.value))
                  }
                  onBlur={field.onBlur}
                />
              )}
            />
          </FormField>

          <FormField label={t("cvc")} htmlFor="cvc" error={errors.cvc?.message}>
            <Input
              id="cvc"
              inputMode="numeric"
              autoComplete="cc-csc"
              maxLength={4}
              aria-invalid={Boolean(errors.cvc)}
              {...register("cvc")}
            />
          </FormField>
        </div>

        <h3 className="mt-2 text-sm font-semibold text-foreground">
          {t("billingHeading")}
        </h3>

        <FormField
          label={t("billingAddress")}
          htmlFor="billingAddress"
          error={errors.billingAddress?.message}
        >
          <Input
            id="billingAddress"
            autoComplete="address-line1"
            aria-invalid={Boolean(errors.billingAddress)}
            {...register("billingAddress")}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label={t("billingCity")}
            htmlFor="billingCity"
            error={errors.billingCity?.message}
          >
            <Input
              id="billingCity"
              autoComplete="address-level2"
              aria-invalid={Boolean(errors.billingCity)}
              {...register("billingCity")}
            />
          </FormField>
          <FormField
            label={t("billingPostalCode")}
            htmlFor="billingPostalCode"
            error={errors.billingPostalCode?.message}
          >
            <Input
              id="billingPostalCode"
              autoComplete="postal-code"
              aria-invalid={Boolean(errors.billingPostalCode)}
              {...register("billingPostalCode")}
            />
          </FormField>
        </div>

        <FormField
          label={t("billingCountry")}
          htmlFor="billingCountry"
          error={errors.billingCountry?.message}
        >
          <Input
            id="billingCountry"
            autoComplete="country-name"
            aria-invalid={Boolean(errors.billingCountry)}
            {...register("billingCountry")}
          />
        </FormField>
      </div>

      <div className="flex flex-col gap-2 border-t border-border pt-4">
        <label
          htmlFor="acceptTerms"
          className={cn(
            "flex items-start gap-2 text-sm text-muted-foreground",
            errors.acceptTerms && "text-destructive"
          )}
        >
          <Controller
            control={control}
            name="acceptTerms"
            render={({ field }) => (
              <Checkbox
                id="acceptTerms"
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                aria-invalid={Boolean(errors.acceptTerms)}
                className="mt-0.5"
              />
            )}
          />
          <span>
            {t.rich("termsLabel", {
              terms: (chunks) => (
                <Link
                  href="/conditions-generales"
                  target="_blank"
                  className="underline underline-offset-2 hover:text-foreground"
                >
                  {chunks}
                </Link>
              ),
            })}
          </span>
        </label>
        {errors.acceptTerms && (
          <p role="alert" className="text-xs font-medium text-destructive">
            {errors.acceptTerms.message}
          </p>
        )}
      </div>

      <Button type="submit" size="lg" className="self-start">
        {t("pay", { amount: payAmountLabel })}
      </Button>
    </div>
  );
}
