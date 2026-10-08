import { getImage } from "@/lib/images";
import { Photo } from "@/components/media/Photo";
import { CornerFrame } from "@/components/media/CornerFrame";
import { Foil } from "@/components/ui/Foil";
import { DiptychScene } from "./DiptychScene";

const SLOT = "pearl-01" as const;
/** Where the earring sits in the photograph, in % — the colour returns here first. */
const FOCUS = { x: 37, y: 35 };

/** C — The diptych: ivory stationery on the left, skin and gold on the right. */
export function Diptych() {
  const image = getImage(SLOT);
  const aspect = image ? image.width / image.height : 2 / 3;
  const sizes = "(min-width: 1024px) 50vw, 100vw";

  return (
    <DiptychScene
      focus={FOCUS}
      aspect={aspect}
      seam="pl. 03 — ivory, gold, skin"
      left={
        <div className="paper absolute inset-0 flex flex-col items-center justify-center px-gutter text-center">
          {/* Inset from the left so the labels survive the panel sliding away */}
          <div className="absolute inset-y-0 right-0 left-[9%]">
            <CornerFrame className="text-muted" tl="stationery" tr="pl. 03" bl="est. 2009" br="paris 1er" />
          </div>
          <p className="font-serif text-[clamp(3.4rem,8.5vw,8.5rem)] font-light leading-[0.88] tracking-[-0.02em]">
            <Foil className="block pb-[0.06em]">Maison</Foil>
            <Foil className="block pb-[0.08em]">Ondine</Foil>
          </p>
          <p className="wordmark mt-8 text-[0.62rem] text-muted">fine jewellery — saint-honoré</p>
        </div>
      }
      base={<Photo slot={SLOT} sizes={sizes} quality={70} alt="" />}
      colour={<Photo slot={SLOT} sizes={sizes} quality={70} credit={false} />}
    />
  );
}
