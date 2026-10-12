import type { Transition, Variants } from "framer-motion";

/**
 * EVENTORA — MOTION SYSTEM
 * =========================
 * All reusable Framer Motion variants live here as plain data.
 *
 * Rules that keep the motion feeling "premium" instead of "busy":
 *  1. Spring physics over duration+easing for anything that moves under the
 *     pointer, cropping/easing curves for cinematic reveals.
 *  2. Distance is capped (16–32px). Big slides read as cheap, not expensive.
 *  3. Blur is only ever animated on entrance, never on exit (it is the most
 *     expensive property to layer in a grid).
 *  4. Every variant has a reduced-motion equivalent in `calm`.
 */

export const spring: Record<"smooth" | "snappy" | "cinematic" | "elastic", Transition> = {
  smooth: { type: "spring", stiffness: 220, damping: 26, mass: 0.9 },
  snappy: { type: "spring", stiffness: 420, damping: 30, mass: 0.7 },
  cinematic: { type: "spring", stiffness: 90, damping: 20, mass: 1.1 },
  elastic: { type: "spring", stiffness: 320, damping: 12, mass: 0.8 },
};

export const ease = {
  out: [0.22, 1, 0.36, 1] as [number, number, number, number],
  inOut: [0.65, 0, 0.35, 1] as [number, number, number, number],
};

export const timed: Record<"fast" | "base" | "slow" | "cinematic", Transition> = {
  fast: { duration: 0.18, ease: ease.out },
  base: { duration: 0.32, ease: ease.out },
  slow: { duration: 0.5, ease: ease.out },
  cinematic: { duration: 0.8, ease: ease.out },
};

/* ------------------------------------------------------------------ reveals */

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: timed.base },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { ...spring.smooth, opacity: { duration: 0.4 } } },
};

export const fadeDown: Variants = {
  hidden: { opacity: 0, y: -20, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: spring.smooth },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  show: { opacity: 1, scale: 1, transition: spring.smooth },
};

export const blurIn: Variants = {
  hidden: { opacity: 0, filter: "blur(14px)", scale: 1.02 },
  show: { opacity: 1, filter: "blur(0px)", scale: 1, transition: timed.slow },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 32 },
  show: { opacity: 1, x: 0, transition: spring.smooth },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -32 },
  show: { opacity: 1, x: 0, transition: spring.smooth },
};

/** Word-by-word cinematic headline reveal. */
export const wordRise: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.05 } },
};

export const wordRiseChild: Variants = {
  hidden: { opacity: 0, y: "0.5em", rotateX: -55 },
  show: { opacity: 1, y: "0em", rotateX: 0, transition: { duration: 0.7, ease: ease.out } },
};

/* ------------------------------------------------------------------- groups */

export const staggerContainer = (stagger = 0.08, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

export const staggerFast: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045 } },
};

export const staggerSlow: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.1 } },
};

/* --------------------------------------------------------------- pages/off */
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 12, filter: "blur(8px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.42, ease: ease.out } },
  exit: { opacity: 0, y: -8, filter: "blur(6px)", transition: { duration: 0.22, ease: ease.inOut } },
};

export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: timed.fast },
  exit: { opacity: 0, transition: timed.fast },
};

export const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 18 },
  show: { opacity: 1, scale: 1, y: 0, transition: spring.snappy },
  exit: { opacity: 0, scale: 0.97, y: 10, transition: timed.fast },
};

export const drawerVariants: Variants = {
  hidden: { x: "100%", opacity: 0.6 },
  show: { x: 0, opacity: 1, transition: spring.smooth },
  exit: { x: "100%", opacity: 0.6, transition: { duration: 0.24, ease: ease.inOut } },
};

export const toastVariants: Variants = {
  hidden: { opacity: 0, x: 44, scale: 0.94 },
  show: { opacity: 1, x: 0, scale: 1, transition: spring.snappy },
  exit: { opacity: 0, x: 44, scale: 0.96, transition: timed.fast },
};

export const dropdownVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: -6 },
  show: { opacity: 1, scale: 1, y: 0, transition: timed.fast },
  exit: { opacity: 0, scale: 0.97, y: -4, transition: { duration: 0.12 } },
};

/* --------------------------------------------------------------- components */

/** 3D card hover — the signature event-card tilt. */
export const cardTilt: Variants = {
  rest: { rotateX: 0, rotateY: 0, scale: 1, transition: spring.smooth },
  hover: { scale: 1.02, transition: spring.snappy },
};

export const flipCard: Variants = {
  front: { rotateY: 0, transition: spring.smooth },
  back: { rotateY: 180, transition: spring.smooth },
};

