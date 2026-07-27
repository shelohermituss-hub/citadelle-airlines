import { Suspense } from "react";
import { FlightStepper } from "@/components/booking/flight-stepper";
import { ResultsView } from "@/components/results/results-view";

export default function ResultsPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <FlightStepper current="flights" />
      <Suspense>
        <ResultsView />
      </Suspense>
    </div>
  );
}
