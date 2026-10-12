import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge conditional class names and let later Tailwind utilities win over
 * earlier ones. Every component in the design system routes classes through
 * here so consumer `className` overrides always apply.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
