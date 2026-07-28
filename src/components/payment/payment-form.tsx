"use client";

import { Controller, useFormContext, useWatch } from "react-hook-form";
import { useTranslations } from "next-intl";
import { CheckCircle2, CreditCard, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { FormField } from "@/components/recap/form-field";
import {
  EMPTY_CARD_PAYMENT,
  EMPTY_MONCASH_PAYMENT,
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
    setValue,
    formState: { errors },
  } = useFormContext<PaymentFormValues>();

  const method = useWatch({ control, name: "method" });
  const cardNumber = useWatch({ control, name: "cardNumber" as const }) as
    | string
    | undefined;

  const cardErrors = errors as Partial<
    Record<
      | "cardholderName"
      | "cardNumber"
      | "expiry"
      | "cvc"
      | "billingAddress"
      | "billingCity"
      | "billingPostalCode"
      | "billingCountry",
      { message?: string }
    >
  >;
  const moncashErrors = errors as Partial<
    Record<"moncashPhone", { message?: string }>
  >;

  const cardNumberState =
    !cardNumber || cardNumber.replace(/\s+/g, "").length < 13
      ? "empty"
      : isCardNumberValid(cardNumber)
        ? "valid"
        : "invalid";

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-5">
      <Tabs
        value={method}
        onValueChange={(value) => {
          // On repart de champs vides pour éviter de mélanger les deux schémas.
          const defaults =
            value === "moncash" ? EMPTY_MONCASH_PAYMENT : EMPTY_CARD_PAYMENT;
          (Object.keys(defaults) as Array<keyof PaymentFormValues>).forEach(
            (key) => {
              setValue(key, defaults[key] as never, { shouldValidate: false });
            }
          );
        }}
      >
        <TabsList className="w-full">
          <TabsTrigger value="card" className="flex-1">
            {t("methodCard")}
          </TabsTrigger>
          <TabsTrigger value="moncash" className="flex-1">
            {t("methodMoncash")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="card" className="flex flex-col gap-4 pt-2">
          <FormField
            label={t("cardholderName")}
            htmlFor="cardholderName"
            error={cardErrors.cardholderName?.message}
          >
            <Input
              id="cardholderName"
              placeholder={t("cardholderNamePlaceholder")}
              autoComplete="cc-name"
              aria-invalid={Boolean(cardErrors.cardholderName)}
              {...register("cardholderName")}
            />
          </FormField>

          <FormField
            label={t("cardNumber")}
            htmlFor="cardNumber"
            error={cardErrors.cardNumber?.message}
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
                    aria-invalid={Boolean(cardErrors.cardNumber)}
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
              error={cardErrors.expiry?.message}
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
                    aria-invalid={Boolean(cardErrors.expiry)}
                    value={field.value ?? ""}
                    onChange={(event) =>
                      field.onChange(formatExpiry(event.target.value))
                    }
                    onBlur={field.onBlur}
                  />
                )}
              />
            </FormField>

            <FormField label={t("cvc")} htmlFor="cvc" error={cardErrors.cvc?.message}>
              <Input
                id="cvc"
                inputMode="numeric"
                autoComplete="cc-csc"
                maxLength={4}
                aria-invalid={Boolean(cardErrors.cvc)}
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
            error={cardErrors.billingAddress?.message}
          >
            <Input
              id="billingAddress"
              autoComplete="address-line1"
              aria-invalid={Boolean(cardErrors.billingAddress)}
              {...register("billingAddress")}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label={t("billingCity")}
              htmlFor="billingCity"
              error={cardErrors.billingCity?.message}
            >
              <Input
                id="billingCity"
                autoComplete="address-level2"
                aria-invalid={Boolean(cardErrors.billingCity)}
                {...register("billingCity")}
              />
            </FormField>
            <FormField
              label={t("billingPostalCode")}
              htmlFor="billingPostalCode"
              error={cardErrors.billingPostalCode?.message}
            >
              <Input
                id="billingPostalCode"
                autoComplete="postal-code"
                aria-invalid={Boolean(cardErrors.billingPostalCode)}
                {...register("billingPostalCode")}
              />
            </FormField>
          </div>

          <FormField
            label={t("billingCountry")}
            htmlFor="billingCountry"
            error={cardErrors.billingCountry?.message}
          >
            <Input
              id="billingCountry"
              autoComplete="country-name"
              aria-invalid={Boolean(cardErrors.billingCountry)}
              {...register("billingCountry")}
            />
          </FormField>
        </TabsContent>

        <TabsContent value="moncash" className="flex flex-col gap-4 pt-2">
          <h3 className="text-sm font-semibold text-foreground">
            {t("moncashHeading")}
          </h3>
          <p className="text-sm text-muted-foreground">{t("moncashDescription")}</p>
          <FormField
            label={t("moncashPhone")}
            htmlFor="moncashPhone"
            error={moncashErrors.moncashPhone?.message}
          >
            <Input
              id="moncashPhone"
              type="tel"
              inputMode="tel"
              placeholder="+509 3400 1122"
              aria-invalid={Boolean(moncashErrors.moncashPhone)}
              {...register("moncashPhone")}
            />
          </FormField>
        </TabsContent>
      </Tabs>

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
