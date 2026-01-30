import type { Cuke } from "./cuke.js";

export class CukeJar {
	private _fileMap: Map<string, Cuke[]> = new Map<string, Cuke[]>();

	public count(): number {
		return this._fileMap
			.values()
			.map((x: Cuke[]) => x.length)
			.reduce((a: number, b: number) => a + b);
	}

	public all(): IteratorObject<[string, Cuke]> {
		return this._fileMap
			.entries()
			.flatMap(([fileName, items]) => items.map((item) => [fileName, item]));
	}

	public ofFile(fileName: string): MapIterator<Cuke> | undefined {
		return this._fileMap.get(fileName)?.values();
	}

	public values(): IteratorObject<Cuke> {
		return this._fileMap.values().flatMap((value) => value);
	}

	public updateFile(fileName: string, items: Cuke[]) {
		this._fileMap.set(fileName, items);
	}

	public find(gherk: string): [string, Cuke] | undefined {
		return this.all().find(([, cuke]) => cuke.match(gherk));
	}
}
