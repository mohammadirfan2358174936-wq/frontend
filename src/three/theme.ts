/**
 * Eventora 3D theme — shared design tokens & tiny math helpers.
 *
 * Centralising the palette, damping constants and pure-geometry helpers here
 * keeps the individual objects focused on geometry/animation and makes the
 * whole 3D layer rethemeable from a single file. Nothing in this module holds
 * GPU state, so it is safe to import anywhere.
 */
import * as THREE from "three";
import type { CSSProperties } from "react";

/**
 * Brand gradient stops. These mirror the Tailwind tokens used across the app
 * (`indigo-500` → `violet-500` → `fuchsia-500`, `cyan-400` → `blue-500`).
 */
export const PALETTE = {
  indigo: "#6366f1",
  violet: "#8b5cf6",
  fuchsia: "#d946ef",
  cyan: "#22d3ee",
  blue: "#3b82f6",
  pink: "#ec4899",
} as const;

/** Ordered ramp used to tint the floating tickets. */
export const TICKET_COLORS: ReadonlyArray<string> = [
  PALETTE.indigo,
  PALETTE.violet,
  PALETTE.fuchsia,
  PALETTE.cyan,
  PALETTE.blue,
  PALETTE.pink,
];

/** Top → bottom gradient pairs for the default (network-free) CardScene path. */
export const CARD_GRADIENTS: ReadonlyArray<readonly [string, string]> = [
  [PALETTE.indigo, PALETTE.violet],
  [PALETTE.violet, PALETTE.fuchsia],
  [PALETTE.fuchsia, PALETTE.pink],
  [PALETTE.cyan, PALETTE.blue],
  [PALETTE.blue, PALETTE.indigo],
];

/** Damping coefficient for pointer parallax (higher = snappier follow). */
export const PARALLAX_LAMBDA = 3.5;

/**
 * Frame-rate-independent smoothing of `target` toward `toward` using three's
 * `MathUtils.damp`, so parallax feels identical on 60Hz and 144Hz displays.
 */
export function dampVec2(
  target: THREE.Vector2,
  toward: THREE.Vector2,
  lambda: number,
  delta: number,
): THREE.Vector2 {
  target.x = THREE.MathUtils.damp(target.x, toward.x, lambda, delta);
  target.y = THREE.MathUtils.damp(target.y, toward.y, lambda, delta);
  return target;
}

/**
 * The WebGL canvas fills its positioned parent but never intercepts pointer
 * input, so it can never steal clicks from the page layered on top of it.
 */
export const CANVAS_LAYER_STYLE: CSSProperties = {
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
};

/**
 * The scene wrapper sits behind page content and DOES receive pointer events
 * (for parallax). Because it renders below interactive content it never blocks
 * clicks — the top-most element under the cursor is always the real control.
 */
export const SCENE_WRAPPER_STYLE: CSSProperties = {
  position: "absolute",
  inset: 0,
  pointerEvents: "auto",
};

/**
 * A vertical gradient plane built purely from a vertex-colour attribute — no
 * texture / network fetch (the default CardScene path). Pure maths, so it also
 * renders deterministically in jsdom-based unit tests.
 */
export function makeGradientPlane(
  width: number,
  height: number,
  top: string,
  bottom: string,
): THREE.PlaneGeometry {
  const geometry = new THREE.PlaneGeometry(width, height, 1, 1);
  const topColor = new THREE.Color(top);
  const bottomColor = new THREE.Color(bottom);
  // PlaneGeometry with 1×1 segments has four vertices: TL, TR, BL, BR.
  const colors = new Float32Array([
    topColor.r, topColor.g, topColor.b,
    topColor.r, topColor.g, topColor.b,
    bottomColor.r, bottomColor.g, bottomColor.b,
    bottomColor.r, bottomColor.g, bottomColor.b,
  ]);
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geometry;
}
