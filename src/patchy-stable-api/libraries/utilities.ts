import { world, Player, Vector3, system } from "@minecraft/server";

export const overworld = world.getDimension("overworld");
export const nether = world.getDimension("nether");
export const end = world.getDimension("the_end");
try {
	world.scoreboard.addObjective("test");
} catch (e) { }
export function fixPlayerScore(player: Player) {
	if (!player.scoreboardIdentity)
		player.runCommand('scoreboard players set @s test 0');
}
export function iterateObject<T extends Record<string, any>>(obj: T, callback: (key: keyof T, value: T[keyof T], i: number) => void) {
	let i = 0;
	const objectPrototype = Object.getPrototypeOf({});
	for (const key in obj) {
		if (key in objectPrototype) continue;
		callback(key, obj[key], i++);
	}
}
export function isDefined<T>(value: T | undefined): value is T {
	return value !== undefined && value !== null && typeof value !== 'number' || Number.isFinite(value);
}
export function isVector3(value: any): value is Vector3 {
	return typeof value.x === 'number' && typeof value.y === 'number' && typeof value.z === 'number';
}
export function chunkString(str: string, length: number) {
	let size = (str.length / length) | 0;
	const array: string[] = Array(++size);
	for (let i = 0, offset = 0; i < size; i++, offset += length) {
		array[i] = str.substr(offset, length);
	}
	return array;
}
export function parseCommand(message: string, prefix: string) {
	const messageLength = message.length;
	let finding: boolean | string = false;
	let braceCount = [0, 0], bracketCount = [0, 0], quoteCount = 0, spaceCount = 0;
	let started = false;
	let o = 0;
	const output = [];
	for (let i = prefix.length; i < messageLength; i++) {
		const char = message[i];
		switch (char) {
			case '{':
				switch (finding) {
					case 'json':
						break;
					default:
						braceCount = [0, 0], bracketCount = [0, 0], quoteCount = 0, spaceCount = 0, finding = false;
						output.push('');
						o++;
						finding = 'json';
						break;

				}
				output[o] += char;
				braceCount[0]++;
				break;
			case '}':
				output[o] += char;
				if (braceCount[0] !== ++braceCount[1] || bracketCount[0] !== bracketCount[1] || (quoteCount && quoteCount & 1)) break;
				braceCount = [0, 0], bracketCount = [0, 0], quoteCount = 0, spaceCount = 0, finding = false;
				break;
			case ']':
				output[o] += char;
				if (bracketCount[0] !== ++bracketCount[1] || braceCount[0] !== braceCount[1] || (quoteCount && quoteCount & 1)) break;
				braceCount = [0, 0], bracketCount = [0, 0], quoteCount = 0, spaceCount = 0, finding = false;
				break;
			case '"':
				switch (finding) {
					case 'json':
						output[o] += char;
						break;
					default:
						braceCount = [0, 0], bracketCount = [0, 0], quoteCount = 0, spaceCount = 0, finding = false;
						finding = 'string';
					case 'string':
						if (!(++quoteCount & 1)) { finding = false; break; };
						if (!output[o].length) break;
						output.push('');
						o++;
						break;
				}
				break;
			case '[':
				switch (finding) {
					case 'json':
						break;
					default:
						output.push('');
						o++;
						finding = 'json';
						break;

				}
				output[o] += char;
				bracketCount[0]++;
				break;
			case ' ':
				switch (finding) {
					case 'string':
					case 'json':
						if (!(quoteCount & 1)) break;
						output[o] += char;
						break;
					default:
						const nextChar = message?.[i + 1];
						switch (nextChar) {
							case ' ':
							case '[':
							case '{':
							case '"':
								break;
							default:
								output.push('');
								o++;
								finding = 'word';
								break;
						}
						break;
				}
				break;
			default:
				if (!started) {
					started = true;
					finding = 'word';
					output.push('');
					spaceCount = 1;
				}
				switch (char) {
					case '@':
						if (finding === 'string') {
							output[o] += char;
							break;
						}
						const nextChar = message?.[i + 1];
						switch (nextChar) {
							case '"':
								break;
							default:
								const afterNextChar = message?.[i + 2];
								switch (afterNextChar) {
									case ' ':
										finding = 'string';
										output[o] += char;
										break;
									case '[':
										finding = 'json';
										output[o] += char;
										break;

								}
								break;
						}
						break;
					default:
						output[o] += char;
						break;
				}

				break;
		}
	}
	return output;
}
export async function sleep(ticks?: number): Promise<undefined> {
	return new Promise((resolve) => system.runTimeout(() => resolve(undefined), ticks));

}
