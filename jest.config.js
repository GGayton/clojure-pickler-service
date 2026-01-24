const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  transformIgnorePatterns: [
    "node_modules/(?!(tree-sitter|tree-sitter-clojure-orchard)/)"
  ],
  modulePathIgnorePatterns: [
    "tree-sitter",
    "tree-sitter-clojure-orchard" // and any other languages you use
  ],
};