/** Brand facts in one place. Copy elsewhere should read from here. */
export const site = {
  name: "Maison Ondine",
  tagline: "Light, held forever.",
  description:
    "An independent Parisian jewellery house on Saint-Honoré. Solitaires, bands, earrings and necklaces designed, set and polished by hand in the atelier behind the boutique, and rings you compose yourself.",
  founded: 2009,
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://maison-ondine.vercel.app",
  locale: "en_GB",
  address: {
    street: "Rue Saint-Honoré",
    district: "Paris 1er",
    postalCode: "75001",
    city: "Paris",
    country: "France",
    countryCode: "FR",
    /** Display line — the house does not publish a street number. */
    line: "Saint-Honoré, Paris 1er, France",
  },
  phone: "+33 1 00 00 00 00",
  phoneHref: "tel:+33100000000",
  email: "atelier@maison-ondine.com",
  hours: [
    { days: "Tuesday – Saturday", short: "Tue–Sat", time: "10:30 – 19:00" },
    { days: "Monday", short: "Mon", time: "By appointment" },
    { days: "Sunday", short: "Sun", time: "Closed" },
  ],
  /** schema.org openingHoursSpecification */
  openingHours: [{ dayOfWeek: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: "10:30", closes: "19:00" }],
  socials: [
    { label: "Instagram", href: "https://www.instagram.com/" },
    { label: "Pinterest", href: "https://www.pinterest.com/" },
  ],
} as const;

export const nav = [
  { label: "Collections", href: "/#collections" },
  { label: "Composer", href: "/composer" },
  { label: "Atelier", href: "/#atelier" },
  { label: "Journal", href: "/#journal" },
  { label: "Appointment", href: "/#appointment" },
] as const;

export const legalNav = [
  { label: "Legal notice", href: "/legal-notice" },
  { label: "Terms of sale", href: "/terms-of-sale" },
  { label: "Privacy", href: "/privacy" },
  { label: "Cookies", href: "/cookies" },
  { label: "Credits", href: "/credits" },
] as const;
