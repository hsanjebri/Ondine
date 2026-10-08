import type { SlotId } from "./image-slots";
import type { CollectionId } from "./collections";

export type Metal = "18k yellow gold" | "18k rose gold" | "18k white gold" | "platinum";

export interface ProductStone {
  shape: "Round brilliant" | "Oval" | "Princess" | "Emerald" | "Pear" | "Cushion" | "Baroque pearl";
  /** Total carat weight; omitted for pearls */
  carat?: number;
  colour?: string;
  clarity?: string;
  cut?: string;
}

export interface Product {
  slug: string;
  name: string;
  collection: CollectionId;
  /** Short type line under the name, e.g. "Solitaire ring" */
  type: string;
  metal: Metal;
  stone?: ProductStone;
  /** Euros, all taxes included */
  price: number;
  /** First slot is the main image */
  images: SlotId[];
  description: string;
  /** Working days in the atelier before dispatch */
  leadTime: number;
  /** Signature pieces carousel order (lower first); omit to hide */
  signature?: number;
}

export const products: Product[] = [
  // — Solitaires
  {
    slug: "aube-solitaire",
    name: "Aube",
    collection: "solitaires",
    type: "Solitaire ring",
    metal: "18k yellow gold",
    stone: { shape: "Round brilliant", carat: 0.5, colour: "F", clarity: "VS1", cut: "Excellent" },
    price: 3200,
    images: ["ring-02", "ring-01"],
    description:
      "A half-carat round brilliant on a fine yellow-gold band. Six claws, filed thin so the stone sits high and takes light from every side.",
    leadTime: 15,
    signature: 1,
  },
  {
    slug: "ondine-solitaire",
    name: "Ondine",
    collection: "solitaires",
    type: "Solitaire ring",
    metal: "platinum",
    stone: { shape: "Oval", carat: 1.0, colour: "E", clarity: "VVS2", cut: "Excellent" },
    price: 8900,
    images: ["ring-03", "ring-01"],
    description:
      "The house ring. A one-carat oval set north to south in platinum, with a hidden drop motif under the basket that only the wearer sees.",
    leadTime: 20,
    signature: 2,
  },
  {
    slug: "trilogie",
    name: "Trilogie",
    collection: "solitaires",
    type: "Three-stone ring",
    metal: "18k white gold",
    stone: { shape: "Round brilliant", carat: 1.2, colour: "F", clarity: "VS1", cut: "Excellent" },
    price: 9800,
    images: ["ring-04", "ring-02"],
    description:
      "A centre stone of 0.8 carat between two of 0.2, graduated by eye so the three read as one line of light.",
    leadTime: 20,
    signature: 6,
  },

  // — Bands
  {
    slug: "sillage-band",
    name: "Sillage",
    collection: "bands",
    type: "Band, 3 mm",
    metal: "18k rose gold",
    price: 1450,
    images: ["hand-01", "hand-04"],
    description:
      "A softly domed band forged from a single bar of rose gold, polished inside so it slides on without a thought.",
    leadTime: 10,
    signature: 3,
  },
  {
    slug: "fil-d-or-band",
    name: "Fil d'or",
    collection: "bands",
    type: "Band, 1.5 mm",
    metal: "18k yellow gold",
    price: 890,
    images: ["hand-02", "hand-04"],
    description: "A thread of yellow gold. Worn alone, or stacked against a solitaire.",
    leadTime: 10,
    signature: 9,
  },
  {
    slug: "pave-band",
    name: "Pavé",
    collection: "bands",
    type: "Pavé band",
    metal: "platinum",
    stone: { shape: "Round brilliant", carat: 0.35, colour: "F", clarity: "VS2", cut: "Excellent" },
    price: 3600,
    images: ["hand-03", "hand-01"],
    description:
      "Twenty-two diamonds set halfway around the band, each in its own bead of platinum raised by hand under the microscope.",
    leadTime: 25,
    signature: 7,
  },

  // — Earrings
  {
    slug: "larme-earrings",
    name: "Larme",
    collection: "earrings",
    type: "Drop earrings",
    metal: "18k white gold",
    stone: { shape: "Pear", carat: 0.6, colour: "F", clarity: "VS1", cut: "Excellent" },
    price: 4600,
    images: ["earring-01", "skin-01"],
    description: "Two pear-cut diamonds of 0.3 carat that swing free below the lobe, point down, like a drop about to fall.",
    leadTime: 20,
    signature: 4,
  },
  {
    slug: "point-de-lumiere-studs",
    name: "Point de lumière",
    collection: "earrings",
    type: "Stud earrings",
    metal: "18k yellow gold",
    stone: { shape: "Round brilliant", carat: 0.5, colour: "G", clarity: "VS1", cut: "Excellent" },
    price: 2400,
    images: ["earring-02", "skin-01"],
    description: "A quarter carat each side in a four-claw basket. The earrings you forget you are wearing.",
    leadTime: 10,
    signature: 10,
  },
  {
    slug: "creole-hoops",
    name: "Créole",
    collection: "earrings",
    type: "Hoop earrings",
    metal: "18k yellow gold",
    price: 1950,
    images: ["earring-03", "skin-02"],
    description: "Hollow hoops, 22 mm, light enough to sleep in. The clasp closes with a soft click.",
    leadTime: 10,
    signature: 11,
  },

  // — Necklaces
  {
    slug: "riviere-necklace",
    name: "Rivière",
    collection: "necklaces",
    type: "Rivière necklace",
    metal: "18k white gold",
    stone: { shape: "Round brilliant", carat: 3.0, colour: "G", clarity: "VS2", cut: "Excellent" },
    price: 14500,
    images: ["necklace-01", "necklace-03"],
    description: "Seventy-two round brilliants, graduated toward the centre and articulated so the line falls like water.",
    leadTime: 35,
    signature: 5,
  },
  {
    slug: "goutte-pendant",
    name: "Goutte",
    collection: "necklaces",
    type: "Pendant",
    metal: "18k yellow gold",
    stone: { shape: "Pear", carat: 0.4, colour: "F", clarity: "VS1", cut: "Excellent" },
    price: 2750,
    images: ["necklace-02", "skin-01"],
    description: "A single pear-cut diamond on a fine chain. The monogram of the house, made to wear.",
    leadTime: 15,
    signature: 8,
  },
  {
    slug: "perle-pendant",
    name: "Perle",
    collection: "necklaces",
    type: "Pearl pendant",
    metal: "18k yellow gold",
    stone: { shape: "Baroque pearl" },
    price: 1650,
    images: ["necklace-03", "pearl-02"],
    description: "A baroque pearl, no two alike, hung from a hand-made bail on a 42 cm chain.",
    leadTime: 15,
    signature: 12,
  },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export const signaturePieces = products
  .filter((p) => p.signature !== undefined)
  .sort((a, b) => (a.signature ?? 0) - (b.signature ?? 0));
