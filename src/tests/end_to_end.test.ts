import * as fs from "fs";

import { CukeParser } from "../cuke/cuke_parser.js";
import { describe, expect, it } from "vitest";
import {
	parseGherkinDocument,
	type ParseResult,
	toGherks,
} from "../gherk/gherk_parser.js";
import { CukeJar } from "../cuke/cuke_jar.js";
import { GherkJar } from "../gherk/gherk_jar.js";
import { linkAll, LinkFailure, LinkSuccess } from "../linker.js";
import { logger } from "./logger.js";

const cukeJar = new CukeJar();
const gherkJar = new GherkJar();
const parser = CukeParser.instance;

const tests = [
	{
		cukeFileName: "wario_brothers.clj",
		gherkFileName: "wario_brothers.feature",
		expectedNumCukes: 7,
		expectedNumGherks: 7,
	},
	{
		cukeFileName: "chaos.clj",
		gherkFileName: "chaos.feature",
		expectedNumCukes: 20,
		expectedNumGherks: 20,
	},
];

describe("e2e", () => {
	it("populates the cuke jar", () => {
		for (const test of tests) {
			const sourceCode = fs.readFileSync(
				`./resources/${test.cukeFileName}`,
				"utf8",
			);
			const result = parser.parse(sourceCode);
			cukeJar.updateFile(test.cukeFileName, result);

			const count = cukeJar.ofFile(test.cukeFileName)?.toArray().length;

			expect(count).toBe(test.expectedNumCukes);
			logger.info(
				`Loaded ${cukeJar.count()} step(s) from ${test.cukeFileName}`,
			);
		}
	});

	it("populates the gherk jar", () => {
		for (const test of tests) {
			const sourceCode = fs.readFileSync(
				`./resources/${test.gherkFileName}`,
				"utf8",
			);
			const result: ParseResult = parseGherkinDocument(sourceCode);

			expect(result).toBeDefined();

			const gherks = toGherks(result.gherkinDocument!);
			gherkJar.updateFile(test.gherkFileName, gherks);

			const count = gherkJar.ofFile(test.gherkFileName)?.toArray().length;

			expect(count).toBe(test.expectedNumGherks);
		}
	});

	it("links wario_brothers gherks", () => {
		const test = tests[0]!;

		const gherks = gherkJar.ofFile(test.gherkFileName)?.toArray();
		expect(gherks).toBeDefined();

		const results = linkAll(cukeJar, gherks!);

		const success = results.filter((result) => result instanceof LinkSuccess);
		const failure = results.filter((result) => result instanceof LinkFailure);

		expect(failure).length(0, "Failed to link some steps");
		expect(success).length(7, "Failed to link some steps");
	});

	it("links chaos gherks", () => {
		const test = tests[1]!;

		const gherks = gherkJar.ofFile(test.gherkFileName)?.toArray();
		expect(gherks).toBeDefined();

		const results = linkAll(cukeJar, gherks!);

		const success = results.filter((result) => result instanceof LinkSuccess);
		const failure = results.filter((result) => result instanceof LinkFailure);

		expect(failure).length(5, "Failed to link some steps");
		expect(success).length(168, "Failed to link some steps");

		expect(
			failure.filter(
				(value) => value.expression === 'Waluigi consumes a "Garlic" power-up',
			).length,
		).toBe(5);
	});
});
