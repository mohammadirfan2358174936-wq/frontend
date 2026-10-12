import { useCallback, useMemo, useRef } from "react";
import * as THREE from "three";
import type { MutableRefObject, PointerEventHandler } from "react";

/**
 * Result of {@link usePointerParallax}: the raw normalised pointer target plus
 * ready-to-spread DOM handlers. Spread `handlers` onto the background wrapper
 * `<div>` of a scene (which sits behind page content and therefore never
 * blocks clicks) to feed the parallax.
 */
export interface PointerParallaxResult {
  /** Raw pointer in normalised [-1, 1] space, updated synchronously on move. */
  pointerRef: MutableRefObject<THREE.Vector2>;
  handlers: {
    onPointerMove: PointerEventHandler<HTMLDivElement>;
    onPointerLeave: PointerEventHandler<HTMLDivElement>;
  };
}

/**
 * Tracks the pointer as a normalised Vector2. The stored value is the *raw*
 * target; consuming components smooth it each frame with
 * `THREE.MathUtils.damp` (see `dampVec2`) so parallax eases instead of snapping.
 */
export function usePointerParallax(strength = 1): PointerParallaxResult {
  const pointerRef = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));

  const onPointerMove = useCallback<PointerEventHandler<HTMLDivElement>>(
    (event) => {
      if (typeof window === "undefined") return;
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      // Screen-space Y is inverted relative to clip-space Y.
      const y = -((event.clientY / window.innerHeight) * 2 - 1);
      pointerRef.current.set(x * strength, y * strength);
    },
    [strength],
  );

  const onPointerLeave = useCallback(() => {
    // Ease back to a neutral centred pose when the pointer exits the scene.
    pointerRef.current.set(0, 0);
  }, []);

  const handlers = useMemo(() => ({ onPointerMove, onPointerLeave }), [
    onPointerMove,
    onPointerLeave,
  ]);

  return { pointerRef, handlers };
}
