import { Suspense } from "react";
import { ConfirmationView } from "@/components/confirmation/confirmation-view";

export default function ConfirmationPage() {
  return (
    <Suspense>
      <ConfirmationView />
    </Suspense>
  );
}
