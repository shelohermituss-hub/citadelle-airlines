"use client";

import { usePathname } from "@/i18n/navigation";
import { FlightStepper, type BookingStep } from "@/components/booking/flight-stepper";
import { PageTransition } from "@/components/booking/page-transition";

const STEP_BY_PATH: Record<string, BookingStep> = {
  "/resultats": "flights",
  "/recapitulatif": "passengers",
  "/paiement": "payment",
  "/confirmation": "ticket",
};

/**
 * Layout partagé aux 4 écrans du tunnel (résultats → confirmation) : le
 * stepper reste monté une seule fois d'une page à l'autre (nécessaire
 * pour que l'avion glisse au lieu de resauter), et PageTransition anime
 * le changement de contenu.
 */
export default function TunnelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const current = STEP_BY_PATH[pathname] ?? "flights";

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <FlightStepper current={current} />
      <PageTransition pathKey={pathname}>{children}</PageTransition>
    </div>
  );
}
