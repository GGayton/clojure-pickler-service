import {
	AstBuilder,
	Errors,
	GherkinClassicTokenMatcher,
	Parser,
} from "@cucumber/gherkin";
import {
	type Examples,
	type GherkinDocument,
	IdGenerator,
	type Step,
} from "@cucumber/messages";
import { type Gherk, MonoGherk, MultiGherk } from "./gherk.js";

const uuidFn = IdGenerator.uuid();

export type ParseResult = {
	gherkinDocument?: GherkinDocument;
	error?: Errors.GherkinException;
};

/**
 * Incrementally parses a Gherkin Document, allowing some syntax errors to occur.
 */
export function parseGherkinDocument(gherkinSource: string): ParseResult {
	const builder = new AstBuilder(uuidFn);
	const matcher = new GherkinClassicTokenMatcher();
	const parser = new Parser(builder, matcher);
	try {
		return {
			gherkinDocument: parser.parse(gherkinSource),
		};
	} catch (error: unknown) {
		if (error instanceof Errors.GherkinException) {
			return {
				error: error,
			};
		}

		throw error;
	}
}

// Extract headers from regexes
const headerRegex = /(?<=<).*?(?=>)/g;

export function toGherks(doc: GherkinDocument): Array<Gherk> {
	// Handle empty documents
	if (!doc?.feature?.children) return [];

	return doc.feature.children
		.map((value) => value.scenario)
		.filter((scenario) => scenario !== undefined)
		.flatMap((scenario) => {
			// Line numbers are zero-indexed in clojure-pickler-service,
			// but the parser isn't
			const adjustedSteps = scenario.steps.map((step) => ({
				...step,
				location: { ...step.location, line: step.location.line - 1 },
			}));

			if (scenario.keyword === "Scenario Outline") {
				return adjustedSteps.map((step) => toGherk(step, scenario.examples));
			} else if (scenario.keyword === "Scenario") {
				return adjustedSteps.map((step) => toMonoGherk(step));
			} else {
				return undefined;
			}
		})
		.filter((value) => value !== undefined);
}

function toMonoGherk(step: Step) {
	return new MonoGherk(
		step.text,
		step.location.line,
		step.location.column ?? 0,
	);
}

type TableMatch = [match: string, table: Examples, index: number];

function toGherk(step: Step, tables: readonly Examples[]): Gherk | undefined {
	/// Ensure all tables have headers
	if (tables.some((table) => table.tableHeader === undefined)) return undefined;

	/// Fallback to mono in the case the examples table is empty
	if (tables.length === 0) {
		return toMonoGherk(step);
	}

	// Matches all placeholders in the text
	const regexMatches = step.text.matchAll(headerRegex).toArray();

	// this step does not contain <.*?> -> fallback to standard
	if (regexMatches.length === 0) return toMonoGherk(step);

	const matches: TableMatch[][] = tables.map((table) =>
		regexMatches
			// Map against the tables' headers
			.flatMap((value) =>
				value.map(
					// map for each table available
					(match) =>
						<TableMatch>[
							match,
							table,
							// biome-ignore lint/style/noNonNullAssertion: We have already asserted this is notnull
							table.tableHeader!.cells.findIndex(
								(value) => value.value === match,
							),
						],
				),
			),
	);

	// Check we found an index across all tables and <.*?>
	if (matches.some((matches) => matches.some((value) => value[2] === -1)))
		return undefined;

	return new MultiGherk(
		tables.flatMap((table, tableIndex) =>
			table.tableBody.map((value) =>
				// Replace all the <.*?> matches with data

				// biome-ignore lint/style/noNonNullAssertion: We have already asserted this is notnull
				matches
					.at(tableIndex)!
					.reduce(
						(expression, [match, , index]) =>
							expression.replace(
								`<${match}>`,
								value.cells[index]?.value ?? "<??>",
							),
						step.text,
					),
			),
		),
		step.location.line,
		step.location.column ?? 0,
	);
}
