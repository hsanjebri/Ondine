const THIN_SPACE = " ";
const number = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 });

/** `€ 4,900` — thin space, no decimals (jewellery prices). */
export function formatEuro(value: number) {
  return `€${THIN_SPACE}${number.format(Math.round(value))}`;
}

/** Zero-padded plate / section numbers: 3 → "03". */
export function pad(n: number, length = 2) {
  return String(n).padStart(length, "0");
}
