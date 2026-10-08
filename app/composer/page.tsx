import type { Metadata } from "next";
import { Composer } from "@/components/composer/Composer";

export const metadata: Metadata = {
  title: "Compose your ring",
  description:
    "Choose the setting, metal, stone, size, engraving and box, and see your ring take shape in 3D with its price, made by hand in the Saint-Honoré atelier.",
  alternates: { canonical: "/composer" },
};

export default function ComposerPage() {
  return <Composer />;
}
