import * as fs from 'fs';
import { CukeParser } from '../cuke/cuke_parser'
import { parseGherkinDocument, ParseResult, toGherks } from '../gherk/gherk_parser';
import { CukeJar } from '../cuke/cuke_jar';
import assert from 'assert';
import { GherkJar } from '../gherk/gherk_jar';
import { linkAll, LinkFailure, LinkSuccess } from '../linker';
import { logger } from '../logger';


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
    expectedNumCukes: 7,
    expectedNumGherks: 20,
  }
]


describe('e2e', () => {

  it('populates the cuke jar', () => {

    for (const test of tests) {
      const sourceCode = fs.readFileSync(`./resources/${test.cukeFileName}`, 'utf8');
      const result = parser.parse(sourceCode);
      cukeJar.updateFile(test.cukeFileName, result);

      assert.equal(cukeJar.count(), test.expectedNumCukes)
      logger.info(`Loaded ${cukeJar.count()} step(s) from ${test.cukeFileName}`);
    }
  })

  it('populates the gherk jar', () => {
    for (const test of tests) {
      const sourceCode = fs.readFileSync(`./resources/${test.gherkFileName}`, 'utf8');
      const result: ParseResult = parseGherkinDocument(sourceCode);

      assert.notEqual(result, undefined, "Failed to parse gherkin doc")

      const gherks = toGherks(result.gherkinDocument!);
      gherkJar.updateFile(test.gherkFileName, gherks);

      assert.equal(gherkJar.count(), test.expectedNumGherks)
    }
  })

  it('links wario_brothers gherks', () => {

    const test = tests[0]!;

    const gherks = gherkJar.ofFile(test.gherkFileName)?.toArray();
    assert.notEqual(gherks, undefined, "Failed to get gherks");

    const results = linkAll(cukeJar, gherks!);

    const success = results.filter((result) => result instanceof LinkSuccess)
    const failure = results.filter((result) => result instanceof LinkFailure)

    assert.equal(failure.length, 5, "Failed to link some steps")
    assert.equal(success.length, 168, "Failed to link some steps")

    assert(failure
      .map((value) => value.expression == "Waluigi consumes a \"Garlic\" power-up")
      .length
      ==
      5
    )
  })
})

