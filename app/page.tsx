import { Hero } from "@/components/home/Hero";
import { Manifesto } from "@/components/home/Manifesto";
import { Moodboard } from "@/components/home/Moodboard";
import { AtelierNumbers } from "@/components/home/AtelierNumbers";
import { Diptych } from "@/components/home/Diptych";
import { Collections } from "@/components/home/Collections";
import { SignaturePieces } from "@/components/home/SignaturePieces";

/**
 * Homepage. Phase 2: hero (variant A) → signature pieces, with the
 * moodboard (B) and the diptych (C). Sections 7–13 and D–H follow in phase 4.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Manifesto />
      <Moodboard />
      <AtelierNumbers />
      <Diptych />
      <Collections />
      <SignaturePieces />
    </>
  );
}
