import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const LEGAL_LINKS = [
  { href: "/conditions-generales", messageKey: "terms" },
  { href: "/confidentialite", messageKey: "privacy" },
  { href: "/cookies", messageKey: "cookies" },
] as const;

export async function SiteFooter() {
  const t = await getTranslations("Footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:px-8 lg:py-16">
        <div>
          <h2 className="font-serif text-base font-semibold text-foreground">
            {t("legalHeading")}
          </h2>
          <ul className="mt-4 flex flex-col gap-2">
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="rounded text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {t(link.messageKey)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-serif text-base font-semibold text-foreground">
            {t("contactHeading")}
          </h2>
          <ul className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
            <li>
              <a
                href={`mailto:${t("contactEmail")}`}
                className="rounded transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {t("contactEmail")}
              </a>
            </li>
            <li>
              <a
                href={`tel:${t("contactPhone").replace(/\s+/g, "")}`}
                className="rounded transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {t("contactPhone")}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border px-4 py-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs text-muted-foreground">
          {t("rights", { year })}
        </p>
      </div>
    </footer>
  );
}
