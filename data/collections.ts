import type { SlotId } from "./image-slots";

export type CollectionId = "solitaires" | "bands" | "earrings" | "necklaces";

export interface Collection {
  id: CollectionId;
  name: string;
  /** One line for the collections index. */
  line: string;
  description: string;
  image: SlotId;
  /** Plate caption under the collection image. */
  plate: string;
}

export const collections: Collection[] = [
  {
    id: "solitaires",
    name: "Solitaires",
    line: "One stone, held by six claws.",
    description:
      "The ring the house is known for. The stone is chosen first, then the setting is drawn around it so the metal disappears and the light stays.",
    image: "ring-02",
    plate: "Solitaire, round brilliant, platinum",
  },
  {
    id: "bands",
    name: "Bands",
    line: "Worn every day, for decades.",
    description:
      "Plain, pavé or engraved. Forged rather than cast, so the gold is denser and wears softly over the years.",
    image: "hand-01",
    plate: "Bands, 18k rose and yellow gold, worn",
  },
  {
    id: "earrings",
    name: "Earrings",
    line: "Light that moves when you do.",
    description:
      "Studs, drops and hoops, balanced by hand so they sit straight and catch the light at the angle of a turning head.",
    image: "earring-01",
    plate: "Larme drop earrings, 18k white gold",
  },
  {
    id: "necklaces",
    name: "Necklaces",
    line: "Close to the skin, close to the heart.",
    description:
      "Fine chains, single pendants and rivières, each link closed and soldered in the atelier.",
    image: "necklace-01",
    plate: "Rivière necklace, 18k white gold, worn",
  },
];

export function getCollection(id: CollectionId) {
  return collections.find((c) => c.id === id)!;
}
