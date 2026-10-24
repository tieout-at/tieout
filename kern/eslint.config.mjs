import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // Amounts are integer cents: a float literal in the core is almost always a mistake.
      "no-restricted-syntax": ["error", { selector: "Literal[raw=/^[0-9]+[.][0-9]+$/]", message: "No decimal numbers in kern/: amounts are cents, rates basis points, quantities hundredths." }],
    },
  },
  globalIgnores(["node_modules/**"]),
]);
