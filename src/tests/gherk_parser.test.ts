import { GherkinDocument } from "@cucumber/messages";
import { describe, expect, test } from "vitest";
import { toGherks } from "../gherk/gherk_parser.js";
import { GherkJar } from "../gherk/gherk_jar.js";
import { logger } from "./logger.js";

describe('gherk parser tests', () => {

    test('toGherk handles empty gherkin document', () => {
        const gherkJar = new GherkJar()
        const doc = new GherkinDocument();
        const gherks = toGherks(doc);
        gherkJar.updateFile("askldjhasd", gherks)
        expect(gherks).toBeDefined()
    })

    test('toGherk handles empty gherkin document', () => {
        const gherkJar = new GherkJar()
        const doc = new GherkinDocument();
        logger.info(doc)
        const gherks = toGherks(doc);
        gherkJar.updateFile("askldjhasd", gherks)
        expect(gherks).toBeDefined()
    })

})