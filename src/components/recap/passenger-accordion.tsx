"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { useTranslations } from "next-intl";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PassengerForm } from "./passenger-form";
import type { PassengersFormValues } from "./passenger-schema";

function PassengerLabel({ index }: { index: number }) {
  const t = useTranslations("PassengerForm");
  const { control } = useFormContext<PassengersFormValues>();
  const firstName = useWatch({ control, name: `passengers.${index}.firstName` });
  const lastName = useWatch({ control, name: `passengers.${index}.lastName` });
  const fullName = [firstName, lastName].filter(Boolean).join(" ");

  return (
    <span className="flex items-center gap-2">
      <span>{t("passengerLabel", { number: index + 1 })}</span>
      {fullName && (
        <span className="font-normal text-muted-foreground">— {fullName}</span>
      )}
    </span>
  );
}

export function PassengerAccordion({ count }: { count: number }) {
  if (count <= 1) {
    return <PassengerForm index={0} />;
  }

  return (
    <Accordion defaultValue={["passenger-0"]}>
      {Array.from({ length: count }).map((_, index) => (
        <AccordionItem key={index} value={`passenger-${index}`}>
          <AccordionTrigger>
            <PassengerLabel index={index} />
          </AccordionTrigger>
          <AccordionContent>
            <PassengerForm index={index} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
