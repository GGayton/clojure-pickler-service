import type { Location } from "../common.js";

export abstract class Gherk implements Location {
	/** The raw gherk, may include <> */
	text: string;

	/** Keyword used to this gherk */
	keyword: string;

	/** The line number (0-indexed) of the gherk */
	line: number;

	column: number;

	constructor(keyword: string, text: string, line: number, column: number) {
		this.keyword = keyword;
		this.text = text;
		this.line = line;
		this.column = column;
	}
	
	/** Get all expressions, resolving all <> */
	abstract getExpressions(): Generator<string>;

	public get length(): number {
		return this.text.length + this.keyword.length;
	}
}

export class MonoGherk extends Gherk {
	*getExpressions(): Generator<string> {
		yield this.text;
	}
}

export class MultiGherk extends Gherk {
	expressions: string[];

	constructor(text: string, keyword:string, expressions: string[], line: number, column: number) {
		super(text, keyword, line, column)
		this.expressions = expressions;
	}

	*getExpressions(): Generator<string> {
		yield* this.expressions;
	}
}
