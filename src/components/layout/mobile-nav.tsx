"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MainNav } from "./main-nav";
import { LanguageSwitcher } from "./language-switcher";

export function MobileNav() {
  const t = useTranslations("Nav");
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("openMenu")}
            className="md:hidden"
          />
        }
      >
        <Menu className="size-5" aria-hidden />
      </SheetTrigger>
      <SheetContent side="right" className="w-3/4 sm:max-w-xs">
        <SheetHeader className="flex-row items-center border-b border-border">
          <Image
            src="/brand/logo-horizontal.png"
            alt={t("logoAlt")}
            width={500}
            height={500}
            className="h-9 w-auto"
          />
          <SheetTitle className="sr-only">{t("openMenu")}</SheetTitle>
        </SheetHeader>
        <MainNav
          className="flex flex-col gap-1 px-4"
          linkClassName="w-full py-3 text-base"
          onNavigate={() => setOpen(false)}
        />
        <div className="mt-auto border-t border-border p-4">
          <LanguageSwitcher className="w-full justify-center" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
