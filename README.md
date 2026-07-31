# picklj-service

A TypeScript library that parses Clojure step definitions and Gherkin feature files, then links them together. It is the core engine for the [picklj](https://github.com/george-gayton/picklj) language server.

## Overview

The library operates on two domains:

- **Cuke** — Clojure step definitions (`.clj` files). Uses a [tree-sitter](https://tree-sitter.github.io/tree-sitter/) Clojure grammar to extract `Given`/`When`/`Then`/`And`/`But` step definitions, supporting both string literals and regex literals.
- **Gherk** — Gherkin feature files (`.feature` files). Uses `@cucumber/gherkin` to extract steps from `Scenario` and `Scenario Outline` blocks.

A **linker** then matches each Gherkin step to its corresponding Clojure step definition, returning typed `LinkSuccess` or `LinkFailure` results.

## Installation

```bash
npm install picklj-service
```

## Usage

### Parsing step definitions

```ts
import { CukeParser, CukeJar } from "picklj-service";

const jar = new CukeJar();

// Parse a Clojure source file and store the results
const cukes = CukeParser.instance.parse(clojureSource);
jar.updateFile("steps.clj", cukes);
```

### Parsing feature files

```ts
import { parseGherkinDocument, toGherks, GherkJar } from "picklj-service";

const jar = new GherkJar();

// Parse a Gherkin feature file and store the results
const { gherkinDocument, error } = parseGherkinDocument(featureSource);
if (gherkinDocument) {
  const gherks = toGherks(gherkinDocument);
  jar.updateFile("my.feature", gherks);
}
```

### Linking steps to definitions

```ts
import { linkAll, LinkSuccess, LinkFailure } from "picklj-service";

const results = linkAll(cukeJar, gherks);

for (const result of results) {
  if (result instanceof LinkSuccess) {
    console.log(`Matched: "${result.gherk.text}" -> ${result.fileName}:${result.cuke.line}`);
  } else {
    console.warn(`No match found for: "${result.expression}"`);
  }
}
```

## API

### Cuke

| Export | Description |
|---|---|
| `Cuke` | Represents a single step definition. Converts Gherkin parameter syntax (`{int}`, `{double}`, `{string}`) to regex. |
| `CukeParser` | Singleton parser. Use `CukeParser.instance.parse(src)` to extract `Cuke[]` from a Clojure source string. |
| `CukeJar` | Registry of `Cuke` objects indexed by file name. Supports `updateFile`, `find`, `ofFile`, `all`, and `values`. |

### Gherk

| Export | Description |
|---|---|
| `Gherk` | Abstract base class for a Gherkin step. Exposes `text`, `keyword`, `line`, and `column`. |
| `MonoGherk` | A step from a regular `Scenario`. Yields a single expression. |
| `MultiGherk` | A step from a `Scenario Outline`. Yields one expression per example row. |
| `GherkJar` | Registry of `Gherk` objects indexed by file name and line number. Supports `updateFile`, `find`, `ofFile`, and `all`. |
| `parseGherkinDocument(src)` | Parses a Gherkin source string. Returns `{ gherkinDocument?, error? }`. Tolerates some syntax errors. |
| `toGherks(doc)` | Converts a `GherkinDocument` into a flat `Gherk[]`. |
| `GherkinException` | Re-exported from `@cucumber/gherkin`. |

### Linker

| Export | Description |
|---|---|
| `linkAll(cukeJar, gherks)` | Matches every `Gherk` against the `CukeJar`. Returns `LinkResult[]`. |
| `LinkSuccess` | Result when a match is found. Contains `cuke`, `gherk`, and `fileName`. |
| `LinkFailure` | Result when no match is found. Contains `gherk` and the unmatched `expression`. |

## Development

```bash
# Build
npm run build

# Test
npm test

# Lint
npm run lint
npm run lint:fix

# Clean build
npm run build:clean
```

## License

MIT


