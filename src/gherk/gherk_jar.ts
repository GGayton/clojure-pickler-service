import { Gherk } from "./gherk";

export class GherkJar {

    private _fileMap: Map<string, Map<number, Gherk>> = new Map<string, Map<number, Gherk>>();

    public count(): number {
        return this._fileMap
            .values()
            .map((maps) => maps.size)
            .reduce((a: number, b:number) => a + b);
    }
    
    public all(): IteratorObject<Gherk> {
        return this._fileMap
            .values()
            .flatMap((map) => map.values())
    }

    public ofFile(fileName: string): MapIterator<Gherk> | undefined {
        return this._fileMap
            .get(fileName)
            ?.values()
    }

    public updateFile(fileName: string, items: Gherk[]) {
        const gherkMap = new Map<number, Gherk>(items.map((gherk) => [gherk.line, gherk]))
        this._fileMap.set(fileName, gherkMap);
    }

    public find(fileName: string, line: number): Gherk | undefined {
        return this._fileMap.get(fileName)?.get(line)
    }

}