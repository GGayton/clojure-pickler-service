import { AstBuilder, Errors, GherkinClassicTokenMatcher, Parser } from '@cucumber/gherkin'
import { Examples, GherkinDocument, IdGenerator, Step } from '@cucumber/messages'
import { Gherk, MonoGherk, MultiGherk } from './gherk'

const uuidFn = IdGenerator.uuid()

export type ParseResult = {
  gherkinDocument?: GherkinDocument
  error?: Errors.GherkinException
}

/**
 * Incrementally parses a Gherkin Document, allowing some syntax errors to occur.
 */
export function parseGherkinDocument(gherkinSource: string): ParseResult {
  const builder = new AstBuilder(uuidFn)
  const matcher = new GherkinClassicTokenMatcher()
  const parser = new Parser(builder, matcher)
  return {
    gherkinDocument: parser.parse(gherkinSource),
  }
  //try {
  //  return {
  //    gherkinDocument: parser.parse(gherkinSource),
  //  }
  //} catch (error) {
  //  let gherkinDocument: GherkinDocument
  //
  //  for (let i = 0; i < 10; i++) {
  //    gherkinDocument = builder.getResult()
  //    if (gherkinDocument) {
  //      return {
  //        gherkinDocument,
  //        error,
  //      }
  //    }
  //
  //    try {
  //      builder.endRule()
  //    } catch (ignore) {
  //      // no-op
  //    }
  //  }
  //
  //  return {
  //    error,
  //  }
  //}
}

// Extract headers from regexes
const headerRegex = new RegExp("(?<=<).*?(?=>)", "g");

export function toGherks(doc: GherkinDocument): Array<Gherk> {

  const gherks: Array<Gherk> | undefined = doc
    ?.feature
    ?.children
    ?.map((value) => value?.scenario)
    ?.filter((value) => value != undefined)
    ?.flatMap((value) => {
      switch (value.keyword) {
        case "Scenario Outline": return value.steps.map((step) => toGherk(step, value.examples[0]!))
        case "Scenario": return value.steps.map((step) => toMonoGherk(step));
        default: return value.steps.map((step) => toMonoGherk(step))
      }
    })
    ?.filter((value) => value != undefined)

  return gherks!
}

function toMonoGherk(step: Step) {
  return new MonoGherk(
    step.text, 
    step.location.line,
    step.location.column ?? 0)
}

type TableMatch = [match: string, index: number]

function toGherk(step: Step, table: Examples): Gherk | undefined {
  
  const matches: TableMatch[] = step
    .text
    .matchAll(headerRegex)
    .flatMap((value) => 
      value.map((match) => 
        <TableMatch>[match, table
          .tableHeader!
          .cells
          .findIndex((value) => value.value == match)]))
    .toArray()

  // this step does not contain <.*?> -> fallback to standard
  if (matches.length == 0) return toMonoGherk(step)
  
  if (matches.filter((value) => value[1] == -1).length != 0) return undefined;
  if(table.tableHeader == undefined) return undefined;

  return new MultiGherk(
    table.
      tableBody
      .map((value) =>
        // Replace all the <.*?> matches with data
        matches.reduce((expression, [match, index]) => 
          expression.replace(`<${match}>`, value.cells[index]?.value ?? "<??>"), step.text)
        ),
      step.location.line,
      step.location.column ?? 0
     )
}