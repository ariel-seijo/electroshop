import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import importPlugin from "eslint-plugin-import";

const eslintConfig = defineConfig([
  ...nextVitals,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),

  // ============================================================
  // ARCHITECTURE BOUNDARIES — Feature-Based + Clean Architecture
  // ============================================================

  {
    plugins: { import: importPlugin },
    rules: {
      // ── Layer 1: app/ must NOT import feature internals ──
      "import/no-restricted-paths": ["error", {
        zones: [
          {
            target: "./src/app",
            from: "./src/features/**",
            except: [
              "**/index.{js,ts,tsx}",
              "**/styles/**",
            ],
            message:
              "app/ must import features through their public barrel (index). " +
              "Use e.g. @/features/cart instead of @/features/cart/useCart.",
          },

          // ── Layer 2: UI atoms must stay domain-agnostic ──
          {
            target: "./src/components/ui",
            from: "./src/features",
            message:
              "Global UI atoms (components/ui/) must be domain-agnostic. " +
              "They cannot import from features/.",
          },

          // ── Layer 3: Features must NOT depend on app/ ──
          {
            target: "./src/features",
            from: "./src/app",
            except: [
              "./layout.js",
              "./layout.jsx",
              "./globals.css",
            ],
            message:
              "Features must NOT import from app/. " +
              "Features should be framework-agnostic.",
          },
        ],
      }],
    },
  },
]);

export default eslintConfig;
