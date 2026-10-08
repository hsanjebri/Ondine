import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { pad } from "@/lib/format";

/** Numbered section label: "01 — Selected work". */
export function SectionLabel({
  n,
  children,
  className,
  as: Tag = "p",
}: {
  n: number;
  children: ReactNode;
  className?: string;
  as?: "p" | "h2" | "span";
}) {
  return (
    <Tag className={cn("micro flex items-center gap-3", className)}>
      <span className="tabular text-accent">{pad(n)}</span>
      <span aria-hidden className="h-px w-8 bg-current opacity-40" />
      <span>{children}</span>
    </Tag>
  );
}
