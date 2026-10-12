import { useState, type MouseEvent } from "react";
import { Star } from "lucide-react";

import { cn } from "@/utils/cn";

export type RatingSize = "sm" | "md" | "lg";

export interface RatingProps {
  value: number;
  max?: number;
  /** When provided, the rating becomes interactive (stars are buttons). */
  onChange?: (value: number) => void;
  size?: RatingSize;
  className?: string;
  "aria-label"?: string;
}

const sizePx: Record<RatingSize, number> = { sm: 16, md: 20, lg: 24 };

export function Rating({
  value,
  max = 5,
  onChange,
  size = "md",
  className,
  "aria-label": ariaLabel,
}: RatingProps) {
  const [hover, setHover] = useState<number | null>(null);
  const interactive = typeof onChange === "function";
  const displayed = hover ?? value;
  const px = sizePx[size];

  const fraction = (index: number) =>
    Math.min(1, Math.max(0, displayed - index));

  const star = (index: number) => {
    const frac = fraction(index);
    return (
      <span
        aria-hidden
        className="relative inline-block"
        style={{ width: px, height: px }}
      >
        {/* Track */}
        <Star className="absolute inset-0 h-full w-full fill-current text-white/15" />
        {/* Fill, clipped to the fractional width (supports half-stars) */}
        {frac > 0 && (
          <span
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${frac * 100}%` }}
          >
            <Star className="h-full w-full fill-current text-amber-glow" />
          </span>
        )}
      </span>
    );
  };

  const handleEnter = (index: number) => (e: MouseEvent<HTMLElement>) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const isHalf = e.clientX - rect.left < rect.width / 2;
    setHover(index + (isHalf ? 0.5 : 1));
  };

  const handleClick = (index: number) => (e: MouseEvent<HTMLElement>) => {
    if (!onChange) return;
    // Keyboard-activated clicks have detail === 0 → full star only.
    let next = index + 1;
    if (e.detail !== 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      next = index + (e.clientX - rect.left < rect.width / 2 ? 0.5 : 1);
    }
    onChange(next);
  };

  return (
    <div
      className={cn("inline-flex items-center gap-0.5", className)}
      role={interactive ? "group" : undefined}
      aria-label={ariaLabel ?? `Rating: ${value} out of ${max}`}
      onMouseLeave={() => setHover(null)}
    >
      {Array.from({ length: max }, (_, i) =>
        interactive ? (
          <button
            key={i}
            type="button"
            onClick={handleClick(i)}
            onMouseEnter={handleEnter(i)}
            onFocus={() => setHover(i + 1)}
            aria-label={`Rate ${i + 1} out of ${max}`}
            className="ring-focus rounded-sm p-0.5 outline-none transition-transform focus-visible:scale-110"
          >
            {star(i)}
          </button>
        ) : (
          <span key={i}>{star(i)}</span>
        ),
      )}
    </div>
  );
}
