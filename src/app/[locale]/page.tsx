import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const t = useTranslations("HomePage");

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="font-serif text-4xl font-semibold text-foreground sm:text-5xl">
        {t("title")}
      </h1>
      <p className="max-w-md text-muted-foreground">{t("subtitle")}</p>
      <Button>{t("searchCta")}</Button>
    </div>
  );
}
