import { useCallback, useEffect, useRef } from "react";
import { useReducedMotion } from "./useReducedMotion";

export interface TiltOptions {
  /** Max rotation in degrees on each axis. */
  max?: number;
  /** 0..1 — how quickly the tilt follows the cursor (1 = instant). */
  damping?: number;
  /** Lift the card toward the viewer on hover. */
  lift?: number;
  /** Scale applied on hover. */
  scale?: number;
  /** Ignore the tilt on coarse pointers. */
  disabledOnTouch?: boolean;
}

export interface TiltState {
  rotateX: number;
  rotateY: number;
  scale: number;
  translateZ: number;
  glareX: number;
  glareY: number;
  glareOpacity: number;
}

const REST: TiltState = {
  rotateX: 0,
  rotateY: 0,
  scale: 1,
  translateZ: 0,
  glareX: 50,
  glareY: 50,
  glareOpacity: 0,
};

/**
 * Pointer-driven 3D tilt for cards.
 *
 * The value is written straight to the DOM node's `style.transform` on rAF
 * instead of going through `setState`, so hovering a grid of 20 cards performs
 * exactly zero React renders. Returns the handlers to spread onto the element.
 */
export function useTilt<T extends HTMLElement = HTMLDivElement>(options: TiltOptions = {}) {
  const {
    max = 8,
    damping = 0.12,
    lift = 18,
    scale = 1.015,
    disabledOnTouch = true,
  } = options;

  const reduced = useReducedMotion();
  const ref = useRef<T | null>(null);
  const frame = useRef(0);
  const current = useRef<TiltState>({ ...REST });
  const target = useRef<TiltState>({ ...REST });

  const apply = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    const c = current.current;
    node.style.transform =
      `perspective(1000px) rotateX(${c.rotateX.toFixed(3)}deg) rotateY(${c.rotateY.toFixed(3)}deg) ` +
      `scale3d(${c.scale}, ${c.scale}, ${c.scale}) translateZ(${c.translateZ.toFixed(2)}px)`;
    node.style.setProperty("--glare-x", `${c.glareX}%`);
    node.style.setProperty("--glare-y", `${c.glareY}%`);
    node.style.setProperty("--glare-opacity", c.glareOpacity.toFixed(3));
  }, []);

  const tick = useCallback(() => {
    const c = current.current;
    const t = target.current;
    c.rotateX += (t.rotateX - c.rotateX) * damping;
    c.rotateY += (t.rotateY - c.rotateY) * damping;
    c.scale += (t.scale - c.scale) * damping;
    c.translateZ += (t.translateZ - c.translateZ) * damping;
    c.glareX += (t.glareX - c.glareX) * damping;
    c.glareY += (t.glareY - c.glareY) * damping;
    c.glareOpacity += (t.glareOpacity - c.glareOpacity) * damping;
    apply();

    const settled =
      Math.abs(t.rotateX - c.rotateX) < 0.01 &&
      Math.abs(t.rotateY - c.rotateY) < 0.01 &&
      Math.abs(t.scale - c.scale) < 0.0005 &&
      Math.abs(t.translateZ - c.translateZ) < 0.05;

    if (settled) {
      Object.assign(c, t);
      apply();
      frame.current = 0;
      return;
    }
    frame.current = requestAnimationFrame(tick);
  }, [apply, damping]);

  const schedule = useCallback(() => {
    if (frame.current) return;
    frame.current = requestAnimationFrame(tick);
  }, [tick]);

  const onPointerMove = useCallback(
    (event: React.PointerEvent<T>) => {
      const node = ref.current;
      if (!node || reduced) return;
      if (disabledOnTouch && event.pointerType === "touch") return;
      const rect = node.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      const nx = px * 2 - 1;
      const ny = py * 2 - 1;

      target.current = {
        rotateX: -ny * max,
        rotateY: nx * max,
        scale,
        translateZ: lift,
        glareX: px * 100,
        glareY: py * 100,
        glareOpacity: 0.35,
      };
      schedule();
    },
    [reduced, disabledOnTouch, max, scale, lift, schedule],
  );

  const onPointerLeave = useCallback(() => {
    target.current = { ...REST };
    schedule();
  }, [schedule]);

  useEffect(
    () => () => {
      if (frame.current) cancelAnimationFrame(frame.current);
      const node = ref.current;
      if (node) node.style.removeProperty("transform");
    },
    [],
  );

  return { ref, onPointerMove, onPointerLeave, style: undefined as never };
}
