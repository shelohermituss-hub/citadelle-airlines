"use client";

import { Controller, useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "./form-field";
import type { PassengersFormValues } from "./passenger-schema";

const GENDER_OPTIONS = ["MALE", "FEMALE", "UNSPECIFIED"] as const;

export function PassengerForm({ index }: { index: number }) {
  const t = useTranslations("PassengerForm");
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<PassengersFormValues>();

  const fieldErrors = errors.passengers?.[index];
  const genderLabels: Record<(typeof GENDER_OPTIONS)[number], string> = {
    MALE: t("genderMale"),
    FEMALE: t("genderFemale"),
    UNSPECIFIED: t("genderUnspecified"),
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label={t("firstName")}
            htmlFor={`passenger-${index}-firstName`}
            hint={t("passportHint")}
            error={fieldErrors?.firstName?.message}
          >
            <Input
              id={`passenger-${index}-firstName`}
              placeholder={t("firstNamePlaceholder")}
              autoComplete="given-name"
              aria-invalid={Boolean(fieldErrors?.firstName)}
              {...register(`passengers.${index}.firstName`)}
            />
          </FormField>

          <FormField
            label={t("lastName")}
            htmlFor={`passenger-${index}-lastName`}
            hint={t("passportHint")}
            error={fieldErrors?.lastName?.message}
          >
            <Input
              id={`passenger-${index}-lastName`}
              placeholder={t("lastNamePlaceholder")}
              autoComplete="family-name"
              aria-invalid={Boolean(fieldErrors?.lastName)}
              {...register(`passengers.${index}.lastName`)}
            />
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label={t("dateOfBirth")}
            htmlFor={`passenger-${index}-dateOfBirth`}
            error={fieldErrors?.dateOfBirth?.message}
          >
            <Input
              id={`passenger-${index}-dateOfBirth`}
              type="date"
              aria-invalid={Boolean(fieldErrors?.dateOfBirth)}
              {...register(`passengers.${index}.dateOfBirth`)}
            />
          </FormField>

          <FormField
            label={t("gender")}
            htmlFor={`passenger-${index}-gender`}
            error={fieldErrors?.gender?.message}
          >
            <Controller
              control={control}
              name={`passengers.${index}.gender`}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => value && field.onChange(value)}
                >
                  <SelectTrigger
                    id={`passenger-${index}-gender`}
                    className="w-full"
                    aria-invalid={Boolean(fieldErrors?.gender)}
                  >
                    <SelectValue placeholder={t("genderPlaceholder")}>
                      {(selected: (typeof GENDER_OPTIONS)[number] | null) =>
                        selected ? genderLabels[selected] : t("genderPlaceholder")
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {GENDER_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {genderLabels[option]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-foreground">
          {t("sectionPassport")}
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label={t("passportNumber")}
            htmlFor={`passenger-${index}-passportNumber`}
            error={fieldErrors?.passportNumber?.message}
          >
            <Input
              id={`passenger-${index}-passportNumber`}
              autoComplete="off"
              aria-invalid={Boolean(fieldErrors?.passportNumber)}
              {...register(`passengers.${index}.passportNumber`)}
            />
          </FormField>

          <FormField
            label={t("passportExpiry")}
            htmlFor={`passenger-${index}-passportExpiry`}
            error={fieldErrors?.passportExpiry?.message}
          >
            <Input
              id={`passenger-${index}-passportExpiry`}
              type="date"
              aria-invalid={Boolean(fieldErrors?.passportExpiry)}
              {...register(`passengers.${index}.passportExpiry`)}
            />
          </FormField>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-foreground">
          {t("sectionContact")}
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label={t("email")}
            htmlFor={`passenger-${index}-email`}
            error={fieldErrors?.email?.message}
          >
            <Input
              id={`passenger-${index}-email`}
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(fieldErrors?.email)}
              {...register(`passengers.${index}.email`)}
            />
          </FormField>

          <FormField
            label={t("phone")}
            htmlFor={`passenger-${index}-phone`}
            error={fieldErrors?.phone?.message}
          >
            <Input
              id={`passenger-${index}-phone`}
              type="tel"
              autoComplete="tel"
              aria-invalid={Boolean(fieldErrors?.phone)}
              {...register(`passengers.${index}.phone`)}
            />
          </FormField>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-foreground">
          {t("sectionLoyalty")}
        </h3>
        <FormField
          label={t("loyaltyNumber")}
          htmlFor={`passenger-${index}-loyaltyNumber`}
          error={fieldErrors?.loyaltyNumber?.message}
        >
          <Input
            id={`passenger-${index}-loyaltyNumber`}
            autoComplete="off"
            aria-invalid={Boolean(fieldErrors?.loyaltyNumber)}
            {...register(`passengers.${index}.loyaltyNumber`)}
          />
        </FormField>
      </section>
    </div>
  );
}
