import { z } from "zod";

/**
 * Validation du formulaire de paiement (docs/anatomie-tunnel.md
 * section 6). Aucune vraie intégration : ces champs ne sont jamais
 * envoyés à un processeur de paiement, l'écran est une interface
 * seule (voir payment-view.tsx). Les messages d'erreur viennent de
 * next-intl (namespace PaymentForm.errors) — le schéma est donc
 * construit à l'appel, avec la fonction de traduction du composant.
 */

const NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/;
const PHONE_REGEX = /^[0-9+()\s-]+$/;

export type Translate = (
  key: string,
  values?: Record<string, string | number>
) => string;

function luhnCheck(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\s+/g, "");
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = Number(digits[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

export function isCardNumberValid(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\s+/g, "");
  return /^\d{13,19}$/.test(digits) && luhnCheck(digits);
}

export function isExpiryValid(expiry: string): boolean {
  const match = /^(\d{2})\/(\d{2})$/.exec(expiry);
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return false;
  const expiryDate = new Date(year, month, 0, 23, 59, 59);
  return expiryDate.getTime() >= Date.now();
}

export function createPaymentSchema(t: Translate) {
  const acceptTermsField = {
    acceptTerms: z
      .boolean()
      .refine((value) => value === true, t("errors.acceptTermsRequired")),
  };

  const cardSchema = z.object({
    method: z.literal("card"),
    cardholderName: z
      .string()
      .trim()
      .min(2, t("errors.cardholderNameRequired"))
      .regex(NAME_REGEX, t("errors.cardholderNameFormat")),
    cardNumber: z
      .string()
      .min(1, t("errors.cardNumberRequired"))
      .refine(
        (value) => /^\d{13,19}$/.test(value.replace(/\s+/g, "")),
        t("errors.cardNumberFormat")
      )
      .refine(isCardNumberValid, t("errors.cardNumberInvalid")),
    expiry: z
      .string()
      .min(1, t("errors.expiryRequired"))
      .regex(/^\d{2}\/\d{2}$/, t("errors.expiryFormat"))
      .refine(isExpiryValid, t("errors.expiryInvalid")),
    cvc: z
      .string()
      .min(1, t("errors.cvcRequired"))
      .regex(/^\d{3,4}$/, t("errors.cvcFormat")),
    billingAddress: z.string().trim().min(3, t("errors.billingAddressRequired")),
    billingCity: z.string().trim().min(2, t("errors.billingCityRequired")),
    billingPostalCode: z
      .string()
      .trim()
      .min(3, t("errors.billingPostalCodeRequired")),
    billingCountry: z.string().trim().min(2, t("errors.billingCountryRequired")),
    ...acceptTermsField,
  });

  const moncashSchema = z.object({
    method: z.literal("moncash"),
    moncashPhone: z
      .string()
      .trim()
      .min(8, t("errors.moncashPhoneRequired"))
      .regex(PHONE_REGEX, t("errors.moncashPhoneFormat")),
    ...acceptTermsField,
  });

  return z.discriminatedUnion("method", [cardSchema, moncashSchema]);
}

export type PaymentFormValues = z.infer<ReturnType<typeof createPaymentSchema>>;

export const EMPTY_CARD_PAYMENT: PaymentFormValues = {
  method: "card",
  cardholderName: "",
  cardNumber: "",
  expiry: "",
  cvc: "",
  billingAddress: "",
  billingCity: "",
  billingPostalCode: "",
  billingCountry: "",
  acceptTerms: false,
};

export const EMPTY_MONCASH_PAYMENT: PaymentFormValues = {
  method: "moncash",
  moncashPhone: "",
  acceptTerms: false,
};

/** Formate au fil de la saisie : "4111111111111111" -> "4111 1111 1111 1111". */
export function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 19);
  return (digits.match(/.{1,4}/g) ?? []).join(" ");
}

/** Formate au fil de la saisie : "1228" -> "12/28". */
export function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}
