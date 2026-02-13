import * as fs from "node:fs";
import { describe, expect, it } from "vitest";
import { CukeJar } from "../cuke/cuke_jar.js";
import { CukeParser } from "../cuke/cuke_parser.js";
import { GherkJar } from "../gherk/gherk_jar.js";
import {
	type ParseResult,
	parseGherkinDocument,
	toGherks,
} from "../gherk/gherk_parser.js";
import { LinkFailure, LinkSuccess, linkAll } from "../linker.js";
import { logger } from "./logger.js";
import { testData } from "./test_data.js";

const cukeJar = new CukeJar();
const gherkJar = new GherkJar();
const parser = CukeParser.instance;

describe("e2e", () => {
	it("populates the cuke jar", () => {
		for (const test of testData) {
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
		for (const test of testData) {
			const sourceCode = fs.readFileSync(
				`./resources/${test.gherkFileName}`,
				"utf8",
			);
			const result: ParseResult = parseGherkinDocument(sourceCode);

			expect(result).toBeDefined();

			const gherks = toGherks(result.gherkinDocument!);
			gherkJar.updateFile(test.gherkFileName, gherks);

			const count = gherkJar
				.ofFile(test.gherkFileName)
				?.values()
				.toArray().length;

			expect(count).toBe(test.expectedNumGherks);
		}
	});

	it("links wario_brothers gherks", () => {
		const test = testData[0]!;

		const gherks = gherkJar.ofFile(test.gherkFileName)?.values()?.toArray();
		expect(gherks).toBeDefined();

		const results = linkAll(cukeJar, gherks!);

		const success = results.filter((result) => result instanceof LinkSuccess);
		const failure = results.filter((result) => result instanceof LinkFailure);

		expect(failure).length(0, "Failed to link some steps");
		expect(success).length(7, "Failed to link some steps");
	});

	it("links chaos gherks", () => {
		const test = testData[1]!;

		const gherks = gherkJar.ofFile(test.gherkFileName)?.values()?.toArray();
		expect(gherks).toBeDefined();

		const results = linkAll(cukeJar, gherks!);

		const success = results.filter((result) => result instanceof LinkSuccess);
		const failure = results.filter((result) => result instanceof LinkFailure);

		expect(failure).length(5, "Failed to link some steps");
		expect(success).length(185, "Failed to link some steps");

		expect(
			failure.filter(
				(value) => value.expression === 'Waluigi consumes a "Garlic" power-up',
			).length,
		).toBe(5);
	});

	it("retrieves gherks via line num", () => {
		for (const test of testData) {
			const parsedLineNums = gherkJar
				.ofFile(test.gherkFileName)
				?.keys()
				?.toArray()
				.sort((a, b) => a - b);

			const expectedLineNums = test.gherkPositions.sort((a, b) => a - b);

			expect(parsedLineNums).toEqual(expectedLineNums);
		}
	});

	it("cuke line numbers are expected", () => {
		for (const test of testData) {
			const parsedLineNums = cukeJar
				.ofFile(test.cukeFileName)
				?.map((cuke) => cuke.line)
				?.toArray()
				.sort((a, b) => a - b);

			const expectedLineNums = test.cukePositions
				.map((cuke) => cuke.lineStart)
				.sort((a, b) => a - b);

			expect(parsedLineNums).toEqual(expectedLineNums);
		}
	});
});
