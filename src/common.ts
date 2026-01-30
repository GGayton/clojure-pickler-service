export interface Location {
	line: number;
	column: number;
}

// Obtained from https://stackoverflow.com/questions/72057193/how-to-do-cartesian-product-with-typescript
type ElementType<A> = A extends ReadonlyArray<infer T> ? T : never;
type ElementsOfAll<
	Inputs,
	R extends ReadonlyArray<unknown> = [],
> = Inputs extends readonly [infer F, ...infer M]
	? ElementsOfAll<M, [...R, ElementType<F>]>
	: R;
type CartesianProduct<Inputs> = ElementsOfAll<Inputs>[];
export function cartesianProduct<
	Sets extends ReadonlyArray<ReadonlyArray<unknown>>,
>(sets: Sets): CartesianProduct<Sets> {
	return sets.reduce((a, b) =>
		a.flatMap((d) => b.map((e) => [d, e].flat())),
	) as CartesianProduct<Sets>;
}
