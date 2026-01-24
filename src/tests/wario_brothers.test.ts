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
  const cuke_fileName = "wario_brothers.clj"
  const gherk_fileName = "wario_brothers.feature"
    const parser = CukeParser.instance;

    beforeEach(() => {
  jest.resetModules();
});

describe('wario brothers test', () => {

  it('hold on,', async () => {
    await new Promise(r => setTimeout(r, 2000));
  })


  it('populates the cuke jar', () => {
    const sourceCode = fs.readFileSync(`./resources/${cuke_fileName}`,'utf8');

    const result = parser.parse(sourceCode);
    cukeJar.updateFile(cuke_fileName, result);

    logger.info(`Loaded ${cukeJar.count()} step(s) from ${cuke_fileName}`);
  })

  it('populates the gherk jar', () => {
    const sourceCode = fs.readFileSync(`./resources/${gherk_fileName}`,'utf8');

    const result: ParseResult = parseGherkinDocument(sourceCode);
    assert.notEqual(result, undefined, "Failed to parse gherkin doc")

    const gherks = toGherks(result.gherkinDocument!);
    gherkJar.updateFile(gherk_fileName, gherks);

    assert.equal(gherkJar.count(), 7)
  })

  it('links each gherk', () => {

    const gherks = gherkJar.all().toArray()
    const results = linkAll(cukeJar, gherks);

    const success = results.filter((result) => result instanceof LinkSuccess)
    const failure = results.filter((result) => result instanceof LinkFailure)

    logger.info(`Linked ${success.length} steps`)

    assert.equal(failure.length, 0, "Failed to link some steps")
    assert.equal(success.length, 7, "Failed to link some steps")
  })

})

