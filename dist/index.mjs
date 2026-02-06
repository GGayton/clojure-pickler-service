import Parser, { Query } from "tree-sitter";
import language from "tree-sitter-clojure-orchard";
import { AstBuilder, GherkinClassicTokenMatcher, Parser as Parser$1 } from "@cucumber/gherkin";
import { IdGenerator } from "@cucumber/messages";

//#region src/cuke/cuke.ts
function replaceGherkinSyntax(substring) {
	switch (substring) {
		case "{int}": return "(\\d*?)";
		case "{double}": return "(\\d*?)";
		default: return "(.*)";
	}
}
const gherkinSyntaxRegex = /{.*?}/g;
var Cuke = class Cuke {
	expression;
	line;
	column;
	constructor(expression, line, column) {
		this.expression = expression.replaceAll(gherkinSyntaxRegex, replaceGherkinSyntax);
		this.line = line;
		this.column = column;
	}
	static fromSyntaxNode(node) {
		switch (node.type) {
			case "str_lit": return new Cuke(node.text.slice(1, -1), node.startPosition.row, node.startPosition.column);
			case "regex_lit": return new Cuke(node.text.slice(2, -1), node.startPosition.row, node.startPosition.column);
			default: throw "undefined node type";
		}
	}
	match(gherk) {
		return new RegExp(this.expression).test(gherk);
	}
};

//#endregion
//#region src/cuke/cuke_jar.ts
var CukeJar = class {
	_fileMap = /* @__PURE__ */ new Map();
	count() {
		return this._fileMap.values().map((x) => x.length).reduce((a, b) => a + b);
	}
	all() {
		return this._fileMap.entries().flatMap(([fileName, items]) => items.map((item) => [fileName, item]));
	}
	ofFile(fileName) {
		return this._fileMap.get(fileName)?.values();
	}
	values() {
		return this._fileMap.values().flatMap((value) => value);
	}
	updateFile(fileName, items) {
		this._fileMap.set(fileName, items);
	}
	find(gherk) {
		return this.all().find(([, cuke]) => cuke.match(gherk));
	}
};

