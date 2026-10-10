"use client";

import { useId, useState, useSyncExternalStore, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { site } from "@/lib/site";
import { formatEuro } from "@/lib/format";
import { cn } from "@/lib/cn";
import { useCart, cartSubtotal } from "@/store/cart";
import { useUI } from "@/store/ui";
import { newOrderNumber, useOrders, type DeliveryMethod, type Order, type PaymentMethod } from "@/store/orders";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { OrderLines } from "./OrderLines";

const COUNTRIES = [
  "France",
  "Belgium",
  "Germany",
  "Italy",
  "Luxembourg",
  "Monaco",
  "Netherlands",
  "Spain",
  "Switzerland",
  "Tunisia",
  "United Kingdom",
  "United States",
];

interface Form {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  method: DeliveryMethod;
  line1: string;
  line2: string;
  postcode: string;
  city: string;
  country: string;
  wrap: boolean;
  message: string;
  payment: PaymentMethod;
  terms: boolean;
}

type Errors = Partial<Record<keyof Form, string>>;

const EMPTY: Form = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  method: "courier",
  line1: "",
  line2: "",
  postcode: "",
  city: "",
  country: "France",
  wrap: true,
  message: "",
  payment: "link",
  terms: false,
};

function validate(f: Form): Errors {
  const e: Errors = {};
  if (!f.firstName.trim()) e.firstName = "Please enter your first name.";
  if (!f.lastName.trim()) e.lastName = "Please enter your last name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = "Please enter a valid email address.";
  if (f.phone.replace(/[^\d]/g, "").length < 8) e.phone = "Please enter a phone number, so the atelier can confirm with you.";
  if (f.method === "courier") {
    if (!f.line1.trim()) e.line1 = "Please enter the delivery address.";
    if (!f.postcode.trim()) e.postcode = "Please enter the postcode.";
    if (!f.city.trim()) e.city = "Please enter the city.";
  }
  if (f.payment === "boutique" && f.method !== "boutique") e.payment = "Payment in the boutique is for orders collected there.";
  if (!f.terms) e.terms = "Please accept the terms of sale.";
  return e;
}

const ORDER: Array<keyof Form> = ["firstName", "lastName", "email", "phone", "line1", "postcode", "city", "payment", "terms"];

