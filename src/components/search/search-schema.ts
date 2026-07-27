import { z } from "zod";

/**
 * Validation du formulaire de recherche avant de naviguer vers les
 * résultats. Les codes aéroports/routes valides viennent de
 * src/services/amadeus/airports.ts, jamais d'une liste en dur ici.
 */
export const searchFormSchema = z
  .object({
    tripType: z.enum(["roundtrip", "oneway"]),
    origin: z.string().length(3),
    destination: z.string().length(3),
    departDate: z.date(),
    returnDate: z.date().optional(),
    passengers: z.number().int().min(1).max(9),
  })
  .refine((data) => data.origin !== data.destination, {
    message: "origin-equals-destination",
    path: ["destination"],
  })
  .refine(
    (data) => data.tripType === "oneway" || data.returnDate !== undefined,
    {
      message: "return-date-required",
      path: ["returnDate"],
    }
  )
  .refine(
    (data) =>
      !data.returnDate || data.returnDate.getTime() >= data.departDate.getTime(),
    {
      message: "return-before-depart",
      path: ["returnDate"],
    }
  );

export type SearchFormValues = z.infer<typeof searchFormSchema>;
