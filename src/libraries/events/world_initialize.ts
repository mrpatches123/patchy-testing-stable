import { system, world } from "@minecraft/server";
import { iterateObject } from "libraries/utilities";
class WorldInitializeEvent {
	protected currentSubscribeId = 0;
	protected subscriptions: Record<number, (() => void)> = {};
	protected currentSubscribes = 0;
	protected runId: number | undefined;
	subscribe(callback: () => void): number {
		const subscribeId = this.currentSubscribeId++;
		this.subscriptions[subscribeId] = callback;
		this.currentSubscribes++;
		this.subscribeSystem();
		return subscribeId;
	}
	subscribeSystem() {
		const thisWorldInit = this;
		if (this.runId) return;
		this.runId = system.runInterval(async () => {
			try {
				const player = world.getPlayers()[0];
				if (!player) return;
				const { successCount } = await player.runCommandAsync("testfor @s");
				if (!successCount) return;
				console.warn('world_initialised');
				iterateObject(thisWorldInit.subscriptions, (id, callback) => callback());
			} catch (error: any) {
				console.warn(error, error.stack);
			}
		});
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
export const worldInitialize = new WorldInitializeEvent();