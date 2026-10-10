import type { Metadata } from "next";
import { OrderConfirmation } from "@/components/checkout/OrderConfirmation";

export const metadata: Metadata = {
  title: "Thank you",
  robots: { index: false },
};

export default function ConfirmationPage() {
  return (
    <div className="shell pt-[calc(var(--header-h)+3rem)] pb-32">
      <OrderConfirmation />
    </div>
  );
}
