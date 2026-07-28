import { Suspense } from "react";
import { FlightStepper } from "@/components/booking/flight-stepper";
import { ConfirmationView } from "@/components/confirmation/confirmation-view";

export default function ConfirmationPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <FlightStepper current="ticket" />
      <Suspense>
        <ConfirmationView />
      </Suspense>
    </div>
  );
}
