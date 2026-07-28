"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { SearchForm } from "@/components/search/search-form";
import { GlobeFallback } from "./globe/globe-fallback";
import { GlobeLoader } from "./globe/globe-loader";
import { GlobeSkeleton } from "./globe/globe-skeleton";
import { useGlobeCapability } from "./globe/use-globe-capability";

/**
 * `shortcuts` est injecté par page.tsx (Server Component) : ShortcutCards
 * lit des traductions côté serveur et ne peut pas être importé directement
 * dans ce composant client, seulement reçu en enfant déjà rendu.
 */
export function HeroGlobe({ shortcuts }: { shortcuts: ReactNode }) {
  const t = useTranslations("HomePage");
  const capability = useGlobeCapability();

  return (
    <section className="relative isolate flex min-h-[640px] flex-col overflow-hidden bg-citadelle-noir sm:min-h-[720px] lg:min-h-[800px]">
      <div className="absolute inset-0">
        {capability === "supported" && <GlobeLoader />}
        {capability === "fallback" && <GlobeFallback />}
        {capability === "checking" && <GlobeSkeleton />}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-citadelle-noir/85 via-citadelle-noir/35 to-citadelle-noir/10" />

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[24px] bg-card p-6 shadow-xl sm:p-8">
          <h1 className="font-serif text-3xl font-semibold text-foreground sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-1 text-muted-foreground">{t("subtitle")}</p>
          <div className="mt-6">
            <SearchForm />
          </div>
        </div>

        <div className="mt-8">{shortcuts}</div>
      </div>
    </section>
  );
}