/** Ticket stub perforation. */
export const ticketStub: Variants = {
  rest: { pathLength: 0, opacity: 0 },
  hover: { pathLength: 1, opacity: 1, transition: { duration: 0.5, ease: ease.out } },
};

/** Chart draw-in. */
export const drawPath: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  show: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 1.1, ease: ease.out },
  },
};

export const growBar: Variants = {
  hidden: { scaleY: 0, originY: 0, opacity: 0.4 },
  show: { scaleY: 1, opacity: 1, transition: { ...spring.smooth, delay: 0.1 } },
};

export const growWidth: Variants = {
  hidden: { scaleX: 0, originX: 0 },
  show: { scaleX: 1, transition: { duration: 0.85, ease: ease.out } },
};

export const countUpReveal: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: spring.smooth },
};

/* -------------------------------------------------------- micro-interactions */

export const pulseGlow: Variants = {
  rest: { boxShadow: "0 0 0 0 rgba(99,102,241,0)" },
  hover: { boxShadow: "0 0 0 6px rgba(99,102,241,0.10)" },
};

export const iconPop: Variants = {
  rest: { scale: 1, rotate: 0 },
  hover: { scale: 1.12, rotate: -6, transition: spring.snappy },
  tap: { scale: 0.92 },
};

export const navUnderline: Variants = {
  rest: { opacity: 0, scaleX: 0 },
  hover: { opacity: 1, scaleX: 1, transition: timed.fast },
};

/** Success burst — registration confirmation. */
export const successBurst: Variants = {
  hidden: { scale: 0.4, opacity: 0, rotate: -25 },
  show: {
    scale: 1,
    opacity: 1,
    rotate: 0,
    transition: { type: "spring", stiffness: 260, damping: 14, delay: 0.08 },
  },
};

export const checkDraw: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  show: { pathLength: 1, opacity: 1, transition: { duration: 0.5, delay: 0.28, ease: ease.out } },
};

export const confettiBurst: Variants = {
  hidden: { opacity: 0, y: 0, scale: 0 },
  show: (i: number) => ({
    opacity: [0, 1, 1, 0],
    scale: [0, 1, 1, 0.4],
    y: [0, -60 - (i % 5) * 22, 120 + (i % 4) * 30],
    x: [0, (i % 2 ? 1 : -1) * (30 + (i % 6) * 14), (i % 2 ? 1 : -1) * (66 + (i % 5) * 20)],
    rotate: [0, i % 2 ? 140 : -140, i % 2 ? 300 : -300],
    transition: { duration: 1.5 + (i % 4) * 0.22, ease: ease.out, times: [0, 0.18, 0.7, 1] },
  }),
};

/* --------------------------------------------------- reduced-motion fallback */

/**
 * Drop-in replacement set. When `reduced` is true, components swap to these so
 * nothing animates, nothing blurs, nothing translates — content still appears.
 */
export const calm: Record<string, Variants> = {
  fadeIn: { hidden: { opacity: 1 }, show: { opacity: 1, transition: { duration: 0 } } },
  fadeUp: { hidden: { opacity: 1 }, show: { opacity: 1, transition: { duration: 0 } } },
  fadeDown: { hidden: { opacity: 1 }, show: { opacity: 1, transition: { duration: 0 } } },
  scaleIn: { hidden: { opacity: 1, scale: 1 }, show: { opacity: 1, scale: 1, transition: { duration: 0 } } },
  blurIn: { hidden: { opacity: 1 }, show: { opacity: 1, transition: { duration: 0 } } },
  slideInRight: { hidden: { opacity: 1, x: 0 }, show: { opacity: 1, x: 0, transition: { duration: 0 } } },
  slideInLeft: { hidden: { opacity: 1, x: 0 }, show: { opacity: 1, x: 0, transition: { duration: 0 } } },
  pageTransition: {
    initial: { opacity: 1 },
    animate: { opacity: 1, transition: { duration: 0 } },
    exit: { opacity: 1, transition: { duration: 0 } },
  },
  staggerContainer: { hidden: {}, show: { transition: { staggerChildren: 0, delayChildren: 0 } } },
  wordRise: { hidden: {}, show: { transition: { staggerChildren: 0 } } },
  wordRiseChild: { hidden: { opacity: 1, y: "0em" }, show: { opacity: 1, y: "0em", transition: { duration: 0 } } },
  confettiBurst: { hidden: {}, show: { transition: { duration: 0 } } },
};

/** Helper: pick the lively or calm variant set from a single boolean. */
export function variantsOf<T>(key: keyof typeof calm, reduced: boolean, lively: T): T {
  return reduced ? (calm[key] as unknown as T) : lively;
}
