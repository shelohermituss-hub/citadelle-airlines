import { Suspense } from "react";
import { RecapView } from "@/components/recap/recap-view";

export default function RecapPage() {
  return (
    <Suspense>
      <RecapView />
    </Suspense>
  );
}
