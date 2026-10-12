import { useEffect, useRef } from "react";

export interface Pointer { x: number; y: number; }

/**
 * Cursor position, sampled on rAF and throttled to ~60fps.
 *
 * Consumers that drive WebGL read `ref.current` inside their own `useFrame`,
 * which avoids a React re-render per pointer event — the single most common
 * cause of jank when mixing DOM and Three.js scenes.
 */
export function useMousePosition(ref?: React.RefObject<HTMLElement>): React.MutableRefObject<Pointer> {
  const position = useRef<Pointer>({ x: 0, y: 0 });

  useEffect(() => {
    let frame = 0;

    const update = (event: PointerEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const target = ref?.current;
        if (target) {
          const rect = target.getBoundingClientRect();
          if (!rect.width || !rect.height) return;
          position.current = {
            x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
            y: -(((event.clientY - rect.top) / rect.height) * 2 - 1),
          };
        } else {
          position.current = {
            x: (event.clientX / window.innerWidth) * 2 - 1,
            y: -((event.clientY / window.innerHeight) * 2 - 1),
          };
        }
      });
    };

    window.addEventListener("pointermove", update, { passive: true });
    return () => {
      window.removeEventListener("pointermove", update);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ref]);

  return position;
}
