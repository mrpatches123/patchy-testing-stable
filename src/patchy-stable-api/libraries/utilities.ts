import { world, Player, Vector3 } from "@minecraft/server";

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