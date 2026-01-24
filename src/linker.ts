import type { Cuke } from "./cuke/cuke.js";
import type { CukeJar } from "./cuke/cuke_jar.js";
import type { Gherk } from "./gherk/gherk.js";

export class LinkSuccess {
	cuke: Cuke;
	gherk: Gherk;
	fileName: string;

	constructor(cuke: Cuke, gherk: Gherk, fileName: string) {
		this.cuke = cuke;
		this.gherk = gherk;
		this.fileName = fileName;
	}
}

export class LinkFailure {
	gherk: Gherk;
	expression: string;

	constructor(gherk: Gherk, expression: string) {
		this.gherk = gherk;
		this.expression = expression;
	}
}

export type LinkResult = LinkSuccess | LinkFailure;

export function linkAll(cukeJar: CukeJar, gherks: Gherk[]): LinkResult[] {
	return gherks.flatMap((gherk) =>
		gherk
			.getExpressions()
			.map((expr) => {
				const result = cukeJar.find(expr);

				if (result === undefined) {
					return new LinkFailure(gherk, expr);
				}

				const [fileName, cuke] = result;
				return new LinkSuccess(cuke, gherk, fileName);
			})
			.toArray(),
	);
}
