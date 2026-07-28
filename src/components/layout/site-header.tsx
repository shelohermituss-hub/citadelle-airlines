import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { MainNav } from "./main-nav";
import { LanguageSwitcher } from "./language-switcher";
import { CurrencySwitcher } from "./currency-switcher";
import { MobileNav } from "./mobile-nav";

export async function SiteHeader() {
  const t = await getTranslations("Nav");

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Image
            src="/brand/logo-horizontal.png"
            alt={t("logoAlt")}
            width={500}
            height={500}
            priority
            className="h-10 w-auto sm:h-11"
          />
        </Link>

        <MainNav className="hidden items-center gap-1 md:flex" />

        <div className="flex items-center gap-2">
          <CurrencySwitcher className="hidden md:inline-flex" />
          <LanguageSwitcher className="hidden md:inline-flex" />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
