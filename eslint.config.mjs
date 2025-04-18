import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

// Import plugins (ESM-compatible)
import eslintPluginReact from "eslint-plugin-react";
import eslintPluginReactHooks from "eslint-plugin-react-hooks";
import eslintPluginTs from "@typescript-eslint/eslint-plugin";
import eslintPluginUnusedImports from "eslint-plugin-unused-imports";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// FlatCompat bridges old-style config (`extends: []`) into FlatConfig
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // 🔥 Ignored folders (FlatConfig doesn't read `.eslintignore`)
  {
    ignores: [
      "**/.next/**",           // Next.js build output
      "**/node_modules/**",    // Third-party packages
      "**/dist/**",            // Custom build folder (if any)
      "**/out/**",             // Static export output
      "**/coverage/**",        // Code coverage reports
      "**/public/**"           // Static assets (images/fonts)
    ]
  },

  // ✅ Base config from Next.js & TypeScript
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  {
    plugins: {
      "react": eslintPluginReact,
      "react-hooks": eslintPluginReactHooks,
      "@typescript-eslint": eslintPluginTs,
      "unused-imports": eslintPluginUnusedImports
    },

    rules: {
      // ✅ Style
      "eqeqeq": 1, // Warn on `==`, enforce `===`
      "prefer-const": "error", // Use `const` if not reassigned
      "no-duplicate-imports": "error", // No duplicate `import` statements

      // ⚠️ Debugging
      "no-console": ["warn", { allow: ["warn", "error"] }], // Allow only warn/error
      "no-debugger": "warn", // Warn on `debugger`

      // 🚫 Safety
      "no-undef": "error", // Disallow undefined variables
      "no-param-reassign": "error", // Don’t mutate function parameters
      "require-await": "error", // Async function must have `await`
      "no-unused-private-class-members": "warn", // Warn on unused `private` methods
      "no-useless-constructor": "warn", // Warn on empty constructors
      "no-empty": ["warn", { allowEmptyCatch: true }], // Allow empty `catch`, warn on others

      // 🧠 React
      "react/prop-types": 1, // Warn if propTypes missing (harmless in TS)
      "react/react-in-jsx-scope": 0, // Not needed in React 17+
      "react-hooks/rules-of-hooks": "warn", // Enforce rules of hooks
      "react-hooks/exhaustive-deps": "warn", // Check `useEffect` dependencies

      // 🧠 TypeScript
      "@typescript-eslint/no-explicit-any": "warn", // Discourage use of `any`
      "@typescript-eslint/no-empty-function": "warn", // Warn on empty functions

      // 🧹 Clean Code (unused-imports replaces no-unused-vars)
      "unused-imports/no-unused-imports": "warn", // Warn + auto-remove unused imports
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_", // Allow unused vars like `_x`
          args: "after-used",
          argsIgnorePattern: "^_"
        }
      ],
      "@typescript-eslint/no-unused-vars": "off" // Disabled in favor of `unused-imports`
    }
  }
];

export default eslintConfig;