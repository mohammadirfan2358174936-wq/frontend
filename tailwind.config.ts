/**
 * EVENTORA — TAILWIND DESIGN SYSTEM
 * =================================
 * Dark-first glassmorphism design tokens.
 *
 * The palette is deliberately narrow: a deep-navy surface scale (`eventora`),
 * an indigo accent (`brand`) and five named glow accents. Narrow palettes are
 * what keep a "premium" UI from looking like a random colour soup.
 *
 * Typography is two faces (Sora display / Inter text) + mono for numbers.
 */
import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  future: { hoverOnlyWhenSupported: true },
  theme: {
    extend: {
      /* ---------------------------------------------------------------- colours */
      colors: {
        // Deep-navy surface ramp (darkest → lightest)
        eventora: {
          950: "#05060f",
          900: "#0a0c1b",
          850: "#0f1226",
          800: "#151935",
          700: "#1e2340",
          600: "#2a3055",
          500: "#3a4170",
        },
        // Primary accent — indigo
        brand: {
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
        },
        // Named glow accents — used sparingly for semantic emphasis
        "violet-glow": "#8b5cf6",
        "fuchsia-glow": "#d946ef",
        "pink-glow": "#ec4899",
        "cyan-glow": "#22d3ee",
        "blue-glow": "#3b82f6",
        "emerald-glow": "#34d399",
        "amber-glow": "#fbbf24",
        "rose-glow": "#fb7185",
      },

      /* -------------------------------------------------------------- typography */
      fontFamily: {
        display: ['Sora', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        // Fluid display sizes — avoids media-query boilerplate everywhere
        'display-sm': ["clamp(1.75rem, 4vw, 2.5rem)", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        'display-md': ["clamp(2.25rem, 6vw, 4rem)", { lineHeight: "1.05", letterSpacing: "-0.03em" }],
        'display-lg': ["clamp(2.75rem, 9vw, 6.5rem)", { lineHeight: "0.98", letterSpacing: "-0.04em" }],
      },

      /* -------------------------------------------------------------- background */
      backgroundImage: {
        'gradient-brand': "linear-gradient(135deg, #4f46e5 0%, #8b5cf6 50%, #d946ef 100%)",
        'gradient-cool': "linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)",
        'gradient-aurora':
          "radial-gradient(120% 80% at 12% 0%, rgba(99,102,241,0.22) 0%, transparent 55%), " +
          "radial-gradient(110% 70% at 88% 8%, rgba(217,70,239,0.18) 0%, transparent 58%), " +
          "radial-gradient(90% 60% at 50% 100%, rgba(34,211,238,0.12) 0%, transparent 60%)",
        'gradient-glass': "linear-gradient(160deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 45%, transparent 100%)",
      },

      /* ------------------------------------------------------------------ effects */
      boxShadow: {
        'glow-indigo': "0 0 0 1px rgba(99,102,241,0.25), 0 8px 32px -8px rgba(99,102,241,0.45)",
        'glow-fuchsia': "0 0 0 1px rgba(217,70,239,0.25), 0 8px 32px -8px rgba(217,70,239,0.45)",
        'glow-cyan': "0 0 0 1px rgba(34,211,238,0.25), 0 8px 32px -8px rgba(34,211,238,0.45)",
        'glass': "0 1px 0 0 rgba(255,255,255,0.05) inset, 0 24px 48px -24px rgba(0,0,0,0.7)",
        'glass-lg': "0 1px 0 0 rgba(255,255,255,0.06) inset, 0 40px 80px -32px rgba(0,0,0,0.85)",
      },

      /* --------------------------------------------------------------- animation */
      animation: {
        'spin-slow': "spin 14s linear infinite",
        'pulse-glow': "pulseGlow 3.6s ease-in-out infinite",
        'float': "float 7s ease-in-out infinite",
        'drift': "drift 11s ease-in-out infinite",
        'sheen': "sheen 3.5s ease-in-out infinite",
        'grain': "grain 8s steps(10) infinite",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "0.45", transform: "scale(1)" },
          "50%": { opacity: "0.85", transform: "scale(1.08)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        drift: {
          "0%, 100%": { transform: "translate3d(0,0,0) rotate(0deg)" },
          "33%": { transform: "translate3d(10px,-14px,0) rotate(2deg)" },
          "66%": { transform: "translate3d(-8px,8px,0) rotate(-1.5deg)" },
        },
        sheen: {
          "0%": { transform: "translateX(-120%)" },
          "55%, 100%": { transform: "translateX(120%)" },
        },
        grain: {
          "0%, 100%": { transform: "translate(0,0)" },
          "10%": { transform: "translate(-5%,-8%)" },
          "20%": { transform: "translate(-12%,4%)" },
          "30%": { transform: "translate(6%,-14%)" },
          "40%": { transform: "translate(-4%,14%)" },
          "50%": { transform: "translate(-12%,8%)" },
          "60%": { transform: "translate(12%,0%)" },
          "70%": { transform: "translate(0%,12%)" },
          "80%": { transform: "translate(3%,18%)" },
          "90%": { transform: "translate(-8%,10%)" },
        },
      },

      /* -------------------------------------------------------------- transitions */
      transitionTimingFunction: {
        premium: "cubic-bezier(0.22, 1, 0.36, 1)",
        'in-out-premium': "cubic-bezier(0.65, 0, 0.35, 1)",
      },

      /* ---------------------------------------------------------------- spacing */
      spacing: { nav: "5.5rem", 'safe-b': 'env(safe-area-inset-bottom)' },
      maxWidth: { '8xl': '88rem', '9xl': '100rem' },
      screens: { xs: "420px", '3xl': "1800px" },
    },
  },
  plugins: [
    // Small local plugin for a few semantic utilities that have no utility
    // shorthand in Tailwind. Keeping them here avoids ad-hoc CSS sprawl.
    function plugin({ addUtilities, addVariant }) {
      addUtilities({
        ".text-balance": { textWrap: "balance" },
        ".text-pretty": { textWrap: "pretty" },
        ".grid-smooth": { WebkitFontSmoothing: "antialiased", textRendering: "optimizeLegibility" },
      });
      // `motion-safe:` / `motion-reduce:` are built-in; add a JS-controlled
      // variant so we can hard-disable effects for heavy 3D on low-end devices.
      addVariant("reduced", ".reduced-motion &");
    },
  ],
} satisfies Config;
