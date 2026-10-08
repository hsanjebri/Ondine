import { Photo } from "@/components/media/Photo";
import { Reveal } from "@/components/motion/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { MoodboardBoard, type MoodItem } from "./MoodboardBoard";
import { BoxTop, BusinessCard, ColourChips, Envelope, GoldSwatch, Tag } from "./PaperObjects";

const card = "(min-width: 768px) 18vw, 45vw";

/**
 * B — The moodboard. Photographs and the house's stationery scattered on
 * paper, as on a designer's table. They fly in on scroll and can be moved.
 */
export function Moodboard() {
  const items: MoodItem[] = [
    { key: "ring", node: <Photo slot="ring-01" ratio="4 / 5" sizes={card} />, x: 3, y: 6, w: 15, mx: 3, my: 1, mw: 42, r: -5 },
    { key: "envelope", node: <Envelope />, x: 20, y: 4, w: 23, mx: 46, my: 3, mw: 52, r: 3 },
    { key: "hand", node: <Photo slot="hand-02" ratio="4 / 5" sizes={card} />, x: 45, y: 2, w: 14, mx: 52, my: 26, mw: 40, r: -2 },
    { key: "card", node: <BusinessCard />, x: 61, y: 9, w: 19, mx: 4, my: 34, mw: 50, r: 6 },
    { key: "skin", node: <Photo slot="skin-01" ratio="4 / 5" sizes={card} />, x: 83, y: 4, w: 14, mx: 0, my: 0, mw: 0, r: 4, hideOnMobile: true },
    { key: "stone", node: <Photo slot="stone-02" ratio="4 / 5" sizes={card} />, x: 30, y: 33, w: 14, mx: 0, my: 0, mw: 0, r: -2, hideOnMobile: true },
    { key: "swatch", node: <GoldSwatch />, x: 4, y: 46, w: 10, mx: 6, my: 53, mw: 24, r: 7 },
    { key: "pearl", node: <Photo slot="pearl-02" ratio="1 / 1" sizes={card} />, x: 14, y: 57, w: 17, mx: 30, my: 57, mw: 38, r: -4 },
    { key: "box", node: <BoxTop />, x: 51, y: 34, w: 14, mx: 66, my: 58, mw: 30, r: 2 },
    { key: "tag", node: <Tag />, x: 44, y: 60, w: 8, mx: 0, my: 0, mw: 0, r: -8, hideOnMobile: true },
    { key: "water", node: <Photo slot="water-02" ratio="3 / 2" sizes={card} />, x: 62, y: 57, w: 22, mx: 40, my: 77, mw: 56, r: -3 },
    { key: "chips", node: <ColourChips />, x: 83, y: 40, w: 14, mx: 4, my: 80, mw: 40, r: -6 },
    { key: "earring", node: <Photo slot="earring-02" ratio="4 / 5" sizes={card} />, x: 86, y: 60, w: 11, mx: 0, my: 0, mw: 0, r: 5, hideOnMobile: true },
  ];

  return (
    <section aria-labelledby="moodboard-title" className="relative overflow-hidden pt-8 pb-32 md:pb-44">
      <div className="shell">
        <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <SectionLabel n={2} as="h2">
              <span id="moodboard-title">Moodboard</span>
            </SectionLabel>
            <p data-reveal className="heading mt-6 max-w-xl">
              What the house is made of.
            </p>
          </div>
          <p data-reveal className="max-w-sm text-muted">
            Gold, paper, skin and water: the table every piece is drawn on.
            <span className="mono mt-3 hidden text-muted [@media(hover:hover)_and_(pointer:fine)]:block">
              drag anything to rearrange
            </span>
          </p>
        </Reveal>

        <div className="relative mt-14 md:mt-20">
          <div aria-hidden className="mono mb-4 flex justify-between text-muted">
            <span>moodboard</span>
            <span>maison ondine</span>
          </div>
          <MoodboardBoard items={items} />
        </div>
      </div>
    </section>
  );
}
