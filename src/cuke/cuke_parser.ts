import Parser, { Query } from "tree-sitter";
import language from "tree-sitter-clojure-orchard";
import { Cuke } from "./cuke.js";

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

const stringLiteralQuery = new Query(
	language as Parser.Language,
	stringLiteralQuerySource,
);
const regexLiteralQuery = new Query(
	language as Parser.Language,
	regexLiteralQuerySource,
);

//const stuff = `(
//	(kwd_lit
//		namespace: (kwd_ns) @ns (#eq? @ns "cucumber")
//   		name: (kwd_name) @name (#eq? @name "parameter-types"))
//    (vec_lit
//    	value: (ns_map_lit
//        	prefix: (kwd_lit) @param_kwd (#eq? @param_kwd  ":cucumber.parameter")
//            ) @param
//        )@root
//)`;

const parser = new Parser();
parser.setLanguage(language as Parser.Language);

export class CukeParser {
	static #instance: CukeParser;

	/**
	 * The Singleton's constructor should always be private to prevent direct
	 * construction calls with the `new` operator.
	 */
	private constructor() {}

	/**
	 * The static getter that controls access to the singleton instance.
	 *
	 * This implementation allows you to extend the Singleton class while
	 * keeping just one instance of each subclass around.
	 */
	public static get instance(): CukeParser {
		if (!CukeParser.#instance) {
			CukeParser.#instance = new CukeParser();
		}

		return CukeParser.#instance;
	}

	parse(src: string): Array<Cuke> {
		const tree = parser.parse(src);

		if (!tree.rootNode) {
			throw new Error("ruh roh");
		}
		if (!stringLiteralQuery) throw new Error("Query is missing");
		if (typeof stringLiteralQuery.matches !== "function")
			throw new Error("matches is not a function");

		const stringLiteralMatches = stringLiteralQuery.matches(tree.rootNode);
		const regexLiteralMatches = regexLiteralQuery.matches(tree.rootNode);

		return stringLiteralMatches
			.concat(regexLiteralMatches)
			.map(this.nodesToStepDefinition);
	}

	nodesToStepDefinition(match: Parser.QueryMatch): Cuke {
		const capture = match.captures.find(
			(capture) => capture.name === "expression",
		);

		if (capture === undefined) {
			throw new Error(
				"tree-sitter node does not have an 'expression' group on it",
			);
		}

		return Cuke.fromSyntaxNode(capture.node);
	}
}
