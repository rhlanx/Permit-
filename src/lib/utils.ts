import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrencyRange(low: number, high: number): string {
  if (low === high) return formatCurrency(low);
  if (low === 0 && high === 0) return "Free";
  return `${formatCurrency(low)}–${formatCurrency(high)}`;
}

export function formatWeekRange(low: number, high: number): string {
  if (low === 0 && high === 0) return "Instant (online)";
  if (low === high) return `${low} week${low !== 1 ? "s" : ""}`;
  return `${low}–${high} weeks`;
}
