import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    "rules": {
    "eqeqeq": 1,
    "react/prop-types": 1,
    "react/react-in-jsx-scope": 0,
    "react-hooks/rules-of-hooks": "warn",
    "react-hooks/exhaustive-deps": "warn",
    "no-console": ["warn", { "allow": ["error", "warn"] }],
    "no-debugger": "warn",
    "require-await": "error",
    "no-undef": "error",
    "no-param-reassign": "error",
    "prefer-const": "error",
    "no-duplicate-imports": "error",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        "args": "after-used",
        "ignoreRestSiblings": true
      }
    ],
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-empty-function": "warn"
    },
  }
];

export default eslintConfig;
