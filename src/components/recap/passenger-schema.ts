import { z } from "zod";
import { differenceInCalendarDays, differenceInYears } from "date-fns";

/**
 * Validation du formulaire passager (docs/anatomie-tunnel.md
 * section 5). Messages d'erreur en français, clairs et actionnables.
 */

const NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/;
const PASSPORT_REGEX = /^[A-Za-z0-9]+$/;
const PHONE_REGEX = /^[0-9+()\s-]+$/;

const MIN_ADULT_AGE = 12;
const MIN_PASSPORT_VALIDITY_DAYS = 183; // ~6 mois, règle internationale usuelle

/** Le schéma dépend de la date de vol (âge minimum, validité du passeport). */
export function createPassengerSchema(departureDate: Date) {
  return z.object({
    firstName: z
      .string()
      .trim()
      .min(2, "Le prénom doit contenir au moins 2 caractères.")
      .max(50, "Le prénom est trop long.")
      .regex(NAME_REGEX, "Le prénom ne doit contenir que des lettres."),
    lastName: z
      .string()
      .trim()
      .min(2, "Le nom doit contenir au moins 2 caractères.")
      .max(50, "Le nom est trop long.")
      .regex(NAME_REGEX, "Le nom ne doit contenir que des lettres."),
    dateOfBirth: z
      .string()
      .min(1, "La date de naissance est requise.")
      .refine(
        (value) => !Number.isNaN(Date.parse(value)),
        "Date de naissance invalide."
      )
      .refine(
        (value) => new Date(value).getTime() <= departureDate.getTime(),
        "La date de naissance ne peut pas être dans le futur."
      )
      .refine(
        (value) => differenceInYears(departureDate, new Date(value)) >= MIN_ADULT_AGE,
        `Le passager doit avoir au moins ${MIN_ADULT_AGE} ans à la date du vol.`
      ),
    gender: z.enum(["MALE", "FEMALE", "UNSPECIFIED"], {
      error: () => "Veuillez sélectionner une option.",
    }),
    passportNumber: z
      .string()
      .trim()
      .min(6, "Le numéro de passeport doit contenir au moins 6 caractères.")
      .max(9, "Le numéro de passeport ne doit pas dépasser 9 caractères.")
      .regex(
        PASSPORT_REGEX,
        "Le numéro de passeport ne doit contenir que des lettres et des chiffres."
      ),
    passportExpiry: z
      .string()
      .min(1, "La date d'expiration du passeport est requise.")
      .refine(
        (value) => !Number.isNaN(Date.parse(value)),
        "Date d'expiration invalide."
      )
      .refine(
        (value) =>
          differenceInCalendarDays(new Date(value), departureDate) >=
          MIN_PASSPORT_VALIDITY_DAYS,
        "Le passeport doit rester valide au moins 6 mois après la date du vol."
      ),
    email: z
      .string()
      .trim()
      .min(1, "L'adresse e-mail est requise.")
      .email("Adresse e-mail invalide."),
    phone: z
      .string()
      .trim()
      .min(7, "Le numéro de téléphone est trop court.")
      .max(20, "Le numéro de téléphone est trop long.")
      .regex(PHONE_REGEX, "Le numéro de téléphone contient des caractères invalides."),
    loyaltyNumber: z
      .string()
      .trim()
      .max(20, "Le numéro est trop long.")
      .optional()
      .or(z.literal("")),
  });
}

export type PassengerFormValues = z.infer<
  ReturnType<typeof createPassengerSchema>
>;

export function createPassengersSchema(departureDate: Date, count: number) {
  return z.object({
    passengers: z
      .array(createPassengerSchema(departureDate))
      .length(count, "Tous les passagers doivent être renseignés."),
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
