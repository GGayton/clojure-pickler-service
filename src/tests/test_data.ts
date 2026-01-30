export class Position {
	lineStart: number;

	constructor(lineStart: number) {
		this.lineStart = lineStart;
	}
}

export const testData = [
	{
		cukeFileName: "wario_brothers.clj",
		gherkFileName: "wario_brothers.feature",
		expectedNumCukes: 7,
		expectedNumGherks: 7,
		cukePositions: [
			new Position(2),
			new Position(5),
			new Position(8),
			new Position(11),
			new Position(14),
			new Position(17),
			new Position(20),
		],
		gherkPositions: [5, 6, 7, 8, 9, 10, 11],
	},
	{
		cukeFileName: "chaos.clj",
		gherkFileName: "chaos.feature",
		expectedNumCukes: 20,
		expectedNumGherks: 20,
		cukePositions: [
			new Position(21),
			new Position(24),
			new Position(27),
			new Position(31),
			new Position(35),
			new Position(41),
			new Position(46),
			new Position(50),
			new Position(53),
			new Position(56),
			new Position(60),
			new Position(63),
			new Position(66),
			new Position(69),
			new Position(72),
			new Position(75),
			new Position(78),
			new Position(81),
			new Position(84),
			new Position(87),
		],
		gherkPositions: [
			4, 5, 6, 7, 8, 10, 11, 12, 13, 14, 16, 17, 18, 19, 20, 22, 23, 24, 25, 26,
		],
	},
];
