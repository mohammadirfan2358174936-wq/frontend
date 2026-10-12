/**
 * EVENTORA FRONTEND CONFIG
 * ------------------------
 * Vite 5 + React 18 + TypeScript + Tailwind + React Three Fiber.
 *
 * Key performance decisions:
 *  - Manual vendor chunking so three.js never blocks first paint of
 *    non-3D routes.
 *  - The /api dev proxy mirrors a production reverse proxy, so CORS and
 *    cookie/JWT handling behave identically in dev and prod.
 *  - `assetsInlineLimit` is raised to keep small glass textures inlined.
 */
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    target: "es2022",
    cssCodeSplit: true,
    assetsInlineLimit: 8192,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime — cached independently of the 3D library.
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          // Animation runtime.
          "motion-vendor": ["framer-motion"],
          // Three.js is heavy (~600KB gz). Only 3D routes pull this chunk,
          // which is the whole point of splitting it out.
          "three-vendor": ["three", "@react-three/fiber", "@react-three/drei"],
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: process.env.VITE_API_PROXY ?? "http://localhost:8080",
        changeOrigin: true,
      },
      "/actuator": {
        target: process.env.VITE_API_PROXY ?? "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    passWithNoTests: true,
  },
});
