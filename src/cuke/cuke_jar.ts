import { Cuke } from "./cuke"

export class CukeJar {

    private _file_map: Map<string, Cuke[]> = new Map<string, Cuke[]>();

    public count(): number {
        return this._file_map
            .values()
            .map((x: Cuke[]) => x.length)
            .reduce((a: number, b:number) => a + b);
    }

    public all(): IteratorObject<[string, Cuke]> {
        return this._file_map
            .entries()
            .flatMap(([fileName, items]) =>
                items.map((item) => [fileName, item]));
    }

    public values(): IteratorObject<Cuke> {
        return this._file_map
            .values()
            .flatMap((value) => value);
    }

    public updateFile(fileName: string, items: Cuke[]) {
        this._file_map.set(fileName, items);
    }

    public find(gherk: string): [string, Cuke] | undefined {
        return this
            .all()
            .find(([, cuke]) => cuke.match(gherk))
    }
}