import { GherkinException } from "@cucumber/gherkin/dist/src/Errors.js";
import Parser, { SyntaxNode } from "tree-sitter";
import { Errors } from "@cucumber/gherkin";
import { GherkinDocument } from "@cucumber/messages";

//#region src/cuke/cuke.d.ts
declare class Cuke {
  expression: string;
  line: number;
  column: number;
  constructor(expression: string, line: number, column: number);
  static fromSyntaxNode(node: SyntaxNode): Cuke;
  match(gherk: string): boolean;
}
//#endregion
//#region src/cuke/cuke_jar.d.ts
declare class CukeJar {
  private _fileMap;
  count(): number;
  all(): IteratorObject<[string, Cuke]>;
  ofFile(fileName: string): MapIterator<Cuke> | undefined;
  values(): IteratorObject<Cuke>;
  updateFile(fileName: string, items: Cuke[]): void;
  find(gherk: string): [string, Cuke] | undefined;
}
//#endregion
//#region src/cuke/cuke_parser.d.ts
declare class CukeParser {
  #private;
  /**
   * The Singleton's constructor should always be private to prevent direct
   * construction calls with the `new` operator.
   */
  private constructor();
  /**
   * The static getter that controls access to the singleton instance.
   *
   * This implementation allows you to extend the Singleton class while
   * keeping just one instance of each subclass around.
   */
  static get instance(): CukeParser;
  parse(src: string): Array<Cuke>;
  nodesToStepDefinition(match: Parser.QueryMatch): Cuke;
}
//#endregion
//#region src/common.d.ts
interface Location {
  line: number;
  column: number;
}
//#endregion
//#region src/gherk/gherk.d.ts
declare abstract class Gherk implements Location {
  /** The raw gherk, may include <> */
  text: string;
  /** Keyword used to this gherk */
  keyword: string;
  /** The line number (0-indexed) of the gherk */
  line: number;
  column: number;
  constructor(keyword: string, text: string, line: number, column: number);
  /** Get all expressions, resolving all <> */
  abstract getExpressions(): Generator<string>;
  get length(): number;
}
declare class MonoGherk extends Gherk {
  getExpressions(): Generator<string>;
}
declare class MultiGherk extends Gherk {
  expressions: string[];
  constructor(text: string, keyword: string, expressions: string[], line: number, column: number);
  getExpressions(): Generator<string>;
}
//#endregion
//#region src/gherk/gherk_jar.d.ts
declare class GherkJar {
  private _fileMap;
  count(): number;
  all(): IteratorObject<[string, number, Gherk]>;
  ofFile(fileName: string): Map<number, Gherk> | undefined;
  updateFile(fileName: string, items: Gherk[]): void;
  find(fileName: string, line: number): Gherk | undefined;
}
//#endregion
//#region src/gherk/gherk_parser.d.ts
type ParseResult = {
  gherkinDocument?: GherkinDocument;
  error?: Errors.GherkinException;
};
/**
 * Incrementally parses a Gherkin Document, allowing some syntax errors to occur.
 */
declare function parseGherkinDocument(gherkinSource: string): ParseResult;
declare function toGherks(doc: GherkinDocument): Array<Gherk>;
//#endregion
//#region src/linker.d.ts
declare class LinkSuccess {
  cuke: Cuke;
  gherk: Gherk;
  fileName: string;
  constructor(cuke: Cuke, gherk: Gherk, fileName: string);
}
declare class LinkFailure {
  gherk: Gherk;
  expression: string;
  constructor(gherk: Gherk, expression: string);
}
type LinkResult = LinkSuccess | LinkFailure;
declare function linkAll(cukeJar: CukeJar, gherks: Gherk[]): LinkResult[];
//#endregion
export { Cuke, CukeJar, CukeParser, Gherk, GherkJar, GherkinException, LinkFailure, LinkResult, LinkSuccess, MonoGherk, MultiGherk, ParseResult, linkAll, parseGherkinDocument, toGherks };
//# sourceMappingURL=index.d.mts.map