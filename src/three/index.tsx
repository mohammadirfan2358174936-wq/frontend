/**
 * Public surface for the Eventora 3D layer.
 *
 * The three scenes are exposed ONLY as `React.lazy` components so that the
 * heavy `three-vendor` chunk is code-split and never blocks first paint. The
 * hooks and building-block objects are also re-exported for direct use inside
 * custom canvases.
 *
 * Typical usage on a page:
 *
 * ```tsx
 * import { SceneCanvas, LazyHeroScene } from "@/three";
 *
 * <SceneCanvas label="hero">
 *   <LazyHeroScene />
 * </SceneCanvas>
 * ```
 */
import { lazy, Suspense, type CSSProperties } from "react";
import type { ReactNode } from "react";

// ─── Lazy scene entry points (code-split three-vendor chunk) ────────────────
export const LazyHeroScene = lazy(() => import("./HeroScene"));
export const LazyEventOrbScene = lazy(() => import("./EventOrbScene"));
export const LazyCardScene = lazy(() => import("./CardScene"));

// ─── Suspense fallback ──────────────────────────────────────────────────────
const fallbackRootStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "grid",
  placeItems: "center",
  pointerEvents: "none",
};

const fallbackPillStyle: CSSProperties = {
  padding: "0.5rem 1rem",
  borderRadius: "9999px",
  border: "1px solid rgba(148, 163, 184, 0.18)",
  background: "rgba(255, 255, 255, 0.04)",
  color: "rgba(203, 213, 225, 0.72)",
  fontSize: "0.75rem",
  letterSpacing: "0.02em",
  backdropFilter: "blur(6px)",
};

/**
 * Minimal, accessible placeholder shown while a scene chunk loads. The inner
 * text is only announced to screen readers; the visible pill is subtle so it
 * never distracts from the page.
 */
export function SceneFallback({ label }: { label?: string }): JSX.Element {
  return (
    <div style={fallbackRootStyle} role="status" aria-live="polite" aria-busy="true">
      <span style={fallbackPillStyle}>
        <span aria-hidden="true">◌ </span>
        {label ? `Loading ${label}…` : "Loading 3D scene…"}
      </span>
    </div>
  );
}

/**
 * Wraps `children` in a `<Suspense>` boundary that renders {@link SceneFallback}
 * while the lazy scene chunk (and any suspended textures) resolve.
 */
export function SceneCanvas({
  children,
  label,
}: {
  children: ReactNode;
  label?: string;
}): JSX.Element {
  return <Suspense fallback={<SceneFallback label={label} />}>{children}</Suspense>;
}

// ─── Raw hooks (for direct use inside custom canvases) ──────────────────────
/* eslint-disable react-refresh/only-export-components */
export { useReducedMotion } from "./hooks/useReducedMotion";
export { useQualityTier, type QualityTier } from "./hooks/useQualityTier";
export { usePointerParallax, type PointerParallaxResult } from "./hooks/usePointerParallax";

// ─── Raw objects (composable scene building blocks) ─────────────────────────
export { ParticleField, type ParticleFieldProps } from "./objects/ParticleField";
export { FloatingTickets, type FloatingTicketsProps } from "./objects/FloatingTickets";
export { EventOrb, type EventOrbProps } from "./objects/EventOrb";
export { HolographicPanel, type HolographicPanelProps } from "./objects/HolographicPanel";
export { VenueStructure, type VenueStructureProps } from "./objects/VenueStructure";

// ─── CardScene is exported raw for direct use (already wrapped by Lazy*) ────
export { default as CardScene, type CardSceneProps } from "./CardScene";
