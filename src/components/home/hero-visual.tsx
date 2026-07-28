"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import { useCurrency } from "@/components/providers/currency-provider";
import type { FeaturedOffer } from "@/lib/featured-offer";

export function HeroVisual({ featuredOffer }: { featuredOffer: FeaturedOffer }) {
  const t = useTranslations("HomePage");
  const tAirports = useTranslations("Airports");
  const locale = useLocale();
  const { format } = useCurrency();

  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-md lg:mx-0 lg:w-[calc(100%+2.5rem)]">
      <div className="absolute inset-0 overflow-hidden rounded-t-[999px] rounded-b-[56px] shadow-card-lg">
        <Image
          src="/brand/hero-arch.webp"
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 45vw, 90vw"
          className="object-cover"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
        className="absolute -left-2 top-10 w-52 rounded-2xl border border-border bg-card p-4 shadow-card-lg sm:-left-6 sm:w-56"
      >
        <p className="text-label">{t("heroProofLabel")}</p>
        <p className="mt-1 font-serif text-lg font-semibold text-foreground">
          {tAirports(featuredOffer.origin)} → {tAirports(featuredOffer.destination)}
        </p>
        <p className="mt-1 text-2xl font-bold tabular-nums text-primary">
          {format(featuredOffer.priceTotal, locale)}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.4 }}
        className="absolute -bottom-2 right-2 flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-card-lg sm:right-6"
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircle2 className="size-4" aria-hidden />
        </span>
        <span className="text-sm font-medium text-foreground">
          {t("heroProofToast")}
        </span>
      </motion.div>
    </div>
  );
}
