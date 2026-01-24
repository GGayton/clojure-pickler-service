import { Cuke } from "./cuke/cuke";
import { CukeJar } from "./cuke/cuke_jar";
import { Gherk } from "./gherk/gherk";

export class LinkSuccess {
    cuke: Cuke;
    gherk: Gherk;
    fileName: string;

    constructor(cuke: Cuke, gherk: Gherk, fileName: string) {
        this.cuke = cuke;
        this.gherk = gherk;
        this.fileName = fileName;
    }
}

export class LinkFailure {
    gherk: Gherk;
    expression: string;

    constructor(gherk: Gherk, expression: string) {
        this.gherk = gherk;
        this.expression = expression;
    }
}

export type LinkResult = 
    | LinkSuccess
    | LinkFailure

export function linkAll(cukeJar: CukeJar, gherks: Gherk[]): LinkResult[] {
    return gherks
        .map((gherk) => 
          gherk
            .getExpressions()
            .map((expr) => {
                const result = cukeJar.find(expr);

                if (result == undefined) {
                    return new LinkFailure(
                        gherk,
                        expr
                    )
                }

                const [fileName, cuke] = result;
                return new LinkSuccess(
                    cuke,
                    gherk,
                    fileName
                )
            })
            .toArray())
        .flat()
}