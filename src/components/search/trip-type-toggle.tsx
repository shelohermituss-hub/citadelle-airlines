"use client";

import { useTranslations } from "next-intl";
import { PillToggle } from "@/components/ui/pill-toggle";

export type TripType = "roundtrip" | "oneway";

export function TripTypeToggle({
  value,
  onChange,
}: {
  value: TripType;
  onChange: (value: TripType) => void;
}) {
  const t = useTranslations("SearchForm");

  return (
    <PillToggle
      ariaLabel={t("tripTypeLabel")}
      value={value}
      onChange={onChange}
      options={[
        { value: "roundtrip", label: t("tripTypeRoundtrip") },
        { value: "oneway", label: t("tripTypeOneway") },
      ]}
    />
  );
}
