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