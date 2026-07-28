import { z } from "zod";
import { differenceInCalendarDays, differenceInYears } from "date-fns";

/**
 * Validation du formulaire passager (docs/anatomie-tunnel.md
 * section 5). Les messages d'erreur viennent de next-intl
 * (namespace PassengerForm.errors) — le schéma est donc construit à
 * l'appel, avec la fonction de traduction du composant appelant.
 */

const NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/;
const PASSPORT_REGEX = /^[A-Za-z0-9]+$/;
const PHONE_REGEX = /^[0-9+()\s-]+$/;

const MIN_ADULT_AGE = 12;
const MIN_PASSPORT_VALIDITY_DAYS = 183; // ~6 mois, règle internationale usuelle

export type Translate = (
  key: string,
  values?: Record<string, string | number>
) => string;

/** Le schéma dépend de la date de vol (âge minimum, validité du passeport). */
export function createPassengerSchema(departureDate: Date, t: Translate) {
  return z.object({
    firstName: z
      .string()
      .trim()
      .min(2, t("errors.firstNameMin"))
      .max(50, t("errors.firstNameMax"))
      .regex(NAME_REGEX, t("errors.firstNameFormat")),
    lastName: z
      .string()
      .trim()
      .min(2, t("errors.lastNameMin"))
      .max(50, t("errors.lastNameMax"))
      .regex(NAME_REGEX, t("errors.lastNameFormat")),
    dateOfBirth: z
      .string()
      .min(1, t("errors.dobRequired"))
      .refine(
        (value) => !Number.isNaN(Date.parse(value)),
        t("errors.dobInvalid")
      )
      .refine(
        (value) => new Date(value).getTime() <= departureDate.getTime(),
        t("errors.dobFuture")
      )
      .refine(
        (value) => differenceInYears(departureDate, new Date(value)) >= MIN_ADULT_AGE,
        t("errors.dobMinAge", { age: MIN_ADULT_AGE })
      ),
    gender: z.enum(["MALE", "FEMALE", "UNSPECIFIED"], {
      error: () => t("errors.genderRequired"),
    }),
    passportNumber: z
      .string()
      .trim()
      .min(6, t("errors.passportNumberMin"))
      .max(9, t("errors.passportNumberMax"))
      .regex(PASSPORT_REGEX, t("errors.passportNumberFormat")),
    passportExpiry: z
      .string()
      .min(1, t("errors.passportExpiryRequired"))
      .refine(
        (value) => !Number.isNaN(Date.parse(value)),
        t("errors.passportExpiryInvalid")
      )
      .refine(
        (value) =>
          differenceInCalendarDays(new Date(value), departureDate) >=
          MIN_PASSPORT_VALIDITY_DAYS,
        t("errors.passportExpiryMinValidity")
      ),
    email: z
      .string()
      .trim()
      .min(1, t("errors.emailRequired"))
      .email(t("errors.emailInvalid")),
    phone: z
      .string()
      .trim()
      .min(7, t("errors.phoneMin"))
      .max(20, t("errors.phoneMax"))
      .regex(PHONE_REGEX, t("errors.phoneFormat")),
    loyaltyNumber: z
      .string()
      .trim()
      .max(20, t("errors.loyaltyMax"))
      .optional()
      .or(z.literal("")),
  });
}

export type PassengerFormValues = z.infer<
  ReturnType<typeof createPassengerSchema>
>;

export function createPassengersSchema(
  departureDate: Date,
  count: number,
  t: Translate
) {
  return z.object({
    passengers: z
      .array(createPassengerSchema(departureDate, t))
      .length(count, t("errors.allRequired")),
  });
}

export type PassengersFormValues = z.infer<
  ReturnType<typeof createPassengersSchema>
>;

export const EMPTY_PASSENGER: PassengerFormValues = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "UNSPECIFIED",
  passportNumber: "",
  passportExpiry: "",
  email: "",
  phone: "",
  loyaltyNumber: "",
};
