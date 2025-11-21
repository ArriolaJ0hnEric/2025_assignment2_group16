const ftFlow = require('eslint-plugin-ft-flow');

module.exports = {
  root: true,
  parser: "@babel/eslint-parser",
  parserOptions: {
    requireConfigFile: false,
    babelOptions: {
      presets: ["@babel/preset-flow"]
    },
    sourceType: "unambiguous", // allows CommonJS & ESM
    ecmaVersion: "latest"
  },
  env: {
    node: true,
    es2021: true
  },
  plugins: ["ft-flow"],
  extends: [
    "eslint:recommended",
    "plugin:ft-flow/recommended"
  ],
  rules: {
    ...ftFlow.configs.recommended.rules,
    "eqeqeq": "error",
    "no-trailing-spaces": "error",
    "object-curly-spacing": ["error", "always"],
    "arrow-spacing": ["error", { before: true, after: true }],
    "no-console": "off"
  },
  ignorePatterns: [
    "node_modules/",
    "dist/",
    "build/",
    "flow-typed/",
    ".eslintrc.cjs"
  ]
};