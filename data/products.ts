import type { SlotId } from "./image-slots";
import type { CollectionId } from "./collections";
import type cutouts from "./cutouts.json";
import { METAL_PRICE } from "@/lib/pricing";
import type { MetalId } from "@/lib/composer-options";

/*
 * The catalogue. Every piece is shown with a real photograph whose
 * background has been removed (public/cutouts, see MEDIA.md); metals other
 * than the one photographed are re-toned live. `gallery` adds photographs
 * of jewellery worn and of the atelier.
 */

export type CategoryId = "rings" | "bracelets" | "necklaces" | "earrings";
export type Tag = "new" | "bestseller" | "bridal" | "gift";
export type SizeKind = "ring" | "bracelet" | "necklace";

export const CATEGORIES: Array<{ id: CategoryId; label: string; singular: string }> = [
  { id: "rings", label: "Rings", singular: "Ring" },
  { id: "bracelets", label: "Bracelets", singular: "Bracelet" },
  { id: "necklaces", label: "Necklaces", singular: "Necklace" },
  { id: "earrings", label: "Earrings", singular: "Earrings" },
];

export const TAG_LABEL: Record<Tag, string> = {
  new: "New",
  bestseller: "Most loved",
  bridal: "Bridal",
  gift: "Gift",
};

export interface Product {
  slug: string;
  name: string;
  category: CategoryId;
  /** Homepage collection it belongs to, if any */
  collection?: CollectionId;
  /** Type line under the name, e.g. "Solitaire ring" */
  type: string;
  /** Cut-out photograph (key of data/cutouts.json) */
  cutout: keyof typeof cutouts;
  /** Metals it is made in. The first is the metal it was photographed in, shown untouched. Omit for a fixed mix of golds. */
  metals?: MetalId[];
  /** Shown instead of a metal choice when `metals` is omitted */
  fixedMetal?: string;
  /** Stones in one line, e.g. "0.50 ct round brilliant, F VS1" */
  stones?: string;
  /** Euros, all taxes included, in the default metal */
  price: number;
  /** Gold used relative to a solitaire ring: drives the price of other metals */
  weight: number;
  /** Photographs of jewellery worn and of the atelier */
  gallery: SlotId[];
  description: string;
  details: string[];
  /** Working days in the atelier before dispatch */
  leadTime: number;
  sizes?: SizeKind;
  engravable?: boolean;
  tags?: Tag[];
  /** Signature pieces carousel order (lower first) */
  signature?: number;
}

