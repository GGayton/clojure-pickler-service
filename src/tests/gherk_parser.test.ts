import * as fs from "node:fs";
import { GherkinDocument } from "@cucumber/messages";
import { describe, expect, test } from "vitest";
import { GherkJar } from "../gherk/gherk_jar.js";
import {
	type ParseResult,
	parseGherkinDocument,
	toGherks,
} from "../gherk/gherk_parser.js";
import { logger } from "./logger.js";

describe("gherk parser tests", () => {
	test("toGherk handles empty gherkin document", () => {
		const gherkJar = new GherkJar();
		const doc = new GherkinDocument();
		const gherks = toGherks(doc);
		gherkJar.updateFile("askldjhasd", gherks);
		expect(gherks).toBeDefined();
	});

	test("gherk parser handles invalid document", () => {
		const sourceCode = fs.readFileSync("./resources/broken.feature", "utf8");
		const result: ParseResult = parseGherkinDocument(sourceCode);

		expect(result?.error).toBeDefined();
	});
});
