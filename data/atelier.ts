import { site } from "@/lib/site";

export interface AtelierStat {
  value: number;
  label: string;
  note: string;
}

/** "The atelier in numbers" — edit freely. */
export const atelierStats: AtelierStat[] = [
  { value: 2026 - site.founded, label: "Years at the bench", note: "since 2009, same street" },
  { value: 12480, label: "Stones set by hand", note: "counted in the setting book" },
  { value: 46, label: "Steps in every ring", note: "from wax to final polish" },
  { value: 21, label: "Days to your hand", note: "for a ring made to order" },
];