export const products: Product[] = [
  /* ───────────── Rings ───────────── */
  {
    slug: "aube-solitaire",
    name: "Aube",
    category: "rings",
    collection: "solitaires",
    type: "Solitaire ring",
    cutout: "ring-solitaire",
    metals: ["white", "yellow", "rose", "platinum"],
    stones: "0.50 ct round brilliant, F VS1",
    price: 3300,
    weight: 1,
    gallery: ["ring-02", "hand-02"],
    description:
      "A half-carat round brilliant held high by six fine claws, so the stone takes light from every side. The house solitaire, made for a lifetime of wear.",
    details: ["Six-claw setting, filed by hand", "Band 2 mm, comfort fit", "Certificate of the stone included"],
    leadTime: 15,
    sizes: "ring",
    engravable: true,
    tags: ["bridal", "bestseller"],
    signature: 1,
  },
  {
    slug: "ondine-halo",
    name: "Ondine",
    category: "rings",
    collection: "solitaires",
    type: "Halo ring",
    cutout: "ring-halo",
    metals: ["white", "platinum", "yellow", "rose"],
    stones: "1.00 ct round brilliant, E VVS2; 0.40 ct halo",
    price: 11200,
    weight: 1.1,
    gallery: ["ring-01", "hand-01"],
    description:
      "The ring the house is named for: a one-carat brilliant inside a crown of fourteen small diamonds, each in its own pointed claw, like light on water.",
    details: ["Halo of 14 round brilliants", "Split shoulders set with pavé", "Certificate of the centre stone"],
    leadTime: 25,
    sizes: "ring",
    engravable: true,
    tags: ["bridal"],
    signature: 2,
  },
  {
    slug: "emeraude-pave",
    name: "Émeraude",
    category: "rings",
    collection: "solitaires",
    type: "Emerald-cut pavé ring",
    cutout: "ring-pave",
    metals: ["yellow", "white", "rose", "platinum"],
    stones: "1.20 ct emerald cut, F VS1; 0.30 ct pavé",
    price: 12400,
    weight: 1.05,
    gallery: ["ring-04", "hand-03"],
    description:
      "An emerald cut with long, quiet step facets, held by four claws over a band set with small diamonds all the way to the gallery.",
    details: ["Four-claw basket with hidden pavé", "Band set two-thirds round", "Certificate of the centre stone"],
    leadTime: 25,
    sizes: "ring",
    engravable: true,
    tags: ["bridal", "new"],
  },
  {
    slug: "sillage-eternity",
    name: "Sillage",
    category: "rings",
    collection: "bands",
    type: "Eternity band",
    cutout: "ring-eternity",
    metals: ["rose", "yellow", "white", "platinum"],
    stones: "0.45 ct round brilliants in milgrain bezels",
    price: 2450,
    weight: 1,
    gallery: ["hand-01", "hand-04"],
    description:
      "Round and marquise motifs alternating along the band, each stone closed in a fine milgrain bezel. Worn alone or beside an engagement ring.",
    details: ["Milgrain edge, raised by hand", "Band 2.4 mm", "Stones three-quarters round"],
    leadTime: 15,
    sizes: "ring",
    engravable: true,
    tags: ["bestseller"],
    signature: 3,
  },
  {
    slug: "duo-bridal-set",
    name: "Duo",
    category: "rings",
    collection: "solitaires",
    type: "Bridal set",
    cutout: "p-duo",
    metals: ["white", "platinum", "yellow", "rose"],
    stones: "0.70 ct round brilliant, F VS1; 0.50 ct pavé",
    price: 6800,
    weight: 1.8,
    gallery: ["hand-02", "ring-02"],
    description:
      "An engagement ring and its wedding band, made together so they sit flush. Both bands are set with small diamonds on three sides.",
    details: ["Two rings, sold as a set", "Engraved pavé on the sides", "Certificate of the centre stone"],
    leadTime: 25,
    sizes: "ring",
    engravable: true,
    tags: ["bridal"],
  },
  {
    slug: "princesse-bridal-set",
    name: "Princesse",
    category: "rings",
    collection: "solitaires",
    type: "Princess-cut bridal set",
    cutout: "p-princesse",
    metals: ["white", "platinum", "yellow", "rose"],
    stones: "1.00 ct princess cut, E VS1; 1.10 ct round brilliants",
    price: 12800,
    weight: 2,
    gallery: ["ring-03", "hand-03"],
    description:
      "A square princess cut set between two bands of graduated round brilliants, shared-claw set so the line of light never breaks.",
    details: ["Engagement ring and band", "Shared-claw setting", "Certificate of the centre stone"],
    leadTime: 30,
    sizes: "ring",
    engravable: true,
    tags: ["bridal"],
  },
  {
    slug: "larme-stack",
    name: "Larme",
    category: "rings",
    collection: "solitaires",
    type: "Pear halo stack",
    cutout: "p-larme-ring",
    metals: ["white", "platinum", "yellow", "rose"],
    stones: "0.60 ct pear, F VS1; halo and band 0.45 ct",
    price: 7400,
    weight: 2.1,
    gallery: ["hand-04", "ring-04"],
    description:
      "A pear-cut diamond in a double halo, between a pavé band and a band of black ceramic. Three rings, one gesture.",
    details: ["Three rings, worn together or apart", "Split-shank centre ring", "Ceramic band, scratch resistant"],
    leadTime: 25,
    sizes: "ring",
    engravable: true,
    tags: ["new"],
  },
  {
    slug: "trio-rolling-ring",
    name: "Trio",
    category: "rings",
    collection: "bands",
    type: "Rolling ring",
    cutout: "p-trio",
    fixedMetal: "18k yellow, rose and white gold",
    price: 1650,
    weight: 1.4,
    gallery: ["hand-02", "atelier-02"],
    description:
      "Three fine bands of yellow, rose and white gold, interlaced so they roll over one another on the finger. No stones, nothing but gold.",
    details: ["Three bands of 2 mm", "Each band soldered closed by hand", "Polished, never plated"],
    leadTime: 10,
    sizes: "ring",
    tags: ["bestseller", "gift"],
  },
  {
    slug: "rosee-sapphire-band",
    name: "Rosée",
    category: "rings",
    collection: "bands",
    type: "Pink sapphire band",
    cutout: "p-rosee",
    metals: ["yellow", "rose", "white", "platinum"],
    stones: "1.10 ct baguette pink sapphires; 0.30 ct brilliants",
    price: 3950,
    weight: 1.3,
    gallery: ["hand-03", "stone-01"],
    description:
      "A wave of baguette pink sapphires, channel-set between two lines of round diamonds. The colour of morning on the Seine.",
    details: ["Channel-set baguettes", "Two rows of round brilliants", "Band 6 mm at the front"],
    leadTime: 20,
    sizes: "ring",
    tags: ["new"],
  },
  {
    slug: "lune-signet",
    name: "Lune",
    category: "rings",
    collection: "bands",
    type: "Moonstone signet",
    cutout: "p-lune",
    metals: ["white", "yellow", "rose", "platinum"],
    stones: "Cabochon moonstone, 14 × 11 mm",
    price: 1850,
    weight: 2.2,
    gallery: ["hand-04", "atelier-03"],
    description:
      "A milky moonstone cabochon in a rope-edged bezel, on an openwork shoulder engraved with scrolls. Heavy, warm and made to be worn every day.",
    details: ["Hand-engraved shoulders", "Rope-twist bezel", "Oxidised recesses for depth"],
    leadTime: 20,
    sizes: "ring",
    engravable: true,
  },
  {
    slug: "carre-solitaire",
    name: "Carré",
    category: "rings",
    collection: "solitaires",
    type: "Princess solitaire",
    cutout: "p-trois",
    metals: ["white", "platinum", "yellow", "rose"],
    stones: "0.70 ct princess cut, G VS1",
    price: 4600,
    weight: 1,
    gallery: ["ring-03", "atelier-01"],
    description:
      "A princess cut held at its corners by four claws on a slim, rounded band, shown here from three angles.",
    details: ["Four corner claws", "Band 1.8 mm", "Certificate of the stone included"],
    leadTime: 15,
    sizes: "ring",
    engravable: true,
    tags: ["bridal"],
  },

  /* ───────────── Bracelets ───────────── */
  {
    slug: "fil-de-lumiere-tennis",
    name: "Fil de lumière",
    category: "bracelets",
    type: "Tennis bracelet",
    cutout: "bracelet-tennis",
    metals: ["white", "platinum", "yellow", "rose"],
    stones: "2.00 ct round brilliants, G VS",
    price: 6400,
    weight: 2.4,
    gallery: ["hand-01", "atelier-02"],
    description:
      "A supple line of fifty-four round brilliants, each in its own four-claw box, closed with a double-safety box clasp.",
    details: ["54 stones, matched by hand", "Box clasp with two safety catches", "Length made to measure"],
    leadTime: 20,
    sizes: "bracelet",
    engravable: true,
    tags: ["bestseller", "gift"],
    signature: 4,
  },
  {
    slug: "cercle-bangle",
    name: "Cercle",
    category: "bracelets",
    type: "Diamond bangle",
    cutout: "bracelet-bangle",
    metals: ["white", "yellow", "rose", "platinum"],
    stones: "3.20 ct round brilliants, F VS",
    price: 9800,
    weight: 3.2,
    gallery: ["hand-03", "atelier-03"],
    description:
      "A rigid round set with diamonds the whole way around, so it shines however it turns on the wrist. Opens on a hidden hinge.",
    details: ["Hidden hinge and push clasp", "Shared-claw setting", "Oval profile, sits flat on the wrist"],
    leadTime: 30,
    sizes: "bracelet",
    tags: ["new"],
  },
  {
    slug: "gravure-cuff",
    name: "Gravure",
    category: "bracelets",
    type: "Engraved cuff",
    cutout: "bracelet-cuff",
    metals: ["yellow", "rose", "white", "platinum"],
    stones: "1.50 ct round brilliants in blackened setting",
    price: 5600,
    weight: 4.5,
    gallery: ["atelier-01", "hand-02"],
    description:
      "An open cuff with a hand-engraved border, its centre paved in a leaf pattern of small diamonds set in blackened gold.",
    details: ["Engraved by hand, two days per cuff", "Blackened setting for contrast", "Slips on, no clasp"],
    leadTime: 30,
    sizes: "bracelet",
    engravable: true,
  },

  /* ───────────── Necklaces ───────────── */
  {
    slug: "riviere-necklace",
    name: "Rivière",
    category: "necklaces",
    collection: "necklaces",
    type: "Double rivière",
    cutout: "necklace-riviere",
    metals: ["white", "platinum", "yellow", "rose"],
    stones: "6.40 ct round brilliants, F VS",
    price: 18500,
    weight: 2.8,
    gallery: ["necklace-01", "skin-02"],
    description:
      "Two lines of round brilliants, graduated toward the centre and articulated so the necklace falls like water.",
    details: ["146 stones, matched in the atelier", "Concealed box clasp", "Made to the length of the neck"],
    leadTime: 35,
    sizes: "necklace",
    signature: 5,
  },
  {
    slug: "goutte-pendant",
    name: "Goutte",
    category: "necklaces",
    collection: "necklaces",
    type: "Open drop pendant",
    cutout: "necklace-goutte",
    metals: ["white", "yellow", "rose", "platinum"],
    stones: "0.80 ct round brilliants",
    price: 3900,
    weight: 1.6,
    gallery: ["necklace-02", "skin-01"],
    description:
      "The drop of the house monogram, drawn in a single line of small diamonds and hung from a pavé bail on a fine wheat chain.",
    details: ["78 stones, claw-set", "Wheat chain, adjustable", "Pendant 32 mm"],
    leadTime: 20,
    sizes: "necklace",
    tags: ["bestseller"],
    signature: 6,
  },
  {
    slug: "halo-pendant",
    name: "Halo",
    category: "necklaces",
    collection: "necklaces",
    type: "Cushion halo pendant",
    cutout: "necklace-pendant",
    metals: ["white", "platinum", "yellow", "rose"],
    stones: "1.00 ct round brilliant, F VS1; 0.35 ct halo",
    price: 8600,
    weight: 1.3,
    gallery: ["necklace-03", "skin-02"],
    description:
      "A one-carat brilliant inside a cushion of small diamonds and milgrain, on a box chain that never twists.",
    details: ["Milgrain border", "Pavé bail", "Box chain, two lengths"],
    leadTime: 25,
    sizes: "necklace",
    tags: ["gift"],
  },
  {
    slug: "coeur-pendant",
    name: "Cœur",
    category: "necklaces",
    collection: "necklaces",
    type: "Open heart pendant",
    cutout: "p-coeur",
    metals: ["white", "rose", "yellow", "platinum"],
    stones: "0.45 ct round brilliants",
    price: 2600,
    weight: 1.1,
    gallery: ["skin-01", "necklace-02"],
    description:
      "An open heart, slightly asymmetric as if drawn by hand, set with diamonds and hung from a bead chain.",
    details: ["Floating heart, slides on the chain", "Bead chain", "Pendant 18 mm"],
    leadTime: 15,
    sizes: "necklace",
    tags: ["gift", "bestseller"],
  },
  {
    slug: "amour-pendant",
    name: "Amour",
    category: "necklaces",
    collection: "necklaces",
    type: "Engraved heart pendant",
    cutout: "p-amour",
    metals: ["yellow", "rose", "white", "platinum"],
    stones: "0.15 ct round brilliants",
    price: 1450,
    weight: 1.2,
    gallery: ["necklace-02", "atelier-02"],
    description:
      "Two hearts, one pierced with a word and one set with diamonds, on a double curb chain. The word can be yours.",
    details: ["Pierced lettering, cut by hand", "Double curb chain", "Your word, up to 8 letters"],
    leadTime: 15,
    sizes: "necklace",
    engravable: true,
    tags: ["gift"],
  },
  {
    slug: "perle-chain",
    name: "Perle",
    category: "necklaces",
    collection: "necklaces",
    type: "Pearl solitaire chain",
    cutout: "p-perle-chain",
    metals: ["white", "yellow", "rose", "platinum"],
    stones: "Akoya pearl, 6 mm",
    price: 690,
    weight: 0.6,
    gallery: ["pearl-02", "skin-02"],
    description: "A single Akoya pearl sliding on a fine ball chain. The smallest thing the house makes, and the most worn.",
    details: ["Akoya pearl, AAA lustre", "Ball chain", "Pearl moves freely"],
    leadTime: 10,
    sizes: "necklace",
    tags: ["gift", "bestseller"],
  },
  {
    slug: "belle-epoque-necklace",
    name: "Belle Époque",
    category: "necklaces",
    collection: "necklaces",
    type: "Drop necklace",
    cutout: "p-belle-epoque",
    metals: ["white", "platinum", "yellow", "rose"],
    stones: "4.80 ct old-cut and champagne diamonds",
    price: 15370,
    weight: 2.6,
    gallery: ["necklace-03", "atelier-04"],
    description:
      "After a 1910 design from the house archive: a garland of old-cut diamonds ending in a drop of champagne diamonds, with a pearl clasp.",
    details: ["Platinum lace work, pierced by hand", "Champagne diamond drop", "Pearl and diamond clasp"],
    leadTime: 45,
    sizes: "necklace",
    tags: ["new"],
  },
  {
    slug: "initiale-bar",
    name: "Initiale",
    category: "necklaces",
    type: "Engraved bar pendant",
    cutout: "p-initiale",
    metals: ["white", "yellow", "rose", "platinum"],
    price: 590,
    weight: 0.5,
    gallery: ["atelier-02", "skin-01"],
    description:
      "A small bar engraved with a name or a date, beside a round tag for an initial. Engraved in the atelier, by hand.",
    details: ["Bar 22 × 6 mm", "Round tag 6 mm", "Engraving included"],
    leadTime: 7,
    sizes: "necklace",
    engravable: true,
    tags: ["gift"],
  },
  {
    slug: "solene-pendant",
    name: "Solène",
    category: "necklaces",
    collection: "necklaces",
    type: "Cushion cluster pendant",
    cutout: "p-solene",
    metals: ["white", "yellow", "rose", "platinum"],
    stones: "0.60 ct round brilliants, illusion set",
    price: 1950,
    weight: 0.9,
    gallery: ["necklace-01", "skin-02"],
    description:
      "Nineteen small diamonds set together to read as one large stone, inside a cushion halo. A large look at a gentle price.",
    details: ["Illusion setting", "Box chain with extender", "Pendant 9 mm"],
    leadTime: 15,
    sizes: "necklace",
    tags: ["gift"],
  },

  /* ───────────── Earrings ───────────── */
  {
    slug: "point-de-lumiere-studs",
    name: "Point de lumière",
    category: "earrings",
    collection: "earrings",
    type: "Stud earrings",
    cutout: "earrings-studs",
    metals: ["rose", "yellow", "white", "platinum"],
    stones: "2 × 0.25 ct round brilliants, G VS1",
    price: 2400,
    weight: 0.5,
    gallery: ["earring-02", "skin-01"],
    description: "A quarter carat each side in a four-claw basket, on screw backs. The earrings you forget you are wearing.",
    details: ["Four-claw basket", "Screw backs, stamped 18k", "Sold as a pair"],
    leadTime: 10,
    tags: ["bestseller", "gift"],
    signature: 7,
  },
  {
    slug: "aureole-studs",
    name: "Auréole",
    category: "earrings",
    collection: "earrings",
    type: "Halo stud earrings",
    cutout: "earrings-halo",
    metals: ["white", "platinum", "yellow", "rose"],
    stones: "2 × 0.50 ct round brilliants; halos 0.40 ct",
    price: 6900,
    weight: 0.6,
    gallery: ["earring-01", "skin-02"],
    description: "Half a carat each side, ringed with small diamonds so each stud reads larger and brighter.",
    details: ["Halo of 16 stones per stud", "Butterfly backs", "Sold as a pair"],
    leadTime: 20,
    tags: ["bridal"],
    signature: 8,
  },
  {
    slug: "creole-hoops",
    name: "Créole",
    category: "earrings",
    collection: "earrings",
    type: "Twisted hoops",
    cutout: "earrings-hoops",
    metals: ["yellow", "rose", "white", "platinum"],
    price: 1950,
    weight: 1.4,
    gallery: ["earring-03", "skin-02"],
    description: "Three rings of gold twisted into one hoop, hollow so they are light enough to wear all day.",
    details: ["Hollow tubes, 4 mm", "Hinged clip closure", "Diameter 22 mm"],
    leadTime: 10,
    tags: ["bestseller"],
    signature: 9,
  },
  {
    slug: "baguette-studs",
    name: "Baguette",
    category: "earrings",
    collection: "earrings",
    type: "Baguette cluster studs",
    cutout: "p-baguette",
    metals: ["white", "platinum", "yellow", "rose"],
    stones: "2 × 0.40 ct baguettes and brilliants",
    price: 3200,
    weight: 0.5,
    gallery: ["earring-02", "atelier-01"],
    description: "Four baguettes framed by eight small brilliants, set close to read as one square of light.",
    details: ["Square 6 mm", "Push backs", "Sold as a pair"],
    leadTime: 15,
    tags: ["new"],
  },
  {
    slug: "marguerite-studs",
    name: "Marguerite",
    category: "earrings",
    collection: "earrings",
    type: "Flower studs",
    cutout: "p-fleur",
    metals: ["yellow", "rose", "white", "platinum"],
    stones: "Marquise white sapphires, diamond centres",
    price: 2800,
    weight: 0.7,
    gallery: ["earring-01", "skin-01"],
    description: "Twelve marquise petals around a diamond heart, each petal set at its own angle like a daisy opening.",
    details: ["12 marquise sapphires per stud", "Diamond centre", "Sold as a pair"],
    leadTime: 20,
    tags: ["gift"],
  },
  {
    slug: "etoile-studs",
    name: "Étoile",
    category: "earrings",
    collection: "earrings",
    type: "Star halo studs",
    cutout: "p-etoile",
    metals: ["yellow", "white", "rose", "platinum"],
    stones: "2 × 0.20 ct centre brilliants; 0.48 ct points",
    price: 3600,
    weight: 0.7,
    gallery: ["earring-03", "atelier-02"],
    description: "A bezel-set brilliant inside a six-pointed star of diamonds, after the stars painted on the boutique's ceiling.",
    details: ["Bezel-set centre", "Six claw-set points", "Sold as a pair"],
    leadTime: 20,
    tags: ["new"],
  },
  {
    slug: "noeud-studs",
    name: "Nœud",
    category: "earrings",
    collection: "earrings",
    type: "Knot studs",
    cutout: "p-noeud",
    metals: ["yellow", "rose", "white", "platinum"],
    price: 890,
    weight: 0.6,
    gallery: ["earring-03", "skin-02"],
    description: "Three strands of gold tied in a knot. A small promise, worn every day.",
    details: ["Twisted wire, 1 mm strands", "Push backs", "Sold as a pair"],
    leadTime: 10,
    tags: ["gift"],
  },
  {
    slug: "geometrie-studs",
    name: "Géométrie",
    category: "earrings",
    collection: "earrings",
    type: "Interlocking studs",
    cutout: "p-geometrie",
    metals: ["yellow", "rose", "white", "platinum"],
    stones: "0.24 ct round brilliants",
    price: 1650,
    weight: 0.6,
    gallery: ["earring-02", "atelier-03"],
    description: "Two squares, one polished and one set with diamonds, locked together at an angle.",
    details: ["Polished and set squares", "Push backs", "Sold as a pair"],
    leadTime: 15,
  },
  {
    slug: "lumiere-halo-studs",
    name: "Lumière",
    category: "earrings",
    collection: "earrings",
    type: "Halo studs",
    cutout: "p-goutte-studs",
    metals: ["white", "yellow", "rose", "platinum"],
    stones: "2 × 0.30 ct round brilliants; halos 0.24 ct",
    price: 3400,
    weight: 0.5,
    gallery: ["earring-01", "skin-01"],
    description: "A smaller halo stud for every day: a third of a carat each side in a ring of tiny diamonds.",
    details: ["Halo of 14 stones per stud", "Screw backs", "Sold as a pair"],
    leadTime: 15,
    tags: ["gift"],
  },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export const signaturePieces = products
  .filter((p) => p.signature !== undefined)
  .sort((a, b) => (a.signature ?? 0) - (b.signature ?? 0));

/** Price in a given metal: the default price, adjusted for the metal's cost × the gold used. */
export function priceFor(p: Product, metal?: MetalId) {
  if (!p.metals || !metal || metal === p.metals[0]) return p.price;
  const delta = (METAL_PRICE[metal] - METAL_PRICE[p.metals[0]]) * p.weight;
  return Math.round((p.price + delta) / 10) * 10;
}

/** Lowest price across a piece's metals, for "from €…" */
export function fromPrice(p: Product) {
  return Math.min(...(p.metals ?? [undefined]).map((m) => priceFor(p, m)));
}

/** Pieces to show beside this one: same category first, then the others. */
export function related(p: Product, count = 4) {
  const same = products.filter((x) => x.slug !== p.slug && x.category === p.category);
  const other = products.filter((x) => x.slug !== p.slug && x.category !== p.category);
  const pick = (list: Product[], n: number) => {
    const seed = [...p.slug].reduce((a, ch) => a + ch.charCodeAt(0), 0);
    return [...list].sort((a, b) => ((a.slug.length * seed) % 7) - ((b.slug.length * seed) % 7)).slice(0, n);
  };
  return [...pick(same, 3), ...pick(other, count)].slice(0, count);
}
