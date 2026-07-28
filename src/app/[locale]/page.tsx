import { HeroGlobe } from "@/components/home/hero-globe";
import { ShortcutCards } from "@/components/home/shortcut-cards";

export default function HomePage() {
  return (
    <div className="flex flex-col pb-16">
      <HeroGlobe shortcuts={<ShortcutCards />} />
    </div>
  );
}
