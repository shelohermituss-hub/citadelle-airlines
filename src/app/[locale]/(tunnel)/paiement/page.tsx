import { Suspense } from "react";
import { PaymentView } from "@/components/payment/payment-view";

export default function PaiementPage() {
  return (
    <Suspense>
      <PaymentView />
    </Suspense>
  );
}