function Field({
  id,
  label,
  error,
  children,
  hint,
  className,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="micro mb-2 block text-muted">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-[#9b2c1f]">
          {error}
        </p>
      ) : hint ? (
        <p className="mono mt-1.5 text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

const input = (invalid?: boolean) =>
  cn(
    "h-12 w-full border bg-transparent px-4 text-fg placeholder:text-muted/60 focus:outline-none",
    invalid ? "border-[#9b2c1f]" : "border-line focus:border-ink",
  );

function Choice({
  name,
  value,
  checked,
  onChange,
  title,
  note,
  aside,
  disabled,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  title: string;
  note: string;
  aside?: string;
  disabled?: boolean;
}) {
  return (
    <label className={cn("relative block cursor-pointer", disabled && "cursor-not-allowed opacity-40")}>
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} disabled={disabled} className="peer sr-only" />
      <span
        className={cn(
          "flex h-full items-start justify-between gap-4 border p-4 transition-colors duration-300",
          "peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent",
          checked ? "border-ink bg-surface" : "border-line hover:border-ink/40",
        )}
      >
        <span>
          <span className="block font-medium">{title}</span>
          <span className="mt-1 block text-sm leading-snug text-muted">{note}</span>
        </span>
        {aside ? <span className="mono shrink-0 text-muted">{aside}</span> : null}
      </span>
    </label>
  );
}

/**
 * Checkout: contact, delivery or collection, gift options, how to pay, and
 * the order summary. Placing the order records it on this device, empties
 * the bag and opens the confirmation. No card details are taken here: the
 * house confirms each order and sends payment instructions.
 */
export function Checkout() {
  const router = useRouter();
  const hydrated = useSyncExternalStore(
    (cb) => useCart.persist.onFinishHydration(cb),
    () => useCart.persist.hasHydrated(),
    () => false,
  );
  const items = useCart((s) => s.items);
  const subtotal = useCart(cartSubtotal);
  const clear = useCart((s) => s.clear);
  const setBagOpen = useUI((s) => s.setBagOpen);
  const [f, setF] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [placing, setPlacing] = useState(false);
  const uid = useId();
  const id = (k: keyof Form) => `${uid}-${k}`;

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setF((prev) => {
      const next = { ...prev, [k]: v };
      if (k === "method" && v === "courier" && next.payment === "boutique") next.payment = "link";
      return next;
    });
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const a11y = (k: keyof Form) => ({
    id: id(k),
    "aria-invalid": errors[k] ? true : undefined,
    "aria-describedby": errors[k] ? `${id(k)}-error` : undefined,
  });

  const place = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate(f);
    setErrors(found);
    const first = ORDER.find((k) => found[k]);
    if (first) {
      document.getElementById(id(first))?.focus();
      return;
    }
    setPlacing(true);
    await useOrders.persist.rehydrate();
    const order: Order = {
      number: newOrderNumber(),
      placedAt: new Date().toISOString(),
      items,
      customer: { firstName: f.firstName.trim(), lastName: f.lastName.trim(), email: f.email.trim(), phone: f.phone.trim() },
      delivery:
        f.method === "courier"
          ? {
              method: "courier",
              address: { line1: f.line1.trim(), line2: f.line2.trim() || undefined, postcode: f.postcode.trim(), city: f.city.trim(), country: f.country },
            }
          : { method: "boutique" },
      gift: { wrap: f.wrap, message: f.message.trim() },
      payment: f.payment,
      subtotal,
      total: subtotal,
    };
    useOrders.getState().addOrder(order);
    clear();
    router.push(`/checkout/confirmation?order=${order.number}`);
  };

  if (!hydrated) {
    return <p className="mono py-24 text-center text-muted">opening your bag…</p>;
  }

  if (!items.length && !placing) {
    return (
      <div className="py-24 text-center">
        <p className="heading">Your bag is empty.</p>
        <p className="mt-4 text-muted">Choose a piece first, then come back to place your order.</p>
        <div className="mt-8 flex justify-center gap-8">
          <TransitionLink href="/jewellery" className="micro link-line">
            Browse the jewellery
          </TransitionLink>
          <TransitionLink href="/composer" className="micro link-line text-muted">
            Compose your own
          </TransitionLink>
        </div>
      </div>
    );
  }

  const count = Object.values(errors).filter(Boolean).length;

  return (
    <form onSubmit={place} noValidate className="grid gap-x-[clamp(1.5rem,4vw,4rem)] gap-y-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(20rem,1fr)]">
      <div className="space-y-14">
        {count ? (
          <div role="alert" className="border-l-2 border-[#9b2c1f] pl-4 text-sm text-[#9b2c1f]">
            {count === 1 ? "One detail needs attention." : `${count} details need attention.`}
          </div>
        ) : null}

        {/* 01 Contact */}
        <fieldset>
          <legend className="subheading mb-6">
            <span className="mono mr-3 text-accent">01</span>Your details
          </legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id={id("firstName")} label="First name" error={errors.firstName}>
              <input {...a11y("firstName")} autoComplete="given-name" value={f.firstName} onChange={(e) => set("firstName", e.target.value)} className={input(!!errors.firstName)} />
            </Field>
            <Field id={id("lastName")} label="Last name" error={errors.lastName}>
              <input {...a11y("lastName")} autoComplete="family-name" value={f.lastName} onChange={(e) => set("lastName", e.target.value)} className={input(!!errors.lastName)} />
            </Field>
            <Field id={id("email")} label="Email" error={errors.email} hint="for the confirmation and payment instructions">
              <input {...a11y("email")} type="email" autoComplete="email" inputMode="email" value={f.email} onChange={(e) => set("email", e.target.value)} className={input(!!errors.email)} />
            </Field>
            <Field id={id("phone")} label="Phone" error={errors.phone} hint="the atelier calls to confirm sizes">
              <input {...a11y("phone")} type="tel" autoComplete="tel" inputMode="tel" value={f.phone} onChange={(e) => set("phone", e.target.value)} className={input(!!errors.phone)} />
            </Field>
          </div>
        </fieldset>

        {/* 02 Delivery */}
        <fieldset>
          <legend className="subheading mb-6">
            <span className="mono mr-3 text-accent">02</span>Delivery
          </legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <Choice name="method" value="courier" checked={f.method === "courier"} onChange={() => set("method", "courier")} title="Insured courier" note="Hand-delivered against signature, 2–3 days after the piece leaves the atelier." aside="free" />
            <Choice name="method" value="boutique" checked={f.method === "boutique"} onChange={() => set("method", "boutique")} title="Collect at the boutique" note={`${site.address.line}. We call when your piece is ready.`} aside="free" />
          </div>
          {f.method === "courier" ? (
            <div className="mt-6 grid gap-5 sm:grid-cols-6">
              <Field id={id("line1")} label="Address" error={errors.line1} className="sm:col-span-6">
                <input {...a11y("line1")} autoComplete="address-line1" value={f.line1} onChange={(e) => set("line1", e.target.value)} className={input(!!errors.line1)} />
              </Field>
              <Field id={id("line2")} label="Apartment, floor, code (optional)" className="sm:col-span-6">
                <input id={id("line2")} autoComplete="address-line2" value={f.line2} onChange={(e) => set("line2", e.target.value)} className={input()} />
              </Field>
              <Field id={id("postcode")} label="Postcode" error={errors.postcode} className="sm:col-span-2">
                <input {...a11y("postcode")} autoComplete="postal-code" value={f.postcode} onChange={(e) => set("postcode", e.target.value)} className={input(!!errors.postcode)} />
              </Field>
              <Field id={id("city")} label="City" error={errors.city} className="sm:col-span-4">
                <input {...a11y("city")} autoComplete="address-level2" value={f.city} onChange={(e) => set("city", e.target.value)} className={input(!!errors.city)} />
              </Field>
              <Field id={id("country")} label="Country" className="sm:col-span-6">
                <select id={id("country")} autoComplete="country-name" value={f.country} onChange={(e) => set("country", e.target.value)} className={input()}>
                  {COUNTRIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
            </div>
          ) : null}
        </fieldset>

        {/* 03 Gift */}
        <fieldset>
          <legend className="subheading mb-6">
            <span className="mono mr-3 text-accent">03</span>A gift?
          </legend>
          <label className="flex cursor-pointer items-center gap-3 text-sm">
            <input type="checkbox" checked={f.wrap} onChange={(e) => set("wrap", e.target.checked)} className="h-4 w-4 accent-[var(--gold)]" />
            Wrap it in the house paper, with a wax seal <span className="mono text-muted">complimentary</span>
          </label>
          <Field id={id("message")} label="A card, written by hand (optional)" hint={`${f.message.length} / 200`} className="mt-5">
            <textarea id={id("message")} rows={3} maxLength={200} value={f.message} onChange={(e) => set("message", e.target.value)} className={cn(input(), "h-auto py-3 font-serif text-lg italic")} />
          </Field>
        </fieldset>

        {/* 04 Payment */}
        <fieldset aria-describedby={errors.payment ? `${id("payment")}-error` : undefined}>
          <legend className="subheading mb-6">
            <span className="mono mr-3 text-accent">04</span>Payment
          </legend>
          <p className="mb-5 text-sm text-muted">
            Every piece is made to order, so nothing is charged now. Within one working day, the atelier confirms your
            order by phone and sends payment instructions for the method you choose.
          </p>
          <div className="grid gap-3" id={id("payment")} tabIndex={-1}>
            <Choice name="payment" value="link" checked={f.payment === "link"} onChange={() => set("payment", "link")} title="Secure payment link" note="Card or Apple Pay, through a link sent by email after confirmation." />
            <Choice name="payment" value="transfer" checked={f.payment === "transfer"} onChange={() => set("payment", "transfer")} title="Bank transfer" note="Bank details sent with the confirmation. The piece is started on receipt." />
            <Choice name="payment" value="boutique" checked={f.payment === "boutique"} onChange={() => set("payment", "boutique")} title="Pay at the boutique" note="When you collect your piece." disabled={f.method !== "boutique"} />
          </div>
          {errors.payment ? (
            <p id={`${id("payment")}-error`} className="mt-2 text-sm text-[#9b2c1f]">
              {errors.payment}
            </p>
          ) : null}
        </fieldset>

        <div>
          <label className="flex cursor-pointer items-start gap-3 text-sm">
            <input
              {...a11y("terms")}
              type="checkbox"
              checked={f.terms}
              onChange={(e) => set("terms", e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[var(--gold)]"
            />
            <span>
              I have read and accept the{" "}
              <TransitionLink href="/terms-of-sale" className="link-line">
                terms of sale
              </TransitionLink>{" "}
              and the{" "}
              <TransitionLink href="/privacy" className="link-line">
                privacy policy
              </TransitionLink>
              .
            </span>
          </label>
          {errors.terms ? (
            <p id={`${id("terms")}-error`} className="mt-1.5 text-sm text-[#9b2c1f]">
              {errors.terms}
            </p>
          ) : null}
        </div>
      </div>

      {/* Summary */}
      <aside aria-labelledby={`${uid}-summary`} className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:self-start">
        <div className="border border-line bg-surface/60 p-6">
          <div className="flex items-baseline justify-between">
            <h2 id={`${uid}-summary`} className="micro">
              Your order
            </h2>
            <button type="button" className="mono link-line text-muted" onClick={() => setBagOpen(true)}>
              edit bag
            </button>
          </div>
          <div className="mt-4 max-h-[22rem] overflow-y-auto" data-lenis-prevent>
            <OrderLines items={items} />
          </div>
          <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="tabular">{formatEuro(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">{f.method === "courier" ? "Insured delivery" : "Collection"}</dt>
              <dd>Complimentary</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Engraving and gift wrap</dt>
              <dd>Complimentary</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-line pt-3">
              <dt className="micro">Total</dt>
              <dd className="font-serif text-3xl tabular">{formatEuro(subtotal)}</dd>
            </div>
          </dl>
          <p className="mono mt-2 text-muted">taxes included</p>
          <button type="submit" className="btn mt-6 w-full" disabled={placing} aria-busy={placing}>
            {placing ? "Placing your order…" : "Place order"}
          </button>
          <p className="mt-3 text-xs leading-snug text-muted">Nothing is charged now. You pay after the atelier confirms.</p>
        </div>
      </aside>
    </form>
  );
}
