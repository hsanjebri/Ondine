/** Film used on the site. Listed on /credits and in MEDIA.md. */
export interface FilmCredit {
  slot: string;
  title: string;
  author: string;
  authorUrl: string;
  sourceUrl: string;
  licence: string;
  licenceUrl: string;
  /** What was done to the original */
  edit: string;
}

export const films: FilmCredit[] = [
  {
    slot: "hero-film",
    title: "Elegant diamond rings reflecting light",
    author: "Kat IE",
    authorUrl: "https://www.pexels.com/@kat-ie-2156765516/",
    sourceUrl: "https://www.pexels.com/video/elegant-diamond-rings-reflecting-light-34369898/",
    licence: "Pexels licence",
    licenceUrl: "https://www.pexels.com/license/",
    edit: "Trimmed to one 8-second turn for a seamless loop, blacks warmed to the site's black, re-encoded.",
  },
];
