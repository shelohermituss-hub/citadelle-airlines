import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { SearchForm } from "@/components/search/search-form";
import { ShortcutCards } from "@/components/home/shortcut-cards";

export default async function HomePage() {
  const t = await getTranslations("HomePage");

  return (
    <div className="flex flex-col gap-10 pb-16">
      <section className="relative">
        <div className="relative h-64 w-full overflow-hidden sm:h-80 lg:h-[26rem]">
          <Image
            src="/brand/livree-avion.jpg"
            alt={t("heroImageAlt")}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-citadelle-noir/70 via-citadelle-noir/10 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto -mt-20 max-w-4xl px-4 sm:-mt-28 sm:px-6 lg:px-8">
          <div className="rounded-[24px] bg-card p-6 shadow-xl sm:p-8">
            <h1 className="font-serif text-3xl font-semibold text-foreground sm:text-4xl">
              {t("title")}
            </h1>
            <p className="mt-1 text-muted-foreground">{t("subtitle")}</p>
            <div className="mt-6">
              <SearchForm />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
        <ShortcutCards />
      </section>
    </div>
  );
}
