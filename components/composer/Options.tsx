"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Accessible option groups built on native radio inputs: arrow keys move
 * between options, Space selects, and the visual card follows the input's
 * checked and focus state.
 */
export function OptionGroup<T extends string | number>({
  name,
  legend,
  value,
  options,
  onChange,
  columns = 2,
  render,
  className,
}: {
  name: string;
  legend: string;
  value: T | null;
  options: readonly { id: T; label: string; note?: string; aside?: ReactNode }[];
  onChange: (v: T) => void;
  columns?: 2 | 3 | 4 | 6;
  render?: (o: { id: T; label: string; note?: string }, checked: boolean) => ReactNode;
  className?: string;
}) {
  const cols = { 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4", 6: "grid-cols-3 sm:grid-cols-6" }[columns];
  return (
    <fieldset className={className}>
      <legend className="micro mb-4 text-muted">{legend}</legend>
      <div className={cn("grid gap-2", cols)}>
        {options.map((o) => {
          const checked = value === o.id;
          return (
            <label key={String(o.id)} className="group relative block cursor-pointer">
              <input
                type="radio"
                name={name}
                value={String(o.id)}
                checked={checked}
                onChange={() => onChange(o.id)}
                className="peer sr-only"
              />
              <span
                className={cn(
                  "flex h-full flex-col gap-2 border p-4 transition-[border-color,background-color] duration-300 ease-ondine",
                  "peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent",
                  checked ? "border-fg bg-surface" : "border-line hover:border-fg/40",
                )}
              >
                {render ? (
                  render(o, checked)
                ) : (
                  <>
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="text-[0.95rem] font-medium">{o.label}</span>
                      {o.aside ? <span className="mono shrink-0 text-muted">{o.aside}</span> : null}
                    </span>
                    {o.note ? <span className="text-sm leading-snug text-muted">{o.note}</span> : null}
                  </>
                )}
              </span>
              <span
                aria-hidden
                className={cn(
                  "pointer-events-none absolute top-3 right-3 h-1.5 w-1.5 rounded-full bg-accent transition-opacity duration-300",
                  checked ? "opacity-100" : "opacity-0",
                )}
              />
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Compact segmented control (colour and clarity grades). */
export function Segmented<T extends string>({
  name,
  legend,
  value,
  options,
  onChange,
  hint,
}: {
  name: string;
  legend: string;
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
  hint?: ReactNode;
}) {
  return (
    <fieldset>
      <legend className="micro mb-3 flex w-full items-baseline justify-between text-muted">
        <span>{legend}</span>
        {hint ? <span className="mono normal-case tracking-normal">{hint}</span> : null}
      </legend>
      <div className="flex border border-line">
        {options.map((o) => (
          <label key={o} className="relative flex-1 cursor-pointer border-l border-line first:border-l-0">
            <input
              type="radio"
              name={name}
              value={o}
              checked={value === o}
              onChange={() => onChange(o)}
              className="peer sr-only"
            />
            <span className="smallcaps flex h-11 items-center justify-center transition-colors duration-300 peer-checked:bg-fg peer-checked:text-surface peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:-outline-offset-4 peer-focus-visible:outline-accent hover:bg-fg/5">
              {o}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
