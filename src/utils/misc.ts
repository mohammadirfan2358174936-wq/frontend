/** Tiny, dependency-free utilities. */

/** Random id that is safe to use as a React key and in URLs. */
export function uid(prefix = "id"): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;
}

/** Clamp a number into an inclusive range. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Map a value from one range to another. */
export function mapRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
  if (inMax === inMin) return outMin;
  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}

/** Debounce a callback (used by resize handlers and search-as-you-type). */
export function debounce<A extends unknown[]>(fn: (...args: A) => void, wait = 200): (...args: A) => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: A) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

/** Sleep helper for staged animations (wizard step transitions, etc.). */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Download a data URL / blob URL to the user's machine. */
export function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

/** Share via the Web Share API, falling back to clipboard copy. */
export async function shareOrCopy(title: string, text: string, url: string): Promise<"shared" | "copied" | "failed"> {
  try {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      await navigator.share({ title, text, url });
      return "shared";
    }
  } catch {
    /* user dismissed — fall through to clipboard */
  }
  try {
    await navigator.clipboard.writeText(`${text} — ${url}`);
    return "copied";
  } catch {
    return "failed";
  }
}

/** Build an array of page numbers with ellipsis for pagination. */
export function pageWindow(current: number, total: number, span = 1): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, total, current]);
  for (let i = 1; i <= span; i += 1) {
    if (current - i > 1) pages.add(current - i);
    if (current + i < total) pages.add(current + i);
  }
  const sorted = [...pages].sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  sorted.forEach((page, index) => {
    if (index > 0 && page - (sorted[index - 1] as number) > 1) out.push("…");
    out.push(page);
  });
  return out;
}

/** True when the document currently prefers reduced motion. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Seat-urgency model shared by event cards and the details page. */
export type SeatUrgency = "open" | "filling" | "critical" | "soldout";

export function seatUrgency(available: number, capacity: number): {
  level: SeatUrgency;
  /** 0..1 — how full the event is. */
  ratio: number;
  label: string;
} {
  const cap = capacity > 0 ? capacity : 1;
  const ratio = clamp(1 - available / cap, 0, 1);
  if (available <= 0) return { level: "soldout", ratio: 1, label: "Sold out" };
  if (ratio >= 0.85) return { level: "critical", ratio, label: `Only ${available} left` };
  if (ratio >= 0.55) return { level: "filling", ratio, label: "Selling fast" };
  return { level: "open", ratio, label: `${available} seats available` };
}
