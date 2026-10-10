import type { Metadata } from "next";
import { Checkout } from "@/components/checkout/Checkout";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <div className="shell pt-[calc(var(--header-h)+3rem)] pb-32">
      <p className="mono mb-4 text-muted">bag — details — confirmation</p>
      <h1 className="display mb-14 text-[clamp(2.6rem,6vw,5.5rem)]">Place your order</h1>
      <Checkout />
    </div>
  );
}
