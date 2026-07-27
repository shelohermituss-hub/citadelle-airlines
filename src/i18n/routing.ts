import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "ht", "en"],
  defaultLocale: "fr",
  localePrefix: "as-needed",
});
