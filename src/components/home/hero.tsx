import { getTranslations } from "next-intl/server";
import { SearchForm } from "@/components/search/search-form";
import { ShortcutCards } from "./shortcut-cards";
import { HeroVisual } from "./hero-visual";
import { getFeaturedOffer } from "@/lib/featured-offer";

export async function Hero() {
  const t = await getTranslations("HomePage");
  const featuredOffer = getFeaturedOffer();

  return (
    <section className="bg-background">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8 lg:py-16">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <h1 className="text-display text-foreground">{t("title")}</h1>
            <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
          </div>

          <div className="rounded-[28px] border border-border bg-card p-6 shadow-card-lg sm:p-8">
            <SearchForm />
          </div>

          <ShortcutCards />
        </div>

        <HeroVisual featuredOffer={featuredOffer} />
      </div>
    </section>
  );
}
