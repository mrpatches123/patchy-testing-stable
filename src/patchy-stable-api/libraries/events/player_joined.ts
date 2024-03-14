import { Player, system, world } from "@minecraft/server";
import { fixPlayerScore, iterateObject } from "../utilities";
import { worldInitialize } from "./world_initialize";
class PlayerJoinedEvent {
	protected currentSubscribeId = 0;
	protected subscriptions: Record<number, ((data: { player: Player; }) => void)> = {};
	protected currentSubscribes = 0;
	protected runId: number | undefined;
	protected loads: Record<string, boolean> = {};
	subscribe(callback: ((data: { player: Player; }) => void)): number {
		const subscribeId = this.currentSubscribeId++;
		this.subscriptions[subscribeId] = callback;
		this.currentSubscribes++;
		this.subscribeSystem();
		return subscribeId;
	}
	subscribeSystem() {
		worldInitialize.subscribe(() => {
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
		iterateObject(this.subscriptions, (id, callback) => callback({ player }));
	}
	unsubscribeSystem() {
		if (!this.runId) return;
		system.clearRun(this.runId);
		this.runId = undefined;
	}
	unsubscribe(id: number): void {
		if (--this.currentSubscribes <= 0) {
			this.unsubscribeSystem();
		}
		delete this.subscriptions[id];
	}
}
export const playerJoined = new PlayerJoinedEvent();