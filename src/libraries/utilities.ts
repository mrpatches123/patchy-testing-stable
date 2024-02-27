import { world, Player } from "@minecraft/server";

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