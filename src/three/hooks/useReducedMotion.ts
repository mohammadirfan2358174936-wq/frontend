/**
 * Thin re-export so nothing under `three/` reaches into the general hooks
 * barrel (`@/hooks`). The real implementation lives in
 * `@/hooks/useReducedMotion` and owns the single shared `matchMedia`
 * subscription for the whole app; we only re-surface it here.
 */
export { useReducedMotion } from "@/hooks/useReducedMotion";
