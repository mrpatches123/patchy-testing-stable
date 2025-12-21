import { Dimension, system, Vector3, world } from "@minecraft/server";
import { customEvents } from "patchy-stable-api/libraries/events";
import { overworld, systemRunIntervalAwaitCallback } from "patchy-stable-api/libraries/utilities";
import { Vector } from "patchy-stable-api/libraries/vector";
function* draw(dimension: Dimension, postion: Vector3, resolve: (value: unknown) => void) {
	const chunkX = Math.floor(postion.x / 16);
	const chunkY = Math.floor(postion.y / 16);
	const chunkZ = Math.floor(postion.z / 16);
	for (let x = chunkX * 16; x <= (chunkX + 1) * 16; x++) {
		for (let y = chunkY * 16; y <= (chunkY + 1) * 16; y++) {
			dimension.spawnParticle("minecraft:endrod", { x, y, z: chunkZ * 16 });
			yield;
		}
	}
	for (let x = chunkX * 16; x <= (chunkX + 1) * 16; x++) {
		for (let y = chunkY * 16; y <= (chunkY + 1) * 16; y++) {
			dimension.spawnParticle("minecraft:endrod", { x, y, z: (chunkZ + 1) * 16 });
			yield;
		}
	}
	for (let z = chunkZ * 16; z <= (chunkZ + 1) * 16; z++) {
		for (let y = chunkY * 16; y <= (chunkY + 1) * 16; y++) {
			dimension.spawnParticle("minecraft:endrod", { x: chunkX * 16, y, z });
			yield;
		}
	}
	for (let z = chunkZ * 16; z <= (chunkZ + 1) * 16; z++) {
		for (let y = chunkY * 16; y <= (chunkY + 1) * 16; y++) {
			dimension.spawnParticle("minecraft:endrod", { x: (chunkX + 1) * 16, y, z });
			yield;
		}
	}
	resolve(null);


}
let cancelChunkSystem: (() => void) | undefined;
export function unsubscribeChunkSystem() {
	cancelChunkSystem?.();
	cancelChunkSystem = undefined;
}
export function subscribeChunkSystem() {
	if (cancelChunkSystem) return;
	cancelChunkSystem = systemRunIntervalAwaitCallback(async () => {
		const players = world.getPlayers({ scoreOptions: [{ objective: "showChunks", maxScore: 1, minScore: 1 }] });
		if (!players.length) {
			unsubscribeChunkSystem();
			return;
		}
		for (const player of players) {
			if (!player || !player.isValid) continue;
			await new Promise((resolve) => {
				system.runJob(draw(player.dimension, player.location, resolve));
			});
		}
	}, 20);
};
customEvents.playerJoined.subscribe(() => {
	subscribeChunkSystem();
});