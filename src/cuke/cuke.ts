import type { SyntaxNode } from "tree-sitter";

function replaceGherkinSyntax(substring: string): string {
    switch (substring) {
        case "{int}": return "(\\d*?)"
        case "{double}": return "(\\d*?)"
        default: return "(.*)"
    }
}

const gherkinSyntaxRegex = /{.*?}/g

export class Cuke {
    expression: string;
    line: number;
    column: number


    constructor(expression: string, line: number, column: number) {

        // Convert gherkin syntax to regexp
        this.expression = expression.replaceAll(gherkinSyntaxRegex, replaceGherkinSyntax);
        this.line = line;
        this.column = column;
    }


    static fromSyntaxNode(node: SyntaxNode): Cuke {
        switch (node.type) {
            // Remove the quotation marks
            case "str_lit": {
                const text = node.text.slice(1, -1);
                return new Cuke(text, 0, 1);
            }
            // Remove the quotation marks and hash
            case "regex_lit": {
                const text = node.text.slice(2, -1);
                return new Cuke(text, 0, 1);
            }
            default: throw "undefined node type"
        }
    }

    public match(gherk: string): boolean {
        const regex: RegExp = new RegExp(this.expression)
        return regex.test(gherk)
    }
}
