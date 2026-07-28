import { getTranslations } from "next-intl/server";
import { ClipboardCheck, PlaneTakeoff, Ticket } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { NAV_ITEMS } from "@/components/layout/nav-items";

const manageBookingHref =
  NAV_ITEMS.find((item) => item.messageKey === "manageBooking")?.href ??
  "/ma-reservation";
const flightStatusHref =
  NAV_ITEMS.find((item) => item.messageKey === "flightStatus")?.href ??
  "/statut-vol";

export async function ShortcutCards() {
  const t = await getTranslations();

  const cards = [
    {
      href: "/enregistrement",
      icon: ClipboardCheck,
      title: t("Shortcuts.checkin"),
      description: t("Shortcuts.checkinDescription"),
    },
    {
      href: manageBookingHref,
      icon: Ticket,
      title: t("Nav.manageBooking"),
      description: t("Shortcuts.manageBookingDescription"),
    },
    {
      href: flightStatusHref,
      icon: PlaneTakeoff,
      title: t("Nav.flightStatus"),
      description: t("Shortcuts.flightStatusDescription"),
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <Link
          key={card.href}
          href={card.href}
          className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-card transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-citadelle-noir">
            <card.icon className="size-5" aria-hidden />
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="font-serif text-base font-semibold text-foreground">
              {card.title}
            </span>
            <span className="text-sm text-muted-foreground">
              {card.description}
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}
