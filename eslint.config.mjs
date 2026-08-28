import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // This project's own build/runtime output (see .gitignore):
    "dist/**",
    ".wrangler/**",
    ".vinext/**",
    ".sites-runtime/**",
    // Static assets, including vendored/minified third-party files:
    "public/**",
  ]),
]);

export default eslintConfig;
