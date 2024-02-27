import { Player, system, world } from "@minecraft/server";
import { worldInitialise } from "./world_init";
import { fixPlayerScore } from "./utilities";

class PlayerJoinedEvent {
	subscriptions: ((data: { player: Player; }) => void)[] = [];
	subscribe(callback: (data: { player: Player; }) => void): void {
		this.subscriptions.push(callback);
	}
	loads: Record<string, boolean> = {};
	constructor() {
		worldInitialise.subscribe(() => {
			world.getPlayers().forEach((player) => {
				this.runEvent(player);
			});
		});
		world.afterEvents.playerSpawn.subscribe((event) => {
			this.runEvent(event.player);
		});
		world.afterEvents.playerLeave.subscribe((event) => {
			delete this.loads[event.playerId];
		});
	}
	runEvent(player: Player) {
		if (player.id in this.loads) return;
		fixPlayerScore(player);
		this.loads[player.id] = true;
		this.subscriptions.forEach((callback) => callback({ player }));
	}
}
export const playerJoined = new PlayerJoinedEvent();