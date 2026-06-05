import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeCompanyName(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, " ").replace(/[.,]/g, "");
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Map level strings to numeric order for consistent sorting
const LEVEL_ORDER_MAP: Record<string, number> = {
  // Google / Alphabet
  l3: 3, l4: 4, l5: 5, l6: 6, l7: 7, l8: 8, l9: 9,
  // Meta
  e3: 3, e4: 4, e5: 5, e6: 6, e7: 7,
  // Microsoft
  sde1: 2, sde2: 3, "sde-i": 2, "sde-ii": 3, "sde-iii": 4,
  "principal sde": 5,
  // Amazon
  sde_i: 2, sde_ii: 3,
  // Generic IC
  ic1: 1, ic2: 2, ic3: 3, ic4: 4, ic5: 5, ic6: 6, ic7: 7,
  // Title-based
  intern: 0,
  junior: 1,
  "entry level": 1,
  mid: 2,
  senior: 3,
  "senior engineer": 3,
  staff: 4,
  "staff engineer": 4,
  principal: 5,
  "principal engineer": 5,
  distinguished: 6,
  fellow: 7,
  // Manager tracks
  em: 3,
  "engineering manager": 3,
  "senior em": 4,
  "director of engineering": 5,
  director: 5,
  vp: 6,
  svp: 7,
  cto: 9,
};

export function levelToOrder(level: string): number {
  const key = level.toLowerCase().trim();
  return LEVEL_ORDER_MAP[key] ?? 3; // default to mid-level
}

export function formatCurrency(
  amount: number,
  currency: string = "INR"
): string {
  const locale = currency === "INR" ? "en-IN" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatLakhs(amount: number): string {
  if (amount >= 10_000_000) return `₹${(amount / 10_000_000).toFixed(1)}Cr`;
  if (amount >= 100_000) return `₹${(amount / 100_000).toFixed(1)}L`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function computeTotalComp(
  base: number,
  bonus: number = 0,
  stock: number = 0
): number {
  return base + bonus + stock;
}

export function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}
