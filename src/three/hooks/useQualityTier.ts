import { useEffect, useState } from "react";

/**
 * Adaptive quality tier for the 3D scenes. Screen width and reported CPU core
 * count decide how much GPU/CPU we are allowed to spend (device pixel ratio,
 * particle budget, shadow maps, MSAA). Everything degrades gracefully.
 */
export interface QualityTier {
  tier: "low" | "medium" | "high";
  /** `[min, max]` device-pixel-ratio clamp handed to `<Canvas dpr={...}>`. */
  dpr: [number, number];
  /** Particle budget for `<ParticleField>`. */
  particleCount: number;
  /** Whether shadow maps are enabled. */
  shadows: boolean;
  /** Whether WebGL MSAA is enabled. */
  antialias: boolean;
}

/** A safe middle-ground used before we can read the environment (SSR). */
const SSR_TIER: QualityTier = {
  tier: "medium",
  dpr: [1, 1.5],
  particleCount: 120,
  shadows: false,
  antialias: true,
};

/** Reads `navigator.hardwareConcurrency` defensively (may be undefined). */
function readCores(): number | null {
  if (typeof navigator === "undefined") return null;
  return typeof navigator.hardwareConcurrency === "number"
    ? navigator.hardwareConcurrency
    : null;
}

/** Pure computation of the tier for the current environment. */
function computeTier(): QualityTier {
  if (typeof window === "undefined") return SSR_TIER;

  const width = window.innerWidth;
  const cores = readCores();

  // Low: small screens or weak CPUs — minimal budget.
  if (width < 768 || (cores !== null && cores <= 4)) {
    return { tier: "low", dpr: [1, 1], particleCount: 40, shadows: false, antialias: false };
  }
  // Medium: laptops / mid-range phones.
  if (width < 1280 || (cores !== null && cores <= 8)) {
    return { tier: "medium", dpr: [1, 1.5], particleCount: 120, shadows: false, antialias: true };
  }
  // High: desktop with plenty of cores and viewport room.
  return { tier: "high", dpr: [1, 2], particleCount: 300, shadows: true, antialias: true };
}

/**
 * Reactive quality tier. Recomputes on resize (debounced 200 ms so we never
 * thrash the tier while a user drags a window edge) and is fully SSR-safe.
 */
export function useQualityTier(): QualityTier {
  const [tier, setTier] = useState<QualityTier>(computeTier);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let handle = 0;
    const onResize = () => {
      window.clearTimeout(handle);
      handle = window.setTimeout(() => setTier(computeTier()), 200);
    };

    window.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(handle);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return tier;
}