//#endregion
//#region src/cuke/cuke_parser.ts
const stringLiteralQuerySource = `(list_lit
    value: (sym_lit
	    name: (sym_name) @operator-name 
        	(#any-of? @operator-name Given When Then And But))
    value: (str_lit) @expression
    value: (vec_lit)
)`;
const regexLiteralQuerySource = `(list_lit
    value: (sym_lit
	    name: (sym_name) @operator-name 
        	(#any-of? @operator-name Given When Then And But))
    value: (regex_lit) @expression
    value: (vec_lit)
)`;
const stringLiteralQuery = new Query(language, stringLiteralQuerySource);
const regexLiteralQuery = new Query(language, regexLiteralQuerySource);
const parser = new Parser();
parser.setLanguage(language);
var CukeParser = class CukeParser {
	static #instance;
	/**
	* The Singleton's constructor should always be private to prevent direct
	* construction calls with the `new` operator.
	*/
	constructor() {}
	/**
	* The static getter that controls access to the singleton instance.
	*
	* This implementation allows you to extend the Singleton class while
	* keeping just one instance of each subclass around.
	*/
	static get instance() {
		if (!CukeParser.#instance) CukeParser.#instance = new CukeParser();
		return CukeParser.#instance;
	}
	parse(src) {
		const tree = parser.parse(src);
		if (!tree.rootNode) throw new Error("ruh roh");
		if (!stringLiteralQuery) throw new Error("Query is missing");
		if (typeof stringLiteralQuery.matches !== "function") throw new Error("matches is not a function");
		const stringLiteralMatches = stringLiteralQuery.matches(tree.rootNode);
		const regexLiteralMatches = regexLiteralQuery.matches(tree.rootNode);
		return stringLiteralMatches.concat(regexLiteralMatches).map(this.nodesToStepDefinition);
	}
	nodesToStepDefinition(match) {
		const capture = match.captures.find((capture) => capture.name === "expression");
		if (capture === void 0) throw new Error("tree-sitter node does not have an 'expression' group on it");
		return Cuke.fromSyntaxNode(capture.node);
	}
};

//#endregion
//#region src/gherk/gherk.ts
var MonoGherk = class {
	expression;
	line;
	column;
	constructor(expression, line, column) {
		this.expression = expression;
		this.line = line;
		this.column = column;
	}
	*getExpressions() {
		yield this.expression;
	}
};
var MultiGherk = class {
	expressions;
	line;
	column;
	constructor(expressions, line, column) {
		this.expressions = expressions;
		this.line = line;
		this.column = column;
	}
	*getExpressions() {
		yield* this.expressions;
	}
};

//#endregion
//#region src/gherk/gherk_jar.ts
var GherkJar = class {
	_fileMap = /* @__PURE__ */ new Map();
	count() {
		return this._fileMap.values().map((maps) => maps.size).reduce((a, b) => a + b);
	}
	all() {
		return this._fileMap.values().flatMap((map) => map.values());
	}
	ofFile(fileName) {
		return this._fileMap.get(fileName);
	}
	updateFile(fileName, items) {
		const gherkMap = new Map(items.map((gherk) => [gherk.line, gherk]));
		this._fileMap.set(fileName, gherkMap);
	}
	find(fileName, line) {
		return this._fileMap.get(fileName)?.get(line);
	}
};

//#endregion
//#region src/gherk/gherk_parser.ts
const uuidFn = IdGenerator.uuid();
/**
* Incrementally parses a Gherkin Document, allowing some syntax errors to occur.
*/
function parseGherkinDocument(gherkinSource) {
	return { gherkinDocument: new Parser$1(new AstBuilder(uuidFn), new GherkinClassicTokenMatcher()).parse(gherkinSource) };
}
const headerRegex = /(?<=<).*?(?=>)/g;
function toGherks(doc) {
	if (!doc?.feature?.children) return [];
	return doc.feature.children.map((value) => value.scenario).filter((scenario) => scenario !== void 0).flatMap((scenario) => {
		const adjustedSteps = scenario.steps.map((step) => ({
			...step,
			location: {
				...step.location,
				line: step.location.line - 1
			}
		}));
		if (scenario.keyword === "Scenario Outline") return adjustedSteps.map((step) => toGherk(step, scenario.examples));
		else if (scenario.keyword === "Scenario") return adjustedSteps.map((step) => toMonoGherk(step));
		else return;
	}).filter((value) => value !== void 0);
}
function toMonoGherk(step) {
	return new MonoGherk(step.text, step.location.line, step.location.column ?? 0);
}
function toGherk(step, tables) {
	if (tables.some((table) => table.tableHeader === void 0)) return void 0;
	if (tables.length === 0) return toMonoGherk(step);
	const regexMatches = step.text.matchAll(headerRegex).toArray();
	if (regexMatches.length === 0) return toMonoGherk(step);
	const matches = tables.map((table) => regexMatches.flatMap((value) => value.map((match) => [
		match,
		table,
		table.tableHeader.cells.findIndex((value) => value.value === match)
	])));
	if (matches.some((matches) => matches.some((value) => value[2] === -1))) return void 0;
	return new MultiGherk(tables.flatMap((table, tableIndex) => table.tableBody.map((value) => matches.at(tableIndex).reduce((expression, [match, , index]) => expression.replace(`<${match}>`, value.cells[index]?.value ?? "<??>"), step.text))), step.location.line, step.location.column ?? 0);
}

//#endregion
//#region src/linker.ts
var LinkSuccess = class {
	cuke;
	gherk;
	fileName;
	constructor(cuke, gherk, fileName) {
		this.cuke = cuke;
		this.gherk = gherk;
		this.fileName = fileName;
	}
};
var LinkFailure = class {
	gherk;
	expression;
	constructor(gherk, expression) {
		this.gherk = gherk;
		this.expression = expression;
	}
};
function linkAll(cukeJar, gherks) {
	return gherks.flatMap((gherk) => gherk.getExpressions().map((expr) => {
		const result = cukeJar.find(expr);
		if (result === void 0) return new LinkFailure(gherk, expr);
		const [fileName, cuke] = result;
		return new LinkSuccess(cuke, gherk, fileName);
	}).toArray());
}

//#endregion
export { Cuke, CukeJar, CukeParser, GherkJar, LinkFailure, LinkSuccess, MonoGherk, MultiGherk, linkAll, parseGherkinDocument, toGherks };
//# sourceMappingURL=index.mjs.map