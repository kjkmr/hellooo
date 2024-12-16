module.exports = {
  env: {
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "next/core-web-vitals",
    "prettier",
  ],
  plugins: ["@typescript-eslint", "eslint-comments"],
  rules: {
    "import/order": ["warn", { alphabetize: { order: "asc" } }],
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["./*", "!./**/page"],
            message: "Please use absolute path. `@/...`",
          },
        ],
      },
    ],
    "@next/next/no-img-element": ["off"],
    "react/jsx-equals-spacing": ["warn", "never"],
    "no-duplicate-imports": "warn",
    "react/jsx-fragments": "warn",
    "react/self-closing-comp": ["warn", { component: true, html: true }],
    "react-hooks/exhaustive-deps": "error",
    "react/jsx-newline": ["warn", { prevent: true, allowMultilines: false }],
    "@typescript-eslint/restrict-template-expressions": ["warn"],
    "@typescript-eslint/no-unused-vars": ["error"],
    "eslint-comments/require-description": "error",
  },
  overrides: [
    {
      files: ["**/*.js"],
      rules: {
        "@typescript-eslint/no-var-requires": "off",
      },
    },
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
  },
};
