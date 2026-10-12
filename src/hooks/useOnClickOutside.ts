import { useEffect, type RefObject } from "react";

export function useOnClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  onOutside: (event: MouseEvent | TouchEvent) => void,
) {
  useEffect(() => {
    function handle(event: MouseEvent | TouchEvent) {
      const element = ref.current;
      if (!element || !(event.target instanceof Node) || element.contains(event.target)) return;
      onOutside(event);
    }

    document.addEventListener("mousedown", handle);
    document.addEventListener("touchstart", handle, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handle);
      document.removeEventListener("touchstart", handle);
    };
  }, [onOutside, ref]);
}
