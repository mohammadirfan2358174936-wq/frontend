import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./useReducedMotion";

/**
 * Eased number counter — the "0 → 8,420" dashboard stat animation.
 * Uses an easeOutExpo curve so the value decelerates into its final figure.
 */
export function useCountUp(target: number, duration = 1600, start = 0): number {
  const reduced = useReducedMotion();
  const [value, setValue] = useState(start);
  const frame = useRef(0);
  const from = useRef(start);

  useEffect(() => {
    if (frame.current) cancelAnimationFrame(frame.current);

    if (reduced) {
      from.current = target;
      setValue(target);
      return;
    }

    const origin = from.current;
    const delta = target - origin;
    if (delta === 0) return;

    const beganAt = performance.now();

    const step = (now: number) => {
      const t = Math.min((now - beganAt) / duration, 1);
      // easeOutExpo — fast start, long graceful settle.
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      const next = origin + delta * eased;
      setValue(next);
      from.current = next;
      if (t < 1) {
        frame.current = requestAnimationFrame(step);
      } else {
        frame.current = 0;
        setValue(target);
      }
    };

    frame.current = requestAnimationFrame(step);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [target, duration, reduced]);

  return value;
}
