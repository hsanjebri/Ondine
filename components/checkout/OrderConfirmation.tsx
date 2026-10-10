"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/site";
import { formatEuro } from "@/lib/format";
import { useOrders, type Order } from "@/store/orders";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { Monogram } from "@/components/ui/Monogram";
import { OrderLines } from "./OrderLines";

const PAYMENT: Record<Order["payment"], string> = {
  link: "Secure payment link, sent by email after confirmation",
  transfer: "Bank transfer, details sent with the confirmation",
  boutique: "At the boutique, when you collect",
};

/** Thank-you page: the order number, what happens next, and the order itself. */
export function OrderConfirmation() {
  const [order, setOrder] = useState<Order | null | undefined>(undefined);

  useEffect(() => {
    void Promise.resolve(useOrders.persist.rehydrate()).then(() => {
      const number = new URLSearchParams(window.location.search).get("order");
      const orders = useOrders.getState().orders;
      setOrder((number ? orders.find((o) => o.number === number) : orders[0]) ?? null);
    });
  }, []);

  if (order === undefined) return <p className="mono py-24 text-center text-muted">finding your order…</p>;

  if (order === null) {
    return (
      <div className="py-24 text-center">
        <p className="heading">We could not find this order on this device.</p>
        <p className="mt-4 text-muted">
          Write to <a className="link-line" href={`mailto:${site.email}`}>{site.email}</a> and we will help.
        </p>
        <TransitionLink href="/jewellery" className="micro link-line mt-8 inline-block">
          Browse the jewellery
        </TransitionLink>
      </div>
    );
  }

  const placed = new Date(order.placedAt);
  const steps = [
    { when: "Within 1 working day", what: "The atelier calls you to confirm sizes and engraving, and sends payment instructions." },
    { when: "2 to 6 weeks", what: "Your piece is made by hand at the bench in Saint-Honoré, then checked and polished." },
    {
      when: order.delivery.method === "courier" ? "2–3 days after" : "When it is ready",
      what:
        order.delivery.method === "courier"
          ? "Delivered by insured courier, against signature."
          : `We call you to collect it at ${site.address.line}.`,
    },
  ];

  return (
    <div className="grid gap-x-[clamp(1.5rem,4vw,4rem)] gap-y-14 lg:grid-cols-[minmax(0,1.3fr)_minmax(20rem,1fr)]">
      <div>
        <Monogram className="h-12 w-auto text-gold" />
        <p className="mono mt-8 text-muted">order {order.number}</p>
        <h1 className="display mt-4 text-[clamp(2.6rem,6vw,5.5rem)]">Thank you, {order.customer.firstName}.</h1>
        <p className="lead mt-6 max-w-xl text-muted">
          Your order is with the atelier. A confirmation has been prepared for {order.customer.email}.
        </p>

        <ol className="mt-14 space-y-8 border-l border-line pl-8">
          {steps.map((s, i) => (
            <li key={s.when} className="relative">
              <span className="mono absolute top-0.5 -left-[2.65rem] flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[0.6rem] text-ivory">
                {i + 1}
              </span>
              <p className="micro">{s.when}</p>
              <p className="mt-2 max-w-md text-muted">{s.what}</p>
            </li>
          ))}
        </ol>

        <div className="mt-14 flex flex-wrap gap-8">
          <TransitionLink href="/jewellery" className="btn">
            Continue browsing
          </TransitionLink>
          <button type="button" className="micro link-line" onClick={() => window.print()}>
            Print this order
          </button>
        </div>
      </div>

      <aside className="border border-line bg-surface/60 p-6 lg:self-start">
        <h2 className="micro">Your order</h2>
        <p className="mono mt-1 text-muted">
          placed {placed.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
        </p>
        <div className="mt-4">
          <OrderLines items={order.items} />
        </div>
        <dl className="mt-4 space-y-3 border-t border-line pt-4 text-sm">
          <div>
            <dt className="micro text-muted">{order.delivery.method === "courier" ? "Delivery to" : "Collection"}</dt>
            <dd className="mt-1">
              {order.delivery.address ? (
                <>
                  {order.customer.firstName} {order.customer.lastName}
                  <br />
                  {order.delivery.address.line1}
                  {order.delivery.address.line2 ? (
                    <>
                      <br />
                      {order.delivery.address.line2}
                    </>
                  ) : null}
                  <br />
                  {order.delivery.address.postcode} {order.delivery.address.city}, {order.delivery.address.country}
                </>
              ) : (
                site.address.line
              )}
            </dd>
          </div>
          <div>
            <dt className="micro text-muted">Payment</dt>
            <dd className="mt-1">{PAYMENT[order.payment]}</dd>
          </div>
          {order.gift.wrap || order.gift.message ? (
            <div>
              <dt className="micro text-muted">Gift</dt>
              <dd className="mt-1">
                {order.gift.wrap ? "Wrapped in the house paper. " : ""}
                {order.gift.message ? <span className="font-serif italic">“{order.gift.message}”</span> : null}
              </dd>
            </div>
          ) : null}
          <div className="flex items-baseline justify-between border-t border-line pt-3">
            <dt className="micro">Total</dt>
            <dd className="font-serif text-3xl tabular">{formatEuro(order.total)}</dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}
