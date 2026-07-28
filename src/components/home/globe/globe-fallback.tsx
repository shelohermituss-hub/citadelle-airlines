import Image from "next/image";

/** Rendu statique du globe (voir scripts/capture-globe-fallback) — utilisé
 * sans WebGL, avec prefers-reduced-motion, ou sur device bas de gamme. */
export function GlobeFallback() {
  return (
    <Image
      src="/brand/globe-fallback.webp"
      alt=""
      fill
      priority
      sizes="100vw"
      className="object-cover"
    />
  );
}
