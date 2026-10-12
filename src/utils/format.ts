/**
 * FORMATTING HELPERS
 * ------------------
 * Pure, dependency-free formatters used across the whole app.
 * Dates are locale-stable (en-IN) so SSR/tests and the browser agree.
 */

const IN = "en-IN";

const currencyCache = new Map<string, Intl.NumberFormat>();

function currencyFormatter(currency: string, fractionDigits: number): Intl.NumberFormat {
  const key = `${currency}:${fractionDigits}`;
  let fmt = currencyCache.get(key);
  if (!fmt) {
    fmt = new Intl.NumberFormat(IN, {
      style: "currency",
      currency,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    });
    currencyCache.set(key, fmt);
  }
  return fmt;
}

/** ₹1,999 / $2,499 — zero-padded paise stripped for whole amounts. */
export function formatCurrency(value: number, currency = "INR"): string {
  const safe = Number.isFinite(value) ? value : 0;
  const digits = Number.isInteger(safe) ? 0 : 2;
  return currencyFormatter(currency, digits).format(safe);
}

/** ₹0, ₹2.4M — compact form for dashboard stat tiles. */
export function formatCompactCurrency(value: number, currency = "INR"): string {
  const safe = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat(IN, {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(safe);
}

/** 8420 → "8,420" */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat(IN).format(Number.isFinite(value) ? value : 0);
}

/** 8,420 → "8.4K" */
export function formatCompact(value: number): string {
  const safe = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat(IN, { notation: "compact", maximumFractionDigits: 1 }).format(safe);
}

/** 0.84 → "84%" */
export function formatPercent(value: number, digits = 0): string {
  const safe = Number.isFinite(value) ? value : 0;
  return `${(safe * 100).toFixed(digits)}%`;
}

const dateCache = new Map<string, Intl.DateTimeFormat>();

function dateFormatter(options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = JSON.stringify(options);
  let fmt = dateCache.get(key);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat(IN, { timeZone: "UTC", ...options });
    dateCache.set(key, fmt);
  }
  return fmt;
}

/** "Oct 25, 2026" */
export function formatDate(input: string | Date): string {
  const d = toDate(input);
  if (!d) return "—";
  return dateFormatter({ day: "numeric", month: "short", year: "numeric" }).format(d);
}

/** "OCT 25" — the 3D-card date stamp format. */
export function formatDateShort(input: string | Date): string {
  const d = toDate(input);
  if (!d) return "—";
  return dateFormatter({ day: "2-digit", month: "short" }).format(d).toUpperCase();
}

/** "25 October 2026, 9:00 AM" */
export function formatDateTime(input: string | Date): string {
  const d = toDate(input);
  if (!d) return "—";
  return dateFormatter({ day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "2-digit" }).format(d);
}

/** "Friday, 25 Oct 2026 @ 9:00 AM" — agenda / schedule rows. */
export function formatSchedule(input: string | Date): string {
  const d = toDate(input);
  if (!d) return "—";
  return dateFormatter({ weekday: "long", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }).format(d);
}

/** "9:00 AM – 6:00 PM" */
export function formatTimeRange(start: string | Date, hours: number): string {
  const s = toDate(start);
  if (!s) return "—";
  const e = new Date(s.getTime() + hours * 3_600_000);
  const fmt = dateFormatter({ hour: "numeric", minute: "2-digit" });
  return `${fmt.format(s)} – ${fmt.format(e)}`;
}

/** "in 3 days" / "2 hours ago" */
export function formatRelative(input: string | Date): string {
  const d = toDate(input);
  if (!d) return "—";
  const diffMs = d.getTime() - Date.now();
  const rtf = new Intl.RelativeTimeFormat(IN, { numeric: "auto" });
  const abs = Math.abs(diffMs);
  const min = 60_000, hr = 3_600_000, day = 86_400_000;

  if (abs < min) return "just now";
  if (abs < hr) return rtf.format(Math.round(diffMs / min), "minute");
  if (abs < day) return rtf.format(Math.round(diffMs / hr), "hour");
  if (abs < day * 30) return rtf.format(Math.round(diffMs / day), "day");
  if (abs < day * 365) return rtf.format(Math.round(diffMs / (day * 30)), "month");
  return rtf.format(Math.round(diffMs / (day * 365)), "year");
}

/** "2 days 4h" — seat-urgency labels. */
export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(total / 86_400);
  const hours = Math.floor((total % 86_400) / 3_600);
  if (days > 0) return `${days}d ${hours}h`;
  const mins = Math.floor((total % 3_600) / 60);
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

function toDate(input: string | Date): Date | null {
  if (input instanceof Date) return Number.isNaN(input.getTime()) ? null : input;
  const d = new Date(input);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** "tech-conference-2026" from "Tech Conference 2026" */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

/** "Irfan Ahmed" → "IA" */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Truncate with an ellipsis, word-boundary aware. */
export function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  const clipped = value.slice(0, max);
  const lastSpace = clipped.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? clipped.slice(0, lastSpace) : clipped).trimEnd()}…`;
}

/** 0 → "Free" for zero-price events. */
export function priceLabel(value: number, currency = "INR"): string {
  return value <= 0 ? "Free" : formatCurrency(value, currency);
}

/** Deterministic hue from a string — used for category colour fallbacks. */
export function hueFromString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 360;
}
