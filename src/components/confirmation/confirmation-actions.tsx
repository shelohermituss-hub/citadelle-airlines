"use client";

import { useTranslations } from "next-intl";
import { CalendarPlus, Download } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Télécharger le billet / Ajouter au calendrier : non fonctionnels
 * pour l'instant (docs/anatomie-tunnel.md §7), désactivés plutôt que
 * silencieusement inertes.
 */
export function ConfirmationActions() {
  const t = useTranslations("Confirmation");

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 shadow-card">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="outline" size="lg" disabled className="flex-1 gap-2">
          <Download aria-hidden />
          {t("downloadTicket")}
        </Button>
        <Button variant="outline" size="lg" disabled className="flex-1 gap-2">
          <CalendarPlus aria-hidden />
          {t("addToCalendar")}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">{t("actionsHint")}</p>
      <Link
        href="/ma-reservation"
        className={cn(
          buttonVariants({ variant: "default", size: "lg" }),
          "mt-2 self-start"
        )}
      >
        {t("manageBooking")}
      </Link>
    </div>
  );
}
