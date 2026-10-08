"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { usePageTransition } from "@/components/providers/PageTransition";

type Props = Omit<ComponentProps<typeof Link>, "href"> & { href: string };

/**
 * next/link with the house page transition. Modified clicks (new tab,
 * download…) never reach `onNavigate`, so they keep native behaviour.
 */
export function TransitionLink({ href, onNavigate, ...props }: Props) {
  const navigate = usePageTransition();
  return (
    <Link
      href={href}
      {...props}
      onNavigate={(e) => {
        onNavigate?.(e);
        e.preventDefault();
        navigate(href);
      }}
    />
  );
}
