/**
 * Every photographic slot on the site.
 *
 * `scripts/fetch-unsplash.ts` fills each slot once from the Unsplash API and
 * writes the result to `data/images.json`. Components only ever reference a
 * slot id, so the brand's own photography can replace a slot later without
 * touching any component (see MEDIA.md).
 *
 * Request budget: the demo key allows 50 requests per hour. One search per
 * query + one download-tracking call per photo. The script is resumable and
 * only re-requests slots whose query or `pick` changed.
 */

export type SlotOrientation = "landscape" | "portrait" | "any";

export interface ImageSlot {
  id: string;
  /** Unsplash search query. Slots sharing a query share one search request. */
  query: string;
  orientation: SlotOrientation;
  /** Aspect ratio the slot is displayed at (for MEDIA.md / art direction). */
  ratio: string;
  /** Where the slot is used on the site. */
  purpose: string;
  /** Used when the photo has no alt description on Unsplash. */
  altFallback: string;
  /**
   * Hand-picked Unsplash photo id. Overrides the automatic choice; looked up
   * in the cached search results first, then fetched by id (1 request).
   */
  pick?: string;
}

export const IMAGE_SLOTS = [
  // — diamond ring macro
  { id: "ring-01", query: "diamond ring macro", orientation: "landscape", ratio: "16:9", purpose: "Hero fallback still, Composer teaser backdrop", altFallback: "A diamond ring in raking light" },
  { id: "ring-02", query: "solitaire engagement ring", orientation: "portrait", ratio: "3:4", purpose: "Collections: Solitaires, product Aube solitaire", altFallback: "A solitaire diamond ring on black velvet", pick: "bj60QB8xBl8" },
  { id: "ring-03", query: "diamond ring macro", orientation: "portrait", ratio: "4:5", purpose: "Product: Ondine solitaire", altFallback: "A diamond ring photographed up close" },
  { id: "ring-04", query: "diamond ring macro", orientation: "any", ratio: "4:5", purpose: "Product: Trilogie, moodboard", altFallback: "Facets of a diamond catching light" },

  // — gold ring hand
  { id: "hand-01", query: "gold ring hand", orientation: "portrait", ratio: "3:4", purpose: "Collections: Bands, product Sillage band", altFallback: "A hand wearing a gold ring" },
  { id: "hand-02", query: "gold ring hand", orientation: "portrait", ratio: "4:5", purpose: "Product: Fil d'or band", altFallback: "Gold rings worn on a hand" },
  { id: "hand-03", query: "gold ring hand", orientation: "any", ratio: "4:5", purpose: "Product: Pavé band, moodboard", altFallback: "A gold band on a finger" },
  { id: "hand-04", query: "gold ring hand", orientation: "landscape", ratio: "3:2", purpose: "Journal", altFallback: "Hands with gold jewellery" },

  // — atelier ("jewellery atelier" returns 0 results on Unsplash; US spelling works)
  { id: "atelier-01", query: "jeweler workshop", orientation: "portrait", ratio: "4:5", purpose: "From stone to ring: 02 design", altFallback: "A jeweller's bench in the atelier" },
  { id: "atelier-02", query: "jeweler workshop", orientation: "portrait", ratio: "4:5", purpose: "From stone to ring: 03 setting", altFallback: "A stone-setter at work" },
  { id: "atelier-03", query: "jeweler workshop", orientation: "portrait", ratio: "4:5", purpose: "From stone to ring: 04 polishing", altFallback: "Tools on a jeweller's bench" },
  { id: "atelier-04", query: "jeweler workshop", orientation: "landscape", ratio: "3:2", purpose: "Atelier in numbers, journal", altFallback: "The atelier behind the boutique" },

  // — necklace black velvet
  { id: "necklace-01", query: "diamond necklace", orientation: "portrait", ratio: "3:4", purpose: "Collections: Necklaces, product Rivière", altFallback: "A fine diamond necklace worn close to the skin", pick: "hd3j5W8Aucs" },
  { id: "necklace-02", query: "gemstone close up", orientation: "any", ratio: "4:5", purpose: "Product: Goutte pendant", altFallback: "A fine diamond pendant worn on skin", pick: "JG_xxq3g7EQ" },
  { id: "necklace-03", query: "diamond necklace", orientation: "any", ratio: "4:5", purpose: "Product: Perle pendant, Rivière (second image)", altFallback: "A fine pendant worn on skin", pick: "QafMBhBRYOY" },

  // — earrings portrait
  { id: "earring-01", query: "earrings portrait", orientation: "portrait", ratio: "3:4", purpose: "Collections: Earrings, product Larme", altFallback: "A portrait wearing drop earrings" },
  { id: "earring-02", query: "earrings portrait", orientation: "portrait", ratio: "4:5", purpose: "Product: Point de lumière studs, diptych", altFallback: "Earrings worn in profile" },
  { id: "earring-03", query: "earrings portrait", orientation: "portrait", ratio: "4:5", purpose: "Product: Créole hoops, journal", altFallback: "A portrait with gold earrings" },

  // — gemstone close up
  { id: "stone-01", query: "gemstone close up", orientation: "any", ratio: "4:5", purpose: "From stone to ring: 01 choosing the stone", altFallback: "A loose round brilliant diamond on dark wood", pick: "qeUldVv1kdM" },
  { id: "stone-02", query: "gemstone close up", orientation: "any", ratio: "1:1", purpose: "Moodboard, journal", altFallback: "A marquise-cut diamond on dark wood", pick: "5O8n5fF058o" },

  // — gold earring macro skin
  { id: "skin-01", query: "gold earring macro skin", orientation: "portrait", ratio: "4:5", purpose: "Moodboard", altFallback: "A gold earring against skin" },
  { id: "skin-02", query: "gold earring macro skin", orientation: "any", ratio: "4:5", purpose: "Journal", altFallback: "Gold against skin, macro" },

  // — baroque pearl earring
  { id: "pearl-01", query: "baroque pearl earring", orientation: "portrait", ratio: "4:5", purpose: "Diptych right panel (greyscale → colour)", altFallback: "A baroque pearl earring" },
  { id: "pearl-02", query: "baroque pearl earring", orientation: "any", ratio: "4:5", purpose: "Journal", altFallback: "Pearl earrings up close" },

  // — jewelry packaging black
  { id: "pack-01", query: "jewelry packaging black", orientation: "portrait", ratio: "4:5", purpose: "Packaging: the bag", altFallback: "A black jewellery bag" },
  { id: "pack-02", query: "jewelry packaging black", orientation: "any", ratio: "4:5", purpose: "Packaging: the long box", altFallback: "A long black jewellery box" },

  // — paper texture cream
  { id: "paper-01", query: "paper texture cream", orientation: "any", ratio: "4:5", purpose: "Moodboard paper swatch", altFallback: "Cream paper texture" },

  // — black and white portrait ear
  { id: "bw-01", query: "black and white portrait ear", orientation: "portrait", ratio: "4:5", purpose: "Spare (journal)", altFallback: "A black and white portrait in profile" },
  { id: "bw-02", query: "black and white portrait ear", orientation: "portrait", ratio: "4:5", purpose: "Journal window inset", altFallback: "A black and white portrait" },

  // — motion blur portrait
  { id: "blur-01", query: "motion blur portrait", orientation: "landscape", ratio: "16:9", purpose: "The box: depth layers background", altFallback: "A portrait softened by motion" },

  // — water ripple golden light
  { id: "water-01", query: "water ripple golden light", orientation: "landscape", ratio: "16:9", purpose: "Touch the water (WebGL ripple) + reduced-motion fallback", altFallback: "Golden light on rippling water" },

  // — hands in water
  { id: "water-02", query: "hands in water", orientation: "any", ratio: "4:5", purpose: "Moodboard, journal", altFallback: "Hands resting in water" },
] as const satisfies readonly ImageSlot[];

export type SlotId = (typeof IMAGE_SLOTS)[number]["id"];
