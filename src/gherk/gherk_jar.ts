import type { Gherk } from "./gherk.js";

export class GherkJar {
	private _fileMap: Map<string, Map<number, Gherk>> = new Map<
		string,
		Map<number, Gherk>
	>();

	public count(): number {
		return this._fileMap
			.values()
			.map((maps) => maps.size)
			.reduce((a: number, b: number) => a + b);
	}

	public all(): IteratorObject<[string, number, Gherk]> {
		return this._fileMap
			.entries()
			.flatMap(([fileName, map]) => 
					map.entries()
						.map(([lineNumber, gherk]) => [fileName, lineNumber, gherk]));
	}

	public ofFile(fileName: string): Map<number, Gherk> | undefined {
		return this._fileMap.get(fileName);
	}

	public updateFile(fileName: string, items: Gherk[]) {
		const gherkMap = new Map<number, Gherk>(
			items.map((gherk) => [gherk.line, gherk]),
		);
		this._fileMap.set(fileName, gherkMap);
	}

	public find(fileName: string, line: number): Gherk | undefined {
		return this._fileMap.get(fileName)?.get(line);
	}
}
