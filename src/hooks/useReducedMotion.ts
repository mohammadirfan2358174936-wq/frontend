import { useEffect, useState } from "react";

/**
 * THE reduce-motion signal.
 *
 * Every animated component in the app reads this single hook so the
 * accessibility preference is enforced in exactly one place. The OS setting is
 * OR'd with an app-level override so the footer toggle and low-end-device
 * detection can both force calmer output without touching each component.
 */
const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

function readSetting(): boolean {
  if (typeof window === "undefined") return false;
  const osPref = window.matchMedia?.(REDUCED_QUERY).matches ?? false;
  const override = document.documentElement.classList.contains("reduced-motion");
  const stored = localStorage.getItem("eventora-reduced-motion");
  return osPref || override || stored === "true";
}

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(readSetting);

  useEffect(() => {
    const list = window.matchMedia?.(REDUCED_QUERY);

    const onChange = () => setReduced(readSetting());
    list?.addEventListener("change", onChange);

    // A MutationObserver picks up the app-level `.reduced-motion` toggle.
    const observer = new MutationObserver(onChange);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    onChange();
    return () => {
      list?.removeEventListener("change", onChange);
      observer.disconnect();
    };
  }, []);

  // Reflect the state on <html> so CSS-only animations also calm down.
  useEffect(() => {
    document.documentElement.classList.toggle("reduced-motion", reduced);
  }, [reduced]);

  return reduced;
}

/** Explicitly set the app-level override and persist it. */
export function setReducedMotion(value: boolean): void {
  document.documentElement.classList.toggle("reduced-motion", value);
  try {
    localStorage.setItem("eventora-reduced-motion", String(value));
  } catch {
    /* private mode — the class flag is enough */
  }
  window.dispatchEvent(new CustomEvent("eventora:reduced-motion", { detail: value }));
}
