"use client";

import dynamic from "next/dynamic";
import { GlobeSkeleton } from "./globe-skeleton";

const GlobeCanvas = dynamic(() => import("./globe-canvas"), {
  ssr: false,
  loading: () => <GlobeSkeleton />,
});

/** Rien de "three" dans le bundle initial : GlobeCanvas n'est chargé que côté client. */
export function GlobeLoader() {
  return <GlobeCanvas />;
}
