import { Location } from "../common";

export interface Gherk extends Location {
    getExpressions(): Generator<string>
}


export class MonoGherk implements Gherk {
    expression: string;
    line: number;
    column: number;

    constructor(expression: string, line: number, column: number) {
        this.expression = expression;
        this.line = line;
        this.column = column;
    }

    *getExpressions(): Generator<string> {
        yield this.expression;
    }
}

export class MultiGherk implements Gherk {
    expressions: string[];
    line: number;
    column: number;

    constructor(expressions: string[], line: number, column: number){
        this.expressions = expressions
        this.line = line
        this.column = column
    }

    *getExpressions(): Generator<string> {
        yield* this.expressions
    }
}